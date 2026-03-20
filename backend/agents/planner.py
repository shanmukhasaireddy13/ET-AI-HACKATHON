"""
Planner agent that turns workflows into tasks and approvals.
"""
from __future__ import annotations

import hashlib
from typing import Dict, List

from agents.base import GraphAgent
from graph.state import GraphState, utc_now_iso


class PlannerAgent(GraphAgent):
    stage = "planning"

    def __init__(self) -> None:
        super().__init__(name="planner")

    def run(self, state: GraphState) -> GraphState:
        state["current_stage"] = self.stage
        self.mark_agent_started(
            state,
            detail="Transforming workflow detections into deterministic tasks and approvals.",
            tools_used=["workflow-to-task-mapper"],
        )
        tasks: List[Dict] = []
        approvals: List[Dict] = []

        for workflow in state.get("workflows", []):
            task_id = self._make_task_id(state["meeting_id"], workflow["id"])
            title = self._task_title_for_workflow(workflow["type"], workflow["description"])
            task = {
                "id": task_id,
                "workflow_id": workflow["id"],
                "title": title,
                "description": workflow["description"],
                "assigned_to": workflow.get("owner_hint"),
                "priority": "high" if workflow["type"] == "issue_resolution" else "medium",
                "status": "planned",
                "due_date": workflow.get("due_date_text"),
                "dependencies": [],
                "needs_approval": workflow.get("requires_approval", False),
                "adapter_type": self._adapter_type_for_workflow(workflow["type"]),
                "metadata": {
                    "workflow_type": workflow["type"],
                    "risk_level": workflow.get("risk_level", "medium"),
                    "unresolved_issues": workflow.get("unresolved_issues", []),
                },
            }
            tasks.append(task)

            if task["needs_approval"]:
                approval_id = f"approval-{task_id}"
                approvals.append(
                    {
                        "id": approval_id,
                        "task_id": task_id,
                        "status": "pending",
                        "description": f"Approval required before executing '{title}'",
                        "approved_by": None,
                        "feedback": None,
                        "created_at": utc_now_iso(),
                        "updated_at": utc_now_iso(),
                    }
                )

        state["tasks"] = tasks
        state["approvals"] = approvals
        self.add_audit(
            state,
            action=f"Planned {len(tasks)} task(s)",
            reason="Planner converted workflows into deterministic task records and approval requirements.",
            input_data={"workflows_count": len(state.get("workflows", []))},
            output_data={"tasks_count": len(tasks), "approvals_count": len(approvals)},
        )
        self.mark_agent_finished(
            state,
            status="completed",
            detail="Planner generated task graph and approval gates.",
            output_summary={"tasks_count": len(tasks), "approvals_count": len(approvals)},
        )
        return state

    def _make_task_id(self, meeting_id: str, workflow_id: str) -> str:
        digest = hashlib.sha1(f"{meeting_id}:{workflow_id}".encode("utf-8")).hexdigest()[:16]
        return f"task-{digest}"

    def _task_title_for_workflow(self, workflow_type: str, description: str) -> str:
        titles = {
            "task_creation": "Complete assigned deliverable",
            "approval_needed": "Review and approve requested decision",
            "scheduling": "Coordinate required meeting or event",
            "issue_resolution": "Investigate and resolve reported issue",
        }
        return titles.get(workflow_type, description[:80] or "Planned task")

    def _adapter_type_for_workflow(self, workflow_type: str) -> str:
        return {
            "task_creation": "task_tracker",
            "approval_needed": "approval_gate",
            "scheduling": "calendar",
            "issue_resolution": "incident_tracker",
        }.get(workflow_type, "task_tracker")
