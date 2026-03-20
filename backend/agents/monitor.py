"""
Monitor agent for validating graph outputs.
"""
from __future__ import annotations

from agents.base import GraphAgent
from graph.state import GraphState


class MonitorAgent(GraphAgent):
    stage = "monitoring"

    def __init__(self) -> None:
        super().__init__(name="monitor")

    def run(self, state: GraphState) -> GraphState:
        state["current_stage"] = self.stage
        self.mark_agent_started(
            state,
            detail="Validating task completeness, approval gates, and execution readiness.",
            tools_used=["state-validator"],
        )
        issues = []

        for task in state.get("tasks", []):
            workflow_type = task.get("metadata", {}).get("workflow_type")
            if workflow_type == "task_creation" and not task.get("assigned_to"):
                issues.append(f"Task '{task['title']}' is missing an owner")
            if workflow_type in {"task_creation", "scheduling"} and not task.get("due_date"):
                issues.append(f"Task '{task['title']}' is missing a due date")

        if state.get("approvals") and not state.get("execution_proposals"):
            issues.append("Approvals exist but execution proposals were not created")

        if issues:
            for issue in issues:
                self.add_error(state, category="validation", error=issue, recoverable=True)
            state["review_required"] = True
            state["failure_category"] = "validation"
            self.add_audit(
                state,
                action="Detected output validation issues",
                reason="Monitor found missing fields or incomplete downstream outputs.",
                input_data={"issues_detected": len(issues)},
                output_data={"issues": issues},
            )
            self.mark_agent_finished(
                state,
                status="failed",
                detail="Monitor detected issues that require recovery or human review.",
                output_summary={"issues": issues},
                failure_category="validation",
            )
        else:
            self.add_audit(
                state,
                action="Validated graph output",
                reason="Monitor confirmed that planned tasks, approvals, and proposals are internally consistent.",
                input_data={"tasks_count": len(state.get('tasks', []))},
                output_data={"issues": []},
            )
            self.mark_agent_finished(
                state,
                status="completed",
                detail="Monitor validated the run as internally consistent.",
                output_summary={"issues": []},
            )

        state["status"] = "needs_review" if state.get("review_required") else "completed"
        state["current_stage"] = "review" if state.get("review_required") else "completed"
        return state
