"""
Recovery agent for review escalation and retries metadata.
"""
from __future__ import annotations

from agents.base import GraphAgent
from graph.state import GraphState, utc_now_iso


class RecoveryAgent(GraphAgent):
    stage = "recovery"

    def __init__(self) -> None:
        super().__init__(name="recovery")

    def run(self, state: GraphState) -> GraphState:
        state["current_stage"] = self.stage
        self.mark_agent_started(
            state,
            detail="Capturing failure context and defining retry or review actions.",
            tools_used=["recovery-policy"],
        )
        if state.get("errors"):
            state.setdefault("recovery_actions", []).append(
                {
                    "action": "Escalated run for human review",
                    "reason": state.get("failure_category") or "recoverable_error",
                    "timestamp": utc_now_iso(),
                }
            )
            self.add_audit(
                state,
                action="Prepared run for human review",
                reason="Recovery captured the failure context and marked the meeting as needing review.",
                input_data={"errors_count": len(state.get("errors", []))},
                output_data={"review_required": True},
            )
            state["status"] = "needs_review"
            state["review_required"] = True
            state["current_stage"] = "needs_review"
            self.mark_agent_finished(
                state,
                status="completed",
                detail="Recovery packaged the run for review with explicit failure context.",
                output_summary={"recovery_actions": len(state.get("recovery_actions", []))},
                failure_category=state.get("failure_category"),
            )
            return state

        self.mark_agent_finished(
            state,
            status="completed",
            detail="Recovery found no outstanding errors and left the run unchanged.",
            output_summary={"recovery_actions": 0},
        )
        return state
