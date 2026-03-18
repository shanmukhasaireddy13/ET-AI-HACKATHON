from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

SCHEDULER_PROMPT = """You are a Scheduling AI agent. Your job is to extract all meeting/calendar scheduling requests from a transcript.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract all events that need to be scheduled. For each event, determine:
- A clear title
- Proposed time (if mentioned, otherwise suggest a reasonable time)
- List of attendees (if mentioned, otherwise use ["team"])

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "events": [
        {{"id": "EVT-001", "title": "event name", "time": "YYYY-MM-DDTHH:MM", "attendees": ["person1", "person2"]}},
    ],
    "additional_agents_needed": []
}}

For additional_agents_needed: if the transcript also mentions tasks, bugs, or follow-ups, list those agent names: "task_divider", "bug_tracker", "followup", "summary"
"""

def scheduler_node(state: AgentState) -> dict:
    """
    📅 SCHEDULING AGENT (Gemini Flash Powered)
    Extracts scheduling requests and builds calendar events.
    """
    print("\n📅 SCHEDULER: Extracting events with Gemini Flash...")
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL GEMINI FLASH ═══
    prompt = SCHEDULER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"events": [], "additional_agents_needed": []})
    
    scheduled_events = result.get("events", [])
    extra_agents = result.get("additional_agents_needed", [])
    
    # ─── Build execution queue ───
    execution_queue = list(state.get("execution_queue", []))
    for event in scheduled_events:
        execution_queue.append({
            "tool": "schedule_calendar_event",
            "args": {"title": event.get("title", "Meeting"), "time": event.get("time", "TBD"), "attendees": event.get("attendees", ["team"])},
            "source_agent": "scheduler",
        })
        execution_queue.append({
            "tool": "send_slack_message",
            "args": {"channel": "#general", "message": f"📅 Scheduled: {event.get('title', 'Meeting')} at {event.get('time', 'TBD')}"},
            "source_agent": "scheduler",
        })
    
    # ═══ DYNAMIC CHAINING ═══
    dynamic_plan = list(state.get("dynamic_plan", []))
    completed = list(state.get("completed_agents", []))
    index = state.get("current_agent_index", 0)
    completed.append("scheduler")
    
    for agent in extra_agents:
        if agent not in dynamic_plan and agent not in completed:
            dynamic_plan.append(agent)
            print(f"   🔗 Gemini chained: Added '{agent}' to plan")
    
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] SCHEDULER: {len(scheduled_events)} events, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(scheduled_events)} events scheduled")
    
    return {
        "scheduled_events": scheduled_events,
        "execution_queue": execution_queue,
        "dynamic_plan": dynamic_plan,
        "current_agent_index": index + 1,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
