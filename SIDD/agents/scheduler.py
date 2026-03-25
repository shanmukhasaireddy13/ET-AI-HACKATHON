from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
from tools.database import sync_agent_reasoning

SCHEDULER_PROMPT = """You are a Scheduling AI agent. Your job is to extract all meeting/calendar scheduling requests from a transcript.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract each scheduling intent. For each, provide:
- Event title
- Date/Time (if mentioned)
- Attendees (list of names)

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "events": [
        {{"title": "event name", "time": "2023-12-01 10:00", "attendees": ["Alice", "Bob"]}}
    ]
}}
"""

def scheduler_node(state: AgentState) -> dict:
    """
    📅 SCHEDULER AGENT (Pure Extractor)
    Detects scheduling requests and calendar events.
    Does NOT queue any tool calls — only returns structured data.
    """
    print("\n📅 SCHEDULER: Extracting events...")

    transcript = state.get("meeting_transcript", "")

    prompt = SCHEDULER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"events": []})

    scheduled_events = result.get("events", [])

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] SCHEDULER: Extracted {len(scheduled_events)} events")

    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "scheduler",
        "reasoning": f"Extracted {len(scheduled_events)} calendar events from transcript.",
        "outputs_produced": {"events": scheduled_events}
    })

    print(f"   ✅ Scheduled {len(scheduled_events)} events")
    
    # Real-time Sync
    sync_agent_reasoning(state.get("meeting_id"), "scheduler", f"Extracted {len(scheduled_events)} calendar events from transcript.", {"events_count": len(scheduled_events)})

    return {
        "scheduled_events": scheduled_events,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning,
    }
