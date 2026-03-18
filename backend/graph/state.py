"""
Shared LangGraph state and domain helpers.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, TypedDict


WorkflowType = Literal["task_creation", "approval_needed", "scheduling", "issue_resolution"]


class WorkflowRecord(TypedDict, total=False):
    id: str
    type: WorkflowType
    description: str
    confidence: float
    owner_hint: Optional[str]
    due_date_text: Optional[str]
    risk_level: str
    requires_approval: bool
    unresolved_issues: List[str]
    metadata: Dict[str, Any]


class TaskRecord(TypedDict, total=False):
    id: str
    workflow_id: Optional[str]
    title: str
    description: str
    assigned_to: Optional[str]
    priority: str
    status: str
    due_date: Optional[str]
    dependencies: List[str]
    needs_approval: bool
    adapter_type: str
    metadata: Dict[str, Any]


class ApprovalRecord(TypedDict, total=False):
    id: str
    task_id: str
    status: str
    description: str
    approved_by: Optional[str]
    feedback: Optional[str]
    created_at: str
    updated_at: str


class ExecutionProposalRecord(TypedDict, total=False):
    id: str
    task_id: str
    adapter_type: str
    status: str
    payload: Dict[str, Any]
    simulation_result: Dict[str, Any]
    requires_approval: bool
    created_at: str
    updated_at: str


class AuditRecord(TypedDict, total=False):
    timestamp: str
    agent_name: str
    stage: str
    action: str
    reason: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    success: bool
    error_message: Optional[str]
    metadata: Dict[str, Any]


class ErrorRecord(TypedDict, total=False):
    agent: str
    category: str
    error: str
    recoverable: bool
    timestamp: str


class RecoveryRecord(TypedDict, total=False):
    action: str
    reason: str
    timestamp: str


class StageEventRecord(TypedDict, total=False):
    stage: str
    status: str
    agent_name: Optional[str]
    started_at: str
    completed_at: Optional[str]
    detail: str
    metadata: Dict[str, Any]


class AgentStatusRecord(TypedDict, total=False):
    agent_name: str
    stage: str
    status: str
    started_at: Optional[str]
    completed_at: Optional[str]
    detail: str
    failure_category: Optional[str]
    retries: int
    output_summary: Dict[str, Any]
    tools_used: List[str]


class GraphState(TypedDict, total=False):
    workspace_id: str
    workspace_name: str
    meeting_id: str
    run_id: str
    request_id: str
    transcript: str
    transcript_chunks: List[Dict[str, Any]]
    chunk_summaries: List[str]
    current_stage: str
    status: str
    workflows: List[WorkflowRecord]
    tasks: List[TaskRecord]
    approvals: List[ApprovalRecord]
    execution_proposals: List[ExecutionProposalRecord]
    audit_trail: List[AuditRecord]
    errors: List[ErrorRecord]
    recovery_actions: List[RecoveryRecord]
    stage_history: List[StageEventRecord]
    agent_statuses: List[AgentStatusRecord]
    memory_refs: List[Dict[str, Any]]
    execution_metadata: Dict[str, Any]
    review_required: bool
    failure_category: Optional[str]
    created_at: str
    updated_at: str


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_audit_record(
    *,
    agent_name: str,
    stage: str,
    action: str,
    reason: str,
    input_data: Dict[str, Any] | None = None,
    output_data: Dict[str, Any] | None = None,
    success: bool = True,
    error_message: str | None = None,
    metadata: Dict[str, Any] | None = None,
) -> AuditRecord:
    return AuditRecord(
        timestamp=utc_now_iso(),
        agent_name=agent_name,
        stage=stage,
        action=action,
        reason=reason,
        input_data=input_data or {},
        output_data=output_data or {},
        success=success,
        error_message=error_message,
        metadata=metadata or {},
    )
