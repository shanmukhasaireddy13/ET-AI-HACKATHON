from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

FOLLOWUP_PROMPT = """You are a Follow-Up AI agent. Your job is to extract all follow-up actions, reminders, and status checks from a meeting transcript.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Context — Other agents have already handled:
- Tasks assigned: {tasks_count}
- Events scheduled: {events_count}
- Bugs tracked: {bugs_count}

Extract follow-up items that still need tracking. For each:
- A clear action description
- Who is responsible
- Due date (if mentioned, otherwise "ASAP")

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "followups": [
        {{"id": "FU-001", "action": "what needs to be done", "owner": "person or role", "due": "date or ASAP"}},
    ],
    "waiting_on": []
}}
For waiting_on: ONLY list valid agent names. Valid agents: "task_divider", "scheduler", "bug_tracker", "summary". If you need tasks or scheduled events to be processed first, return ["task_divider", "scheduler"]. Otherwise return [].
"""

def followup_node(state: AgentState) -> dict:
    """
    🔄 FOLLOW-UP AGENT (Gemini Flash Powered)
    Generates follow-up reminders, aware of what other agents already handled.
    """
    print("\n🔄 FOLLOW-UP: Extracting follow-ups with Gemini Flash...")
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL GEMINI FLASH (context-aware) ═══
    prompt = FOLLOWUP_PROMPT.format(
        transcript=transcript,
        tasks_count=len(state.get("assigned_tasks", [])),
        events_count=len(state.get("scheduled_events", [])),
        bugs_count=len(state.get("bug_tickets", [])),
    )
    result = call_gemini_safe(prompt, fallback={"followups": [], "waiting_on": []})
    
    followup_items = result.get("followups", [])
    
    # Filter waiting_on strictly and ignore already completed agents
    valid_agents = {"task_divider", "scheduler", "bug_tracker", "summary"}
    raw_waiting = result.get("waiting_on", [])
    completed = list(state.get("completed_agents", []))
    if isinstance(raw_waiting, list):
        waiting_on = [a for a in raw_waiting if a in valid_agents and a not in completed]
    else:
        waiting_on = []
    
    pending_agents = list(state.get("pending_agents", []))
    if "followup" in pending_agents:
        pending_agents.remove("followup")
        
    audit_log = list(state.get("audit_log", []))
    
    if waiting_on:
        print(f"   ⏳ FOLLOW-UP waiting on: {waiting_on}")
        waiting_agents = dict(state.get("waiting_agents", {}))
        waiting_agents["followup"] = waiting_on
        audit_log.append(f"[{datetime.now().isoformat()}] FOLLOWUP: Waiting on {waiting_on}")
        return {
            "pending_agents": pending_agents,
            "waiting_agents": waiting_agents,
            "audit_log": audit_log,
        }
    
    # ─── Build execution queue ───
    execution_queue = list(state.get("execution_queue", []))
    for item in followup_items:
        execution_queue.append({
            "tool": "send_slack_message",
            "args": {"channel": f"#{item.get('owner', 'general')}", "message": f"🔄 Follow-up: {item.get('action', '')} — Due: {item.get('due', 'ASAP')}"},
            "source_agent": "followup",
        })
    
    # ═══ UNBLOCKING ═══
    completed = list(state.get("completed_agents", []))
    completed.append("followup")
    
    waiting_agents = dict(state.get("waiting_agents", {}))
    # Unblock agents whose dependencies are met
    for agent, deps in list(waiting_agents.items()):
        if all(d in completed for d in deps):
            print(f"   🟢 Unblocked agent: {agent}")
            pending_agents.append(agent)
            del waiting_agents[agent]
            
    audit_log.append(f"[{datetime.now().isoformat()}] FOLLOWUP: {len(followup_items)} follow-ups created")
    
    print(f"   ✅ {len(followup_items)} follow-ups created")
    
    return {
        "followup_items": followup_items,
        "execution_queue": execution_queue,
        "pending_agents": pending_agents,
        "waiting_agents": waiting_agents,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
