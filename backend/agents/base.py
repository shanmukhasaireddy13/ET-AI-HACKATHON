"""
Shared helpers for graph-native agents.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from graph.state import GraphState, make_audit_record, utc_now_iso


class GraphAgent:
    stage = "base"

    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")

    def add_audit(
        self,
        state: GraphState,
        *,
        action: str,
        reason: str,
        input_data: Dict[str, Any] | None = None,
        output_data: Dict[str, Any] | None = None,
        success: bool = True,
        error_message: str | None = None,
    ) -> None:
        state.setdefault("audit_trail", []).append(
            make_audit_record(
                agent_name=self.name,
                stage=self.stage,
                action=action,
                reason=reason,
                input_data=input_data,
                output_data=output_data,
                success=success,
                error_message=error_message,
            )
        )
        state["updated_at"] = utc_now_iso()

    def mark_agent_started(
        self,
        state: GraphState,
        *,
        detail: str,
        tools_used: list[str] | None = None,
    ) -> None:
        timestamp = utc_now_iso()
        statuses = state.setdefault("agent_statuses", [])
        existing = next((item for item in statuses if item.get("agent_name") == self.name), None)
        payload = {
            "agent_name": self.name,
            "stage": self.stage,
            "status": "running",
            "started_at": existing.get("started_at") if existing else timestamp,
            "completed_at": None,
            "detail": detail,
            "failure_category": None,
            "retries": existing.get("retries", 0) if existing else 0,
            "output_summary": existing.get("output_summary", {}) if existing else {},
            "tools_used": tools_used or [],
        }
        if existing:
            existing.update(payload)
        else:
            statuses.append(payload)

        state.setdefault("stage_history", []).append(
            {
                "stage": self.stage,
                "status": "running",
                "agent_name": self.name,
                "started_at": timestamp,
                "completed_at": None,
                "detail": detail,
                "metadata": {"tools_used": tools_used or []},
            }
        )
        state["updated_at"] = timestamp

    def mark_agent_finished(
        self,
        state: GraphState,
        *,
        status: str,
        detail: str,
        output_summary: Dict[str, Any] | None = None,
        failure_category: str | None = None,
    ) -> None:
        timestamp = utc_now_iso()
        statuses = state.setdefault("agent_statuses", [])
        existing = next((item for item in statuses if item.get("agent_name") == self.name), None)
        if existing:
            existing.update(
                {
                    "stage": self.stage,
                    "status": status,
                    "completed_at": timestamp,
                    "detail": detail,
                    "failure_category": failure_category,
                    "output_summary": output_summary or {},
                }
            )
        else:
            statuses.append(
                {
                    "agent_name": self.name,
                    "stage": self.stage,
                    "status": status,
                    "started_at": timestamp,
                    "completed_at": timestamp,
                    "detail": detail,
                    "failure_category": failure_category,
                    "retries": 0,
                    "output_summary": output_summary or {},
                    "tools_used": [],
                }
            )

        state.setdefault("stage_history", []).append(
            {
                "stage": self.stage,
                "status": status,
                "agent_name": self.name,
                "started_at": timestamp,
                "completed_at": timestamp,
                "detail": detail,
                "metadata": output_summary or {},
            }
        )
        state["updated_at"] = timestamp

    def add_error(
        self,
        state: GraphState,
        *,
        category: str,
        error: str,
        recoverable: bool = True,
    ) -> None:
        state.setdefault("errors", []).append(
            {
                "agent": self.name,
                "category": category,
                "error": error,
                "recoverable": recoverable,
                "timestamp": utc_now_iso(),
            }
        )
        state["updated_at"] = utc_now_iso()
