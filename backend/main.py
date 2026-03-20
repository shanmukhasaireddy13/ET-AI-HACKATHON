"""
FastAPI application for the LangGraph-based agent platform.
"""
from __future__ import annotations

import logging
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from config import AppConfig, load_config
from core.orchestrator import AgentOrchestrator
from database import SessionLocal, init_db
from graph.runtime import MeetingGraphRuntime
from persistence.memory_store import BaseMemoryStore, create_memory_store
from persistence.relational import RelationalRepository
from schemas import (
    ApprovalDecisionSchema,
    ApprovalSchema,
    AuditLogSchema,
    AuditSummarySchema,
    DashboardMeetingSchema,
    ErrorSchema,
    ExecutionProposalSchema,
    MemoryInspectionResponse,
    MeetingRunResponse,
    ProcessMeetingRequest,
    ProcessMeetingResponse,
    RunSnapshotResponse,
    TaskSchema,
    WorkflowSchema,
)


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

config: AppConfig = load_config()
memory_store: BaseMemoryStore | None = None
orchestrator: AgentOrchestrator | None = None


def get_repository() -> RelationalRepository:
    session = SessionLocal()
    return RelationalRepository(session=session, config=config)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global memory_store, orchestrator
    logger.info("AutoExec AI Engine starting")
    init_db()
    memory_store = create_memory_store(config)
    runtime = MeetingGraphRuntime(config)
    orchestrator = AgentOrchestrator(config=config, runtime=runtime, memory_store=memory_store)
    logger.info("Runtime initialized")
    yield
    logger.info("AutoExec AI Engine stopped")


app = FastAPI(
    title=config.app_name,
    version="2.0.0",
    description="LangGraph-first meeting automation backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": config.app_name,
        "llm_mode": config.classifier_mode,
        "llm_provider": config.llm_provider,
    }


@app.post("/api/meetings/process", response_model=ProcessMeetingResponse)
async def process_meeting(
    request: ProcessMeetingRequest,
    x_request_id: Optional[str] = Header(None),
):
    if orchestrator is None:
        raise HTTPException(status_code=500, detail="Orchestrator is not initialized")

    request_id = x_request_id or str(uuid.uuid4())
    meeting_id = request.meeting_id or f"meeting-{uuid.uuid4()}"

    repository = get_repository()
    try:
        state = await orchestrator.process_meeting(
            meeting_id=meeting_id,
            transcript=request.transcript,
            request_id=request_id,
            repository=repository,
        )
        return _build_process_response(state)
    except Exception as exc:
        logger.exception("Meeting processing failed")
        raise HTTPException(status_code=500, detail=f"Meeting processing failed: {exc}")
    finally:
        repository.session.close()


@app.get("/api/meetings/{meeting_id}/runs/latest", response_model=MeetingRunResponse)
async def get_latest_run(meeting_id: str):
    repository = get_repository()
    try:
        meeting = repository.get_meeting(meeting_id)
        run = repository.get_latest_run(meeting_id)
        if not meeting or not run:
            raise HTTPException(status_code=404, detail="Meeting run not found")
        return MeetingRunResponse(
            meeting_id=meeting.id,
            run_id=run.id,
            status=run.status,
            current_stage=run.current_stage,
            transcript=meeting.transcript,
        )
    finally:
        repository.session.close()


@app.get("/api/workflows/{meeting_id}", response_model=list[WorkflowSchema])
async def get_workflows(meeting_id: str):
    repository = get_repository()
    try:
        return [_workflow_model_to_schema(workflow) for workflow in repository.list_workflows(meeting_id)]
    finally:
        repository.session.close()


@app.get("/api/tasks/{meeting_id}", response_model=list[TaskSchema])
async def get_tasks(meeting_id: str):
    repository = get_repository()
    try:
        return [_task_model_to_schema(task) for task in repository.list_tasks(meeting_id)]
    finally:
        repository.session.close()


@app.get("/api/approvals", response_model=list[ApprovalSchema])
async def get_approvals(
    meeting_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    repository = get_repository()
    try:
        approvals = repository.list_approvals(meeting_id=meeting_id, status=status)
        return [_approval_model_to_schema(approval) for approval in approvals]
    finally:
        repository.session.close()


@app.post("/api/approvals/{task_id}/decision", response_model=ApprovalSchema)
async def submit_approval_decision(task_id: str, decision: ApprovalDecisionSchema):
    repository = get_repository()
    try:
        approval = repository.set_approval_decision(
            task_id=task_id,
            status=decision.status,
            approved_by=decision.approved_by,
            feedback=decision.feedback,
        )
        if approval is None:
            raise HTTPException(status_code=404, detail="Approval not found")
        return _approval_model_to_schema(approval)
    finally:
        repository.session.close()


@app.get("/api/audit-logs/{meeting_id}", response_model=AuditSummarySchema)
async def get_audit_logs(meeting_id: str):
    repository = get_repository()
    try:
        logs = repository.list_audit_logs(meeting_id)
        entries = [_audit_model_to_schema(log) for log in logs]
        latest_stage = entries[-1].stage if entries else None
        return AuditSummarySchema(count=len(entries), latest_stage=latest_stage, entries=entries)
    finally:
        repository.session.close()


@app.get("/api/meetings/{meeting_id}/execution-proposals", response_model=list[ExecutionProposalSchema])
async def get_execution_proposals(meeting_id: str):
    repository = get_repository()
    try:
        return [_proposal_model_to_schema(proposal) for proposal in repository.list_execution_proposals(meeting_id)]
    finally:
        repository.session.close()


@app.get("/api/meetings/{meeting_id}/memory", response_model=MemoryInspectionResponse)
async def inspect_memory(meeting_id: str):
    if memory_store is None:
        raise HTTPException(status_code=500, detail="Memory store is not initialized")
    payload = memory_store.get_meeting_memory(meeting_id)
    return MemoryInspectionResponse(meeting_id=meeting_id, **payload)


def _build_process_response(state: dict) -> ProcessMeetingResponse:
    audit_entries = [AuditLogSchema(**entry) for entry in state.get("audit_trail", [])]
    return ProcessMeetingResponse(
        meeting_id=state["meeting_id"],
        run_id=state["run_id"],
        status=state["status"],
        current_stage=state["current_stage"],
        workflows=[WorkflowSchema(**workflow) for workflow in state.get("workflows", [])],
        tasks=[TaskSchema(**task) for task in state.get("tasks", [])],
        approvals=[ApprovalSchema(**approval) for approval in state.get("approvals", [])],
        execution_proposals=[
            ExecutionProposalSchema(**proposal) for proposal in state.get("execution_proposals", [])
        ],
        audit_summary=AuditSummarySchema(
            count=len(audit_entries),
            latest_stage=audit_entries[-1].stage if audit_entries else None,
            entries=audit_entries,
        ),
        errors=[ErrorSchema(**error) for error in state.get("errors", [])],
        stage_history=state.get("stage_history", []),
        agent_statuses=state.get("agent_statuses", []),
    )


@app.get("/api/dashboard/meetings", response_model=list[DashboardMeetingSchema])
async def get_dashboard_meetings(limit: int = Query(20, ge=1, le=100)):
    repository = get_repository()
    try:
        meetings = repository.list_meetings(limit=limit)
        payload: list[DashboardMeetingSchema] = []
        for meeting in meetings:
            latest_run = repository.get_latest_run(meeting.id)
            payload.append(
                DashboardMeetingSchema(
                    meeting_id=meeting.id,
                    run_id=latest_run.id if latest_run else None,
                    status=meeting.status,
                    current_stage=meeting.current_stage,
                    task_count=len(repository.list_tasks(meeting.id)),
                    approval_count=len(repository.list_approvals(meeting_id=meeting.id)),
                    proposal_count=len(repository.list_execution_proposals(meeting.id)),
                    error_count=len(repository.list_run_errors(latest_run.id)) if latest_run else 0,
                    updated_at=meeting.updated_at,
                    transcript_preview=meeting.transcript[:220],
                )
            )
        return payload
    finally:
        repository.session.close()


@app.get("/api/meetings/{meeting_id}/snapshot", response_model=RunSnapshotResponse)
async def get_meeting_snapshot(meeting_id: str):
    repository = get_repository()
    try:
        latest_run = repository.get_latest_run(meeting_id)
        meeting = repository.get_meeting(meeting_id)
        if not latest_run or not meeting:
            raise HTTPException(status_code=404, detail="Meeting snapshot not found")
        return _build_run_snapshot(repository, meeting_id=meeting_id, run_id=latest_run.id, transcript=meeting.transcript)
    finally:
        repository.session.close()


@app.get("/api/runs/{run_id}/snapshot", response_model=RunSnapshotResponse)
async def get_run_snapshot(run_id: str):
    repository = get_repository()
    try:
        run = repository.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run snapshot not found")
        meeting = repository.get_meeting(run.meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return _build_run_snapshot(repository, meeting_id=run.meeting_id, run_id=run_id, transcript=meeting.transcript)
    finally:
        repository.session.close()


def _workflow_model_to_schema(model) -> WorkflowSchema:
    return WorkflowSchema(
        id=model.id,
        type=model.type,
        description=model.description,
        confidence=model.confidence,
        owner_hint=model.owner_hint,
        due_date_text=model.due_date_text,
        risk_level=model.risk_level,
        requires_approval=model.requires_approval,
        unresolved_issues=model.unresolved_issues or [],
        metadata=model.metadata_ or {},
    )


def _task_model_to_schema(model) -> TaskSchema:
    return TaskSchema(
        id=model.id,
        workflow_id=model.workflow_id,
        title=model.title,
        description=model.description,
        assigned_to=model.assigned_to,
        priority=model.priority,
        status=model.status,
        due_date=model.due_date,
        dependencies=model.dependencies or [],
        needs_approval=model.needs_approval,
        adapter_type=model.adapter_type,
        metadata=model.metadata_ or {},
    )


def _approval_model_to_schema(model) -> ApprovalSchema:
    return ApprovalSchema(
        id=model.id,
        task_id=model.task_id,
        status=model.status,
        description=model.description,
        approved_by=model.approved_by,
        feedback=model.feedback,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _audit_model_to_schema(model) -> AuditLogSchema:
    return AuditLogSchema(
        timestamp=model.timestamp,
        agent_name=model.agent_name,
        stage=model.stage,
        action=model.action,
        reason=model.reason,
        input_data=model.input_data or {},
        output_data=model.output_data or {},
        success=model.success,
        error_message=model.error_message,
        metadata=model.metadata_ or {},
    )


def _proposal_model_to_schema(model) -> ExecutionProposalSchema:
    return ExecutionProposalSchema(
        id=model.id,
        task_id=model.task_id,
        adapter_type=model.adapter_type,
        status=model.status,
        payload=model.payload or {},
        simulation_result=model.simulation_result or {},
        requires_approval=model.requires_approval,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _build_run_snapshot(
    repository: RelationalRepository,
    *,
    meeting_id: str,
    run_id: str,
    transcript: str,
) -> RunSnapshotResponse:
    latest_run = repository.get_run(run_id)
    artifact = repository.get_meeting_artifact(meeting_id, "graph_state_summary")
    audit_entries = [_audit_model_to_schema(log) for log in repository.list_audit_logs(meeting_id)]
    errors = [
        ErrorSchema(
            agent=error.agent_name,
            category=error.error_type,
            error=error.error_message,
            recoverable=error.recoverable,
            timestamp=error.created_at,
        )
        for error in repository.list_run_errors(run_id)
    ]

    return RunSnapshotResponse(
        meeting_id=meeting_id,
        run_id=run_id,
        status=latest_run.status,
        current_stage=latest_run.current_stage,
        transcript=transcript,
        workflows=[_workflow_model_to_schema(workflow) for workflow in repository.list_workflows(meeting_id)],
        tasks=[_task_model_to_schema(task) for task in repository.list_tasks(meeting_id)],
        approvals=[_approval_model_to_schema(approval) for approval in repository.list_approvals(meeting_id=meeting_id)],
        execution_proposals=[
            _proposal_model_to_schema(proposal) for proposal in repository.list_execution_proposals(meeting_id)
        ],
        audit_summary=AuditSummarySchema(
            count=len(audit_entries),
            latest_stage=audit_entries[-1].stage if audit_entries else None,
            entries=audit_entries,
        ),
        errors=errors,
        stage_history=(artifact.payload or {}).get("stage_history", []) if artifact else [],
        agent_statuses=(artifact.payload or {}).get("agent_statuses", []) if artifact else [],
        recovery_actions=(artifact.payload or {}).get("recovery_actions", []) if artifact else [],
        execution_metadata=(artifact.payload or {}).get("execution_metadata", {}) if artifact else {},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.api_host, port=config.api_port, reload=False, log_level=config.log_level.lower())
