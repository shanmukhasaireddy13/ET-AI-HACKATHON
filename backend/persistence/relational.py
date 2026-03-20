"""
Relational repository for structured workflow data.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from config import AppConfig
from models import (
    AgentRunModel,
    ApprovalModel,
    AuditLogModel,
    ExecutionProposalModel,
    GraphRunModel,
    MeetingArtifactModel,
    MeetingModel,
    MeetingRunModel,
    RunErrorModel,
    TaskModel,
    UserModel,
    WorkflowModel,
    WorkspaceMemberModel,
    WorkspaceModel,
    utc_now,
)


class RelationalRepository:
    def __init__(self, session: Session, config: AppConfig):
        self.session = session
        self.config = config

    def ensure_seed_workspace(self) -> str:
        workspace = self.session.query(WorkspaceModel).filter_by(name=self.config.workspace_name).first()
        if not workspace:
            workspace = WorkspaceModel(id=str(uuid.uuid4()), name=self.config.workspace_name)
            self.session.add(workspace)

        user = self.session.query(UserModel).filter_by(email=self.config.default_user_email).first()
        if not user:
            user = UserModel(
                id=str(uuid.uuid4()),
                email=self.config.default_user_email,
                display_name="System User",
            )
            self.session.add(user)
            self.session.flush()

        member = (
            self.session.query(WorkspaceMemberModel)
            .filter_by(workspace_id=workspace.id, user_id=user.id)
            .first()
        )
        if not member:
            self.session.add(
                WorkspaceMemberModel(
                    id=str(uuid.uuid4()),
                    workspace_id=workspace.id,
                    user_id=user.id,
                    role="admin",
                )
            )

        self.session.commit()
        return workspace.id

    def save_graph_result(self, state: Dict[str, Any], request_id: str) -> None:
        meeting = self.session.query(MeetingModel).filter_by(id=state["meeting_id"]).first()
        if not meeting:
            meeting = MeetingModel(
                id=state["meeting_id"],
                workspace_id=state["workspace_id"],
                transcript=state["transcript"],
                status=state["status"],
                current_stage=state["current_stage"],
            )
            self.session.add(meeting)
        else:
            meeting.transcript = state["transcript"]
            meeting.status = state["status"]
            meeting.current_stage = state["current_stage"]
            meeting.updated_at = utc_now()

        run = self.session.query(MeetingRunModel).filter_by(id=state["run_id"]).first()
        if not run:
            run = MeetingRunModel(
                id=state["run_id"],
                meeting_id=state["meeting_id"],
                request_id=request_id,
                status=state["status"],
                current_stage=state["current_stage"],
                completed_at=utc_now(),
                metadata_={"memory_refs": state.get("memory_refs", [])},
            )
            self.session.add(run)
        else:
            run.status = state["status"]
            run.current_stage = state["current_stage"]
            run.completed_at = utc_now()
            run.metadata_ = {"memory_refs": state.get("memory_refs", [])}

        graph_run = self.session.query(GraphRunModel).filter_by(id=state["run_id"]).first()
        if not graph_run:
            graph_run = GraphRunModel(
                id=state["run_id"],
                meeting_id=state["meeting_id"],
                status=state["status"],
                current_stage=state["current_stage"],
                completed_at=utc_now(),
                metadata_={"request_id": request_id},
            )
            self.session.add(graph_run)
        else:
            graph_run.status = state["status"]
            graph_run.current_stage = state["current_stage"]
            graph_run.completed_at = utc_now()
            graph_run.metadata_ = {
                "request_id": request_id,
                "review_required": state.get("review_required", False),
                "failure_category": state.get("failure_category"),
            }

        self.session.query(WorkflowModel).filter_by(meeting_id=state["meeting_id"]).delete()
        self.session.query(TaskModel).filter_by(meeting_id=state["meeting_id"]).delete()
        self.session.query(ApprovalModel).filter_by(meeting_id=state["meeting_id"]).delete()
        self.session.query(ExecutionProposalModel).filter_by(meeting_id=state["meeting_id"]).delete()
        self.session.query(AuditLogModel).filter_by(meeting_id=state["meeting_id"]).delete()
        self.session.query(AgentRunModel).filter_by(graph_run_id=state["run_id"]).delete()
        self.session.query(RunErrorModel).filter_by(graph_run_id=state["run_id"]).delete()
        self.session.query(MeetingArtifactModel).filter_by(meeting_id=state["meeting_id"]).delete()

        for workflow in state.get("workflows", []):
            self.session.add(
                WorkflowModel(
                    id=workflow["id"],
                    meeting_id=state["meeting_id"],
                    run_id=state["run_id"],
                    type=workflow["type"],
                    description=workflow["description"],
                    confidence=workflow["confidence"],
                    owner_hint=workflow.get("owner_hint"),
                    due_date_text=workflow.get("due_date_text"),
                    risk_level=workflow.get("risk_level", "medium"),
                    requires_approval=workflow.get("requires_approval", False),
                    unresolved_issues=workflow.get("unresolved_issues", []),
                    metadata_=workflow.get("metadata", {}),
                )
            )

        for task in state.get("tasks", []):
            self.session.add(
                TaskModel(
                    id=task["id"],
                    meeting_id=state["meeting_id"],
                    run_id=state["run_id"],
                    workflow_id=task.get("workflow_id"),
                    title=task["title"],
                    description=task["description"],
                    assigned_to=task.get("assigned_to"),
                    priority=task.get("priority", "medium"),
                    status=task.get("status", "pending"),
                    due_date=task.get("due_date"),
                    dependencies=task.get("dependencies", []),
                    needs_approval=task.get("needs_approval", False),
                    adapter_type=task.get("adapter_type", "task_tracker"),
                    metadata_=task.get("metadata", {}),
                )
            )

        for approval in state.get("approvals", []):
            self.session.add(
                ApprovalModel(
                    id=approval["id"],
                    meeting_id=state["meeting_id"],
                    run_id=state["run_id"],
                    task_id=approval["task_id"],
                    status=approval["status"],
                    description=approval["description"],
                    approved_by=approval.get("approved_by"),
                    feedback=approval.get("feedback"),
                )
            )

        for proposal in state.get("execution_proposals", []):
            self.session.add(
                ExecutionProposalModel(
                    id=proposal["id"],
                    meeting_id=state["meeting_id"],
                    run_id=state["run_id"],
                    task_id=proposal["task_id"],
                    adapter_type=proposal["adapter_type"],
                    status=proposal["status"],
                    payload=proposal.get("payload", {}),
                    simulation_result=proposal.get("simulation_result", {}),
                    requires_approval=proposal.get("requires_approval", False),
                )
            )

        for index, audit in enumerate(state.get("audit_trail", []), start=1):
            self.session.add(
                AuditLogModel(
                    id=f"{state['run_id']}-audit-{index}",
                    meeting_id=state["meeting_id"],
                    run_id=state["run_id"],
                    agent_name=audit["agent_name"],
                    stage=audit["stage"],
                    action=audit["action"],
                    reason=audit["reason"],
                    input_data=audit.get("input_data", {}),
                    output_data=audit.get("output_data", {}),
                    success=audit.get("success", True),
                    error_message=audit.get("error_message"),
                    metadata_=audit.get("metadata", {}),
                    timestamp=datetime.fromisoformat(audit["timestamp"]),
                )
            )

        for index, audit in enumerate(state.get("audit_trail", []), start=1):
            self.session.add(
                AgentRunModel(
                    id=f"{state['run_id']}-agent-{index}",
                    graph_run_id=state["run_id"],
                    meeting_id=state["meeting_id"],
                    agent_name=audit["agent_name"],
                    status="completed" if audit.get("success", True) else "failed",
                    stage=audit.get("stage"),
                    completed_at=utc_now(),
                    input_summary=str(audit.get("input_data", {}))[:500],
                    output_summary=str(audit.get("output_data", {}))[:500],
                    error_message=audit.get("error_message"),
                )
            )

        agent_statuses = state.get("agent_statuses", [])
        if agent_statuses:
            self.session.query(AgentRunModel).filter_by(graph_run_id=state["run_id"]).delete()
            for index, agent in enumerate(agent_statuses, start=1):
                started_at = _parse_datetime(agent.get("started_at")) or utc_now()
                completed_at = _parse_datetime(agent.get("completed_at"))
                self.session.add(
                    AgentRunModel(
                        id=f"{state['run_id']}-agent-{index}",
                        graph_run_id=state["run_id"],
                        meeting_id=state["meeting_id"],
                        agent_name=agent["agent_name"],
                        status=agent.get("status", "completed"),
                        started_at=started_at,
                        completed_at=completed_at,
                        stage=agent.get("stage"),
                        input_summary=agent.get("detail", "")[:500],
                        output_summary=str(agent.get("output_summary", {}))[:500],
                        error_message=agent.get("failure_category"),
                        failure_category=agent.get("failure_category"),
                        retries=str(agent.get("retries", 0)),
                        tools_used=agent.get("tools_used", []),
                    )
                )

        for index, error in enumerate(state.get("errors", []), start=1):
            self.session.add(
                RunErrorModel(
                    id=f"{state['run_id']}-error-{index}",
                    graph_run_id=state["run_id"],
                    meeting_id=state["meeting_id"],
                    agent_name=error.get("agent", "runtime"),
                    error_type=error.get("category", "unknown"),
                    error_message=error["error"],
                    recoverable=error.get("recoverable", True),
                )
            )

        self.session.add(
            MeetingArtifactModel(
                id=f"{state['run_id']}-artifact-summary",
                meeting_id=state["meeting_id"],
                run_id=state["run_id"],
                artifact_type="graph_state_summary",
                payload={
                    "status": state["status"],
                    "current_stage": state["current_stage"],
                    "review_required": state.get("review_required", False),
                    "agent_statuses": state.get("agent_statuses", []),
                    "stage_history": state.get("stage_history", []),
                    "execution_metadata": state.get("execution_metadata", {}),
                    "recovery_actions": state.get("recovery_actions", []),
                    "memory_refs": state.get("memory_refs", []),
                },
            )
        )

        self.session.commit()

    def list_meetings(self, limit: int = 20) -> List[MeetingModel]:
        return (
            self.session.query(MeetingModel)
            .order_by(MeetingModel.updated_at.desc())
            .limit(limit)
            .all()
        )

    def list_agent_runs(self, run_id: str) -> List[AgentRunModel]:
        return (
            self.session.query(AgentRunModel)
            .filter_by(graph_run_id=run_id)
            .order_by(AgentRunModel.started_at.asc())
            .all()
        )

    def list_run_errors(self, run_id: str) -> List[RunErrorModel]:
        return (
            self.session.query(RunErrorModel)
            .filter_by(graph_run_id=run_id)
            .order_by(RunErrorModel.created_at.asc())
            .all()
        )

    def get_meeting_artifact(self, meeting_id: str, artifact_type: str) -> Optional[MeetingArtifactModel]:
        return (
            self.session.query(MeetingArtifactModel)
            .filter_by(meeting_id=meeting_id, artifact_type=artifact_type)
            .order_by(MeetingArtifactModel.created_at.desc())
            .first()
        )

    def get_latest_run(self, meeting_id: str) -> Optional[MeetingRunModel]:
        return (
            self.session.query(MeetingRunModel)
            .filter_by(meeting_id=meeting_id)
            .order_by(MeetingRunModel.started_at.desc())
            .first()
        )

    def get_meeting(self, meeting_id: str) -> Optional[MeetingModel]:
        return self.session.query(MeetingModel).filter_by(id=meeting_id).first()

    def get_run(self, run_id: str) -> Optional[MeetingRunModel]:
        return self.session.query(MeetingRunModel).filter_by(id=run_id).first()

    def list_workflows(self, meeting_id: str) -> List[WorkflowModel]:
        return (
            self.session.query(WorkflowModel)
            .filter_by(meeting_id=meeting_id)
            .order_by(WorkflowModel.created_at.asc())
            .all()
        )

    def list_tasks(self, meeting_id: str) -> List[TaskModel]:
        return (
            self.session.query(TaskModel)
            .filter_by(meeting_id=meeting_id)
            .order_by(TaskModel.created_at.asc())
            .all()
        )

    def list_approvals(self, meeting_id: str | None = None, status: str | None = None) -> List[ApprovalModel]:
        query = self.session.query(ApprovalModel)
        if meeting_id:
            query = query.filter_by(meeting_id=meeting_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(ApprovalModel.created_at.asc()).all()

    def list_audit_logs(self, meeting_id: str) -> List[AuditLogModel]:
        return (
            self.session.query(AuditLogModel)
            .filter_by(meeting_id=meeting_id)
            .order_by(AuditLogModel.timestamp.asc())
            .all()
        )

    def list_execution_proposals(self, meeting_id: str) -> List[ExecutionProposalModel]:
        return (
            self.session.query(ExecutionProposalModel)
            .filter_by(meeting_id=meeting_id)
            .order_by(ExecutionProposalModel.created_at.asc())
            .all()
        )

    def set_approval_decision(self, task_id: str, status: str, approved_by: str, feedback: str | None) -> ApprovalModel | None:
        approval = self.session.query(ApprovalModel).filter_by(task_id=task_id).first()
        if not approval:
            return None

        approval.status = status
        approval.approved_by = approved_by
        approval.feedback = feedback
        approval.updated_at = utc_now()

        proposals = self.session.query(ExecutionProposalModel).filter_by(task_id=task_id).all()
        for proposal in proposals:
            proposal.status = "approved_for_execution" if status == "approved" else "rejected"
            proposal.updated_at = utc_now()

        task = self.session.query(TaskModel).filter_by(id=task_id).first()
        if task:
            task.status = "approved" if status == "approved" else "rejected"
            task.updated_at = utc_now()

        self.session.commit()
        return approval


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
