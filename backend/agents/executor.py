"""
Executor agent that produces approval-first execution proposals.
"""
from __future__ import annotations

from typing import List

from adapters.simulated import SimulatedAdapterFactory
from agents.base import GraphAgent
from graph.state import GraphState, utc_now_iso


class ExecutorAgent(GraphAgent):
    stage = "execution_planning"

    def __init__(self, adapter_factory: SimulatedAdapterFactory):
        super().__init__(name="executor")
        self.adapter_factory = adapter_factory

    def run(self, state: GraphState) -> GraphState:
        state["current_stage"] = self.stage
        self.mark_agent_started(
            state,
            detail="Simulating downstream tool actions and preparing execution proposals.",
            tools_used=["simulated-adapters"],
        )
        proposals: List[dict] = []
        for task in state.get("tasks", []):
            simulation_result = self.adapter_factory.simulate(task.get("adapter_type", "task_tracker"), task)
            proposal = {
                "id": f"proposal-{task['id']}",
                "task_id": task["id"],
                "adapter_type": task.get("adapter_type", "task_tracker"),
                "status": "pending_approval" if task.get("needs_approval") else "simulated_ready",
                "payload": {
                    "task_title": task["title"],
                    "task_description": task["description"],
                    "assigned_to": task.get("assigned_to"),
                    "due_date": task.get("due_date"),
                },
                "simulation_result": simulation_result,
                "requires_approval": task.get("needs_approval", False),
                "created_at": utc_now_iso(),
                "updated_at": utc_now_iso(),
            }
            proposals.append(proposal)

        state["execution_proposals"] = proposals
        self.add_audit(
            state,
            action=f"Created {len(proposals)} execution proposal(s)",
            reason="Executor simulated downstream actions and paused any side effects behind approval gates.",
            input_data={"tasks_count": len(state.get("tasks", []))},
            output_data={"execution_proposals_count": len(proposals)},
        )
        self.mark_agent_finished(
            state,
            status="completed",
            detail="Executor prepared proposal payloads for all planned tasks.",
            output_summary={"proposal_count": len(proposals)},
        )
        return state
