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
    ]
}}
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
    result = call_gemini_safe(prompt, fallback={"followups": []})
    
    followup_items = result.get("followups", [])
    
    # ─── Build execution queue ───
    execution_queue = list(state.get("execution_queue", []))
    for item in followup_items:
        execution_queue.append({
            "tool": "send_slack_message",
            "args": {"channel": f"#{item.get('owner', 'general')}", "message": f"🔄 Follow-up: {item.get('action', '')} — Due: {item.get('due', 'ASAP')}"},
            "source_agent": "followup",
        })
    
    # ═══ ADVANCE PLAN ═══
    dynamic_plan = list(state.get("dynamic_plan", []))
    completed = list(state.get("completed_agents", []))
    index = state.get("current_agent_index", 0)
    completed.append("followup")
    
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] FOLLOWUP: {len(followup_items)} follow-ups created")
    
    print(f"   ✅ {len(followup_items)} follow-ups created")
    
    return {
        "followup_items": followup_items,
        "execution_queue": execution_queue,
        "dynamic_plan": dynamic_plan,
        "current_agent_index": index + 1,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
