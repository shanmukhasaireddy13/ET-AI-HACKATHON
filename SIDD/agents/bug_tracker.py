from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
from tools.database import sync_agent_reasoning

BUG_TRACKER_PROMPT = """You are a Bug Tracker AI agent. Your job is to extract all bugs, issues, and defects mentioned in a meeting transcript.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract all bugs/issues. For each, determine:
- A clear title
- Severity (critical/high/medium/low)
- Who reported it (if mentioned, otherwise "team")

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "bugs": [
        {{"id": "BUG-001", "title": "bug description", "severity": "critical", "reporter": "person or team"}}
    ]
}}
"""

def bug_tracker_node(state: AgentState) -> dict:
    """
    🐛 BUG TRACKER AGENT (Pure Extractor)
    Extracts bugs/issues from the transcript.
    Does NOT queue any tool calls — only returns structured data.
    """
    print("\n🐛 BUG TRACKER: Extracting bugs...")

    transcript = state.get("meeting_transcript", "")

    prompt = BUG_TRACKER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"bugs": []})

    bug_tickets = result.get("bugs", [])

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] BUG_TRACKER: Extracted {len(bug_tickets)} bugs")

    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "bug_tracker",
        "reasoning": f"Extracted {len(bug_tickets)} bugs/issues from transcript.",
        "outputs_produced": {"bugs": bug_tickets}
    })

    print(f"   ✅ Bug tracking complete: {len(bug_tickets)} bugs found")
    
    # Real-time Sync
    sync_agent_reasoning(state.get("meeting_id"), "bug_tracker", f"Extracted {len(bug_tickets)} bugs/issues from transcript.", {"bug_count": len(bug_tickets)})

    return {
        "bug_tickets": bug_tickets,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning,
    }
