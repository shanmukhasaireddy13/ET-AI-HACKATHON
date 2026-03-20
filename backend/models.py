"""
Relational persistence models for the agent platform.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class WorkspaceModel(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), nullable=False, unique=True)
    display_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class WorkspaceMemberModel(Base):
    __tablename__ = "workspace_members"

    id = Column(String(36), primary_key=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), nullable=False, default="member")
    created_at = Column(DateTime, default=utc_now, nullable=False)


class MeetingModel(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    transcript = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    current_stage = Column(String(50), nullable=False, default="ingested")
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    runs = relationship("MeetingRunModel", back_populates="meeting", cascade="all, delete-orphan")
    workflows = relationship("WorkflowModel", back_populates="meeting", cascade="all, delete-orphan")
    tasks = relationship("TaskModel", back_populates="meeting", cascade="all, delete-orphan")
    approvals = relationship("ApprovalModel", back_populates="meeting", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogModel", back_populates="meeting", cascade="all, delete-orphan")


class MeetingRunModel(Base):
    __tablename__ = "meeting_runs"

    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    request_id = Column(String(36), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    current_stage = Column(String(50), nullable=False, default="ingested")
    graph_version = Column(String(50), nullable=False, default="v1")
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)

    meeting = relationship("MeetingModel", back_populates="runs")
    proposals = relationship("ExecutionProposalModel", back_populates="run", cascade="all, delete-orphan")


class MeetingArtifactModel(Base):
    __tablename__ = "meeting_artifacts"

    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    artifact_type = Column(String(50), nullable=False)
    payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now, nullable=False)


class WorkflowModel(Base):
    __tablename__ = "workflows"

    id = Column(String(64), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    owner_hint = Column(String(255), nullable=True)
    due_date_text = Column(String(255), nullable=True)
    risk_level = Column(String(50), nullable=False, default="medium")
    requires_approval = Column(Boolean, nullable=False, default=False)
    unresolved_issues = Column(JSON, default=list)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    meeting = relationship("MeetingModel", back_populates="workflows")


class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    workflow_id = Column(String(64), ForeignKey("workflows.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    assigned_to = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default="medium")
    status = Column(String(50), nullable=False, default="pending")
    due_date = Column(String(255), nullable=True)
    dependencies = Column(JSON, default=list)
    needs_approval = Column(Boolean, nullable=False, default=False)
    adapter_type = Column(String(50), nullable=False, default="task_tracker")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    meeting = relationship("MeetingModel", back_populates="tasks")


class ApprovalModel(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    description = Column(Text, nullable=False)
    approved_by = Column(String(255), nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    meeting = relationship("MeetingModel", back_populates="approvals")


class ExecutionProposalModel(Base):
    __tablename__ = "execution_proposals"

    id = Column(String(64), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    task_id = Column(String(64), ForeignKey("tasks.id"), nullable=False)
    adapter_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    payload = Column(JSON, default=dict)
    simulation_result = Column(JSON, default=dict)
    requires_approval = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    run = relationship("MeetingRunModel", back_populates="proposals")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    run_id = Column(String(36), ForeignKey("meeting_runs.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    stage = Column(String(50), nullable=False)
    action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now, nullable=False)

    meeting = relationship("MeetingModel", back_populates="audit_logs")


class GraphRunModel(Base):
    __tablename__ = "graph_runs"

    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    status = Column(String(50), nullable=False)
    current_stage = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)


class AgentRunModel(Base):
    __tablename__ = "agent_runs"

    id = Column(String(64), primary_key=True)
    graph_run_id = Column(String(36), ForeignKey("graph_runs.id"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    stage = Column(String(50), nullable=True)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    failure_category = Column(String(100), nullable=True)
    retries = Column(String(10), nullable=False, default="0")
    tools_used = Column(JSON, default=list)


class RunErrorModel(Base):
    __tablename__ = "run_errors"

    id = Column(String(64), primary_key=True)
    graph_run_id = Column(String(36), ForeignKey("graph_runs.id"), nullable=False)
    meeting_id = Column(String(36), ForeignKey("meetings.id"), nullable=False)
    agent_name = Column(String(50), nullable=False)
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    recoverable = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
