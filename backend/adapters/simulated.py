"""
Simulated execution adapters for approval-first milestone.
"""
from __future__ import annotations

from typing import Any, Dict

from graph.state import utc_now_iso


class SimulatedAdapterFactory:
    def simulate(self, adapter_type: str, task: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "adapter_type": adapter_type,
            "status": "simulated",
            "target": self._target_for_adapter(adapter_type),
            "summary": f"Simulated {adapter_type} action for task '{task['title']}'",
            "created_at": utc_now_iso(),
        }

    def _target_for_adapter(self, adapter_type: str) -> str:
        return {
            "task_tracker": "internal-task-board",
            "approval_gate": "human-approval-queue",
            "calendar": "calendar-simulation",
            "incident_tracker": "incident-simulation",
        }.get(adapter_type, "simulation")
