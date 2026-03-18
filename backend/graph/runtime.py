"""
LangGraph runtime for the meeting processing flow.
"""
from __future__ import annotations

import uuid
from typing import Callable

from langgraph.graph import END, StateGraph

from agents import (
    ClassifierAgent,
    ExecutorAgent,
    LocalTranscriptClassifier,
    MockClassifierLLM,
    MonitorAgent,
    PlannerAgent,
    RecoveryAgent,
)
from adapters.simulated import SimulatedAdapterFactory
from config import AppConfig
from core.llm_clients import create_classifier_llm_from_config
from graph.state import GraphState, utc_now_iso


class MeetingGraphRuntime:
    def __init__(self, config: AppConfig):
        self.config = config
        llm_client = create_classifier_llm_from_config(
            config=config,
            local_client=LocalTranscriptClassifier(),
            mock_client=MockClassifierLLM(),
        )
        self.classifier = ClassifierAgent(llm_client=llm_client)
        self.planner = PlannerAgent()
        self.executor = ExecutorAgent(adapter_factory=SimulatedAdapterFactory())
        self.monitor = MonitorAgent()
        self.recovery = RecoveryAgent()
        self.graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(GraphState)
        graph.add_node("classifier", self.classifier.run)
        graph.add_node("planner", self.planner.run)
        graph.add_node("executor", self.executor.run)
        graph.add_node("monitor", self.monitor.run)
        graph.add_node("recovery", self.recovery.run)

        graph.set_entry_point("classifier")
        graph.add_edge("classifier", "planner")
        graph.add_edge("planner", "executor")
        graph.add_edge("executor", "monitor")
        graph.add_conditional_edges(
            "monitor",
            self._route_after_monitor,
            {
                "recovery": "recovery",
                "end": END,
            },
        )
        graph.add_edge("recovery", END)
        return graph.compile()

    def _route_after_monitor(self, state: GraphState) -> str:
        return "recovery" if state.get("review_required") or state.get("errors") else "end"

    async def run(
        self,
        *,
        workspace_id: str,
        workspace_name: str,
        meeting_id: str,
        transcript: str,
        request_id: str,
    ) -> GraphState:
        initial_state: GraphState = {
            "workspace_id": workspace_id,
            "workspace_name": workspace_name,
            "meeting_id": meeting_id,
            "run_id": str(uuid.uuid4()),
            "request_id": request_id,
            "transcript": transcript,
            "transcript_chunks": [],
            "chunk_summaries": [],
            "current_stage": "ingested",
            "status": "running",
            "workflows": [],
            "tasks": [],
            "approvals": [],
            "execution_proposals": [],
            "audit_trail": [],
            "errors": [],
            "recovery_actions": [],
            "stage_history": [],
            "agent_statuses": [],
            "memory_refs": [],
            "execution_metadata": {},
            "review_required": False,
            "failure_category": None,
            "created_at": utc_now_iso(),
            "updated_at": utc_now_iso(),
        }
        return await self.graph.ainvoke(initial_state)
