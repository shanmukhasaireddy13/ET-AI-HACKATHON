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
    "additional_agents_needed": [],
    "waiting_on": []
}}

For additional_agents_needed: if the transcript also mentions tasks, bugs, or follow-ups, list those agent names: "task_divider", "bug_tracker", "followup", "summary"
For waiting_on: ONLY list valid agent names. Valid agents: "task_divider", "bug_tracker", "followup", "summary". If you need tasks to be divided first, return ["task_divider"]. Otherwise return [].
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
    result = call_gemini_safe(prompt, fallback={"events": [], "additional_agents_needed": [], "waiting_on": []})
    
    scheduled_events = result.get("events", [])
    extra_agents = result.get("additional_agents_needed", [])
    
    # Filter waiting_on strictly and ignore already completed agents
    valid_agents = {"task_divider", "bug_tracker", "followup", "summary"}
    raw_waiting = result.get("waiting_on", [])
    completed = list(state.get("completed_agents", []))
    if isinstance(raw_waiting, list):
        waiting_on = [a for a in raw_waiting if a in valid_agents and a not in completed]
    else:
        waiting_on = []
    
    pending_agents = list(state.get("pending_agents", []))
    if "scheduler" in pending_agents:
        pending_agents.remove("scheduler")
        
    audit_log = list(state.get("audit_log", []))
    
    if waiting_on:
        print(f"   ⏳ SCHEDULER waiting on: {waiting_on}")
        waiting_agents = dict(state.get("waiting_agents", {}))
        waiting_agents["scheduler"] = waiting_on
        audit_log.append(f"[{datetime.now().isoformat()}] SCHEDULER: Waiting on {waiting_on}")
        return {
            "pending_agents": pending_agents,
            "waiting_agents": waiting_agents,
            "audit_log": audit_log,
        }
    
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
    
    # ═══ DYNAMIC CHAINING & UNBLOCKING ═══
    completed = list(state.get("completed_agents", []))
    completed.append("scheduler")
    
    waiting_agents = dict(state.get("waiting_agents", {}))
    # Unblock agents whose dependencies are met
    for agent, deps in list(waiting_agents.items()):
        if all(d in completed for d in deps):
            print(f"   🟢 Unblocked agent: {agent}")
            pending_agents.append(agent)
            del waiting_agents[agent]
            
    for agent in extra_agents:
        if agent not in completed and agent not in pending_agents and agent not in waiting_agents:
            pending_agents.append(agent)
            print(f"   🔗 Gemini chained: Added '{agent}' to plan")
    
    audit_log.append(f"[{datetime.now().isoformat()}] SCHEDULER: {len(scheduled_events)} events, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(scheduled_events)} events scheduled")
    
    return {
        "scheduled_events": scheduled_events,
        "execution_queue": execution_queue,
        "pending_agents": pending_agents,
        "waiting_agents": waiting_agents,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
