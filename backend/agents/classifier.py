"""
Classifier agent for meeting transcript analysis.
"""
from __future__ import annotations

import hashlib
import json
import logging
import re
from typing import Any, Dict, List

from agents.base import GraphAgent
from graph.state import GraphState


logger = logging.getLogger(__name__)


class LocalTranscriptClassifier:
    analysis_method = "Deterministic local fallback using transcript heuristics."

    WORKFLOW_RULES = {
        "task_creation": {
            "keywords": ["build", "create", "implement", "prepare", "deliver", "update", "complete", "finish"],
            "confidence": 0.77,
        },
        "approval_needed": {
            "keywords": ["approval", "approve", "sign-off", "budget", "legal", "cfo", "ceo", "review"],
            "confidence": 0.84,
        },
        "scheduling": {
            "keywords": ["schedule", "meeting", "demo", "sync", "calendar", "next monday", "friday", "tuesday"],
            "confidence": 0.8,
        },
        "issue_resolution": {
            "keywords": ["issue", "bug", "problem", "failure", "failing", "crash", "investigate", "fix"],
            "confidence": 0.82,
        },
    }

    def _extract_transcript(self, prompt: str) -> str:
        match = re.search(r"---TRANSCRIPT---\s*(.*?)\s*---END TRANSCRIPT---", prompt, re.DOTALL)
        return match.group(1) if match else prompt

    def generate_content(self, prompt: str, temperature: float = 0.3, max_tokens: int = 2000) -> str:
        transcript = self._extract_transcript(prompt)
        lowered = transcript.lower()
        workflows: List[Dict[str, Any]] = []

        owner_match = re.search(r"\b([A-Z][a-z]+)\b\s+(?:will|should|can)\b", transcript)
        due_match = re.search(
            r"\b(by\s+[A-Z][a-z]+|next\s+[A-Z][a-z]+|tomorrow|today|this\s+week|next\s+week)\b",
            transcript,
            re.IGNORECASE,
        )

        for workflow_type, rule in self.WORKFLOW_RULES.items():
            hits = [keyword for keyword in rule["keywords"] if keyword in lowered]
            if not hits:
                continue
            workflows.append(
                {
                    "type": workflow_type,
                    "confidence": round(min(0.97, rule["confidence"] + (0.03 * min(len(hits), 3))), 2),
                    "description": f"Detected {workflow_type.replace('_', ' ')} from transcript signals: {', '.join(hits[:4])}.",
                    "owner_hint": owner_match.group(1) if owner_match else None,
                    "due_date_text": due_match.group(0) if due_match else None,
                    "risk_level": "high" if workflow_type == "issue_resolution" else "medium",
                    "requires_approval": workflow_type == "approval_needed",
                    "unresolved_issues": ["Needs human review"] if workflow_type == "issue_resolution" else [],
                    "metadata": {"signals": hits[:4]},
                }
            )

        return json.dumps({"workflows": workflows})


class MockClassifierLLM:
    analysis_method = "Simple mock classifier for smoke tests."

    def generate_content(self, prompt: str, temperature: float = 0.3, max_tokens: int = 2000) -> str:
        return json.dumps(
            {
                "workflows": [
                    {
                        "type": "task_creation",
                        "confidence": 0.9,
                        "description": "Mock task creation workflow.",
                        "owner_hint": "MockOwner",
                        "due_date_text": "next week",
                        "risk_level": "low",
                        "requires_approval": False,
                        "unresolved_issues": [],
                        "metadata": {"mode": "mock"},
                    }
                ]
            }
        )


class ClassifierAgent(GraphAgent):
    stage = "classification"

    def __init__(self, llm_client: Any):
        super().__init__(name="classifier")
        self.llm_client = llm_client

    def run(self, state: GraphState) -> GraphState:
        transcript = state["transcript"]
        state["current_stage"] = self.stage
        self.mark_agent_started(
            state,
            detail="Analyzing transcript for workflows, approvals, deadlines, and risks.",
            tools_used=["llm.generate_content"],
        )

        if not transcript.strip():
            self.add_error(state, category="validation", error="Transcript is empty", recoverable=False)
            self.add_audit(
                state,
                action="Skipped classification",
                reason="Transcript is empty.",
                input_data={"transcript_length": 0},
                output_data={},
                success=False,
                error_message="Transcript is empty",
            )
            state["review_required"] = True
            state["failure_category"] = "validation"
            self.mark_agent_finished(
                state,
                status="failed",
                detail="Classifier could not run because the transcript was empty.",
                output_summary={"workflow_count": 0},
                failure_category="validation",
            )
            return state

        prompt = self._build_prompt(transcript)
        try:
            raw = self.llm_client.generate_content(prompt, temperature=0.2, max_tokens=2000)
            workflows = self._parse_response(raw)
            state["workflows"] = workflows
            low_confidence = any(workflow["confidence"] < 0.55 for workflow in workflows)
            if low_confidence:
                state["review_required"] = True
                state["failure_category"] = "low_confidence"

            self.add_audit(
                state,
                action=f"Detected {len(workflows)} workflow(s)",
                reason=(
                    f"Classifier analyzed the full transcript using {getattr(self.llm_client, 'analysis_method', 'configured classifier')}."
                ),
                input_data={"transcript_length": len(transcript)},
                output_data={"workflow_types": [workflow["type"] for workflow in workflows]},
            )
            self.mark_agent_finished(
                state,
                status="completed",
                detail="Classifier produced normalized workflow candidates for downstream planning.",
                output_summary={
                    "workflow_count": len(workflows),
                    "review_required": state.get("review_required", False),
                },
                failure_category=state.get("failure_category"),
            )
            return state
        except Exception as exc:
            self.logger.exception("Classification failed")
            self.add_error(state, category="classification_failure", error=str(exc), recoverable=True)
            self.add_audit(
                state,
                action="Classification failed",
                reason="The classifier could not parse or generate workflow output.",
                input_data={"transcript_length": len(transcript)},
                output_data={},
                success=False,
                error_message=str(exc),
            )
            state["review_required"] = True
            state["failure_category"] = "classification_failure"
            self.mark_agent_finished(
                state,
                status="failed",
                detail="Classifier failed and handed control to recovery logic.",
                output_summary={"workflow_count": 0},
                failure_category="classification_failure",
            )
            return state

    def _build_prompt(self, transcript: str) -> str:
        return f"""
Analyze the full meeting transcript and return JSON only.

Detect ALL workflow categories that appear in the transcript.
Create ONE object per detected workflow category.
Never combine multiple workflow types into one object.
The "type" field must be exactly one of:
- task_creation
- approval_needed
- scheduling
- issue_resolution

Return:
{{
  "workflows": [
    {{
      "type": "task_creation",
      "confidence": 0.0,
      "description": "short explanation",
      "owner_hint": "name or null",
      "due_date_text": "due phrase or null",
      "risk_level": "low|medium|high",
      "requires_approval": true,
      "unresolved_issues": ["optional list"],
      "metadata": {{}}
    }}
  ]
}}

---TRANSCRIPT---
{transcript}
---END TRANSCRIPT---
""".strip()

    def _parse_response(self, raw: str) -> List[Dict[str, Any]]:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0) if match else raw)
        workflows: List[Dict[str, Any]] = []
        valid_types = {"task_creation", "approval_needed", "scheduling", "issue_resolution"}
        for item in payload.get("workflows", []):
            workflow_type = str(item.get("type", "")).lower().strip()
            candidate_types = [workflow_type] if workflow_type in valid_types else []
            if not candidate_types:
                candidate_types = [candidate for candidate in valid_types if candidate in workflow_type]

            for candidate_type in candidate_types:
                stable_id = hashlib.sha1(
                    f"{candidate_type}:{item.get('description', '')}:{item.get('owner_hint')}:{item.get('due_date_text')}".encode("utf-8")
                ).hexdigest()[:16]
                workflows.append(
                    {
                        "id": f"wf-{stable_id}",
                        "type": candidate_type,
                        "description": str(item.get("description", ""))[:500],
                        "confidence": max(0.0, min(1.0, float(item.get("confidence", 0.5)))),
                        "owner_hint": item.get("owner_hint"),
                        "due_date_text": item.get("due_date_text"),
                        "risk_level": item.get("risk_level", "medium"),
                        "requires_approval": bool(item.get("requires_approval", candidate_type == "approval_needed")),
                        "unresolved_issues": item.get("unresolved_issues", []),
                        "metadata": item.get("metadata", {}),
                    }
                )

        deduped = []
        seen_ids = set()
        for workflow in workflows:
            if workflow["id"] in seen_ids:
                continue
            seen_ids.add(workflow["id"])
            deduped.append(workflow)
        return deduped
