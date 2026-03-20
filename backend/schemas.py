"""
API schemas for the LangGraph-based backend.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class WorkflowSchema(BaseModel):
    id: str
    type: str
    description: str
    confidence: float
    owner_hint: Optional[str] = None
    due_date_text: Optional[str] = None
    risk_level: str = "medium"
    requires_approval: bool = False
    unresolved_issues: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TaskSchema(BaseModel):
    id: str
    workflow_id: Optional[str] = None
    title: str
    description: str
    assigned_to: Optional[str] = None
    priority: str = "medium"
    status: str = "planned"
    due_date: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list)
    needs_approval: bool = False
    adapter_type: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ApprovalSchema(BaseModel):
    id: str
    task_id: str
    status: str
    description: str
    approved_by: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime | str
    updated_at: datetime | str


class ExecutionProposalSchema(BaseModel):
    id: str
    task_id: str
    adapter_type: str
    status: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    simulation_result: Dict[str, Any] = Field(default_factory=dict)
    requires_approval: bool = False
    created_at: datetime | str
    updated_at: datetime | str


class AuditLogSchema(BaseModel):
    timestamp: datetime | str
    agent_name: str
    stage: str
    action: str
    reason: str
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    success: bool = True
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ErrorSchema(BaseModel):
    agent: str
    category: str
    error: str
    recoverable: bool = True
    timestamp: datetime | str


class AuditSummarySchema(BaseModel):
    count: int
    latest_stage: Optional[str] = None
    entries: List[AuditLogSchema] = Field(default_factory=list)


class ProcessMeetingRequest(BaseModel):
    meeting_id: Optional[str] = Field(default=None, description="Unique meeting identifier")
    transcript: str = Field(..., description="Full meeting transcript text")


class ProcessMeetingResponse(BaseModel):
    meeting_id: str
    run_id: str
    status: str
    current_stage: str
    workflows: List[WorkflowSchema] = Field(default_factory=list)
    tasks: List[TaskSchema] = Field(default_factory=list)
    approvals: List[ApprovalSchema] = Field(default_factory=list)
    execution_proposals: List[ExecutionProposalSchema] = Field(default_factory=list)
    audit_summary: AuditSummarySchema
    errors: List[ErrorSchema] = Field(default_factory=list)
    stage_history: List[Dict[str, Any]] = Field(default_factory=list)
    agent_statuses: List[Dict[str, Any]] = Field(default_factory=list)


class MeetingRunResponse(BaseModel):
    meeting_id: str
    run_id: str
    status: str
    current_stage: str
    transcript: str


class ApprovalDecisionSchema(BaseModel):
    status: str
    approved_by: str
    feedback: Optional[str] = None


class MemoryInspectionResponse(BaseModel):
    meeting_id: str
    transcript_chunks: List[Dict[str, Any]] = Field(default_factory=list)
    agent_memories: List[Dict[str, Any]] = Field(default_factory=list)


class DashboardMeetingSchema(BaseModel):
    meeting_id: str
    run_id: Optional[str] = None
    status: str
    current_stage: str
    task_count: int = 0
    approval_count: int = 0
    proposal_count: int = 0
    error_count: int = 0
    updated_at: datetime | str
    transcript_preview: str


class RunSnapshotResponse(BaseModel):
    meeting_id: str
    run_id: str
    status: str
    current_stage: str
    transcript: str
    workflows: List[WorkflowSchema] = Field(default_factory=list)
    tasks: List[TaskSchema] = Field(default_factory=list)
    approvals: List[ApprovalSchema] = Field(default_factory=list)
    execution_proposals: List[ExecutionProposalSchema] = Field(default_factory=list)
    audit_summary: AuditSummarySchema
    errors: List[ErrorSchema] = Field(default_factory=list)
    stage_history: List[Dict[str, Any]] = Field(default_factory=list)
    agent_statuses: List[Dict[str, Any]] = Field(default_factory=list)
    recovery_actions: List[Dict[str, Any]] = Field(default_factory=list)
    execution_metadata: Dict[str, Any] = Field(default_factory=dict)
