"""
Compatibility orchestrator that wraps the LangGraph runtime and persistence.
"""
from __future__ import annotations

import logging
from typing import Any, Dict

from config import AppConfig
from graph.runtime import MeetingGraphRuntime
from persistence.memory_store import BaseMemoryStore
from persistence.relational import RelationalRepository


logger = logging.getLogger(__name__)


class AgentOrchestrator:
    def __init__(
        self,
        *,
        config: AppConfig,
        runtime: MeetingGraphRuntime,
        memory_store: BaseMemoryStore,
    ) -> None:
        self.config = config
        self.runtime = runtime
        self.memory_store = memory_store

    async def process_meeting(
        self,
        *,
        meeting_id: str,
        transcript: str,
        request_id: str,
        repository: RelationalRepository,
    ) -> Dict[str, Any]:
        workspace_id = repository.ensure_seed_workspace()
        chunks = self.memory_store.save_transcript_chunks(meeting_id, transcript)

        state = await self.runtime.run(
            workspace_id=workspace_id,
            workspace_name=self.config.workspace_name,
            meeting_id=meeting_id,
            transcript=transcript,
            request_id=request_id,
        )

        state["transcript_chunks"] = chunks
        state["memory_refs"] = [
            self.memory_store.upsert_agent_memory(
                meeting_id,
                "runtime",
                {
                    "meeting_context": {
                        "workspace_id": workspace_id,
                        "request_id": request_id,
                        "status": state["status"],
                    }
                },
            )
        ]
        state["execution_metadata"] = {
            "orchestrator": "langgraph-compatibility-wrapper",
            "workspace_id": workspace_id,
            "workspace_name": self.config.workspace_name,
            "automation_mode": "approval-first-simulated",
            "agents_total": len(state.get("agent_statuses", [])),
            "completed_agents": len(
                [agent for agent in state.get("agent_statuses", []) if agent.get("status") == "completed"]
            ),
            "failed_agents": len(
                [agent for agent in state.get("agent_statuses", []) if agent.get("status") == "failed"]
            ),
            "review_required": state.get("review_required", False),
        }

        for agent_name in ["classifier", "planner", "executor", "monitor", "recovery"]:
            self.memory_store.upsert_agent_memory(
                meeting_id,
                agent_name,
                {
                    "latest_stage": state.get("current_stage"),
                    "errors": state.get("errors", []),
                    "review_required": state.get("review_required", False),
                },
            )

        repository.save_graph_result(state, request_id=request_id)
        return state
