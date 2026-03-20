from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

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
        {{"id": "BUG-001", "title": "bug description", "severity": "critical", "reporter": "person or team"}},
    ],
    "additional_agents_needed": [],
    "waiting_on": []
}}

For additional_agents_needed: if the transcript also mentions tasks, scheduling, or follow-ups, list those agent names: "task_divider", "scheduler", "followup", "summary"
For waiting_on: ONLY list valid agent names. Valid agents: "task_divider", "scheduler", "followup", "summary". Usually, you will not need to wait. Return [].
"""

def bug_tracker_node(state: AgentState) -> dict:
    """
    🐛 BUG TRACKER AGENT (Gemini Flash Powered)
    Extracts bugs/issues and creates tracking tickets.
    """
    print("\n🐛 BUG TRACKER: Extracting bugs with Gemini Flash...")
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL GEMINI FLASH ═══
    prompt = BUG_TRACKER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"bugs": [], "additional_agents_needed": [], "waiting_on": []})
    
    bug_tickets = result.get("bugs", [])
    extra_agents = result.get("additional_agents_needed", [])
    
    # Filter waiting_on strictly and ignore already completed agents
    valid_agents = {"task_divider", "scheduler", "followup", "summary"}
    raw_waiting = result.get("waiting_on", [])
    completed = list(state.get("completed_agents", []))
    if isinstance(raw_waiting, list):
        waiting_on = [a for a in raw_waiting if a in valid_agents and a not in completed]
    else:
        waiting_on = []
    
    pending_agents = list(state.get("pending_agents", []))
    if "bug_tracker" in pending_agents:
        pending_agents.remove("bug_tracker")
        
    audit_log = list(state.get("audit_log", []))
    
    if waiting_on:
        print(f"   ⏳ BUG TRACKER waiting on: {waiting_on}")
        waiting_agents = dict(state.get("waiting_agents", {}))
        waiting_agents["bug_tracker"] = waiting_on
        audit_log.append(f"[{datetime.now().isoformat()}] BUG_TRACKER: Waiting on {waiting_on}")
        return {
            "pending_agents": pending_agents,
            "waiting_agents": waiting_agents,
            "audit_log": audit_log,
        }
    
    # ─── Build execution queue ───
    execution_queue = list(state.get("execution_queue", []))
    for bug in bug_tickets:
        severity = bug.get("severity", "medium")
        execution_queue.append({
            "tool": "create_jira_ticket",
            "args": {"title": f"[{severity.upper()}] {bug.get('title', 'Bug')}", "description": f"Reported by: {bug.get('reporter', 'team')}. Severity: {severity}"},
            "source_agent": "bug_tracker",
        })
        execution_queue.append({
            "tool": "send_slack_message",
            "args": {"channel": "#dev-alerts", "message": f"🐛 {severity.upper()}: {bug.get('title', 'Bug')}"},
            "source_agent": "bug_tracker",
        })
    
    # ═══ DYNAMIC CHAINING & UNBLOCKING ═══
    completed = list(state.get("completed_agents", []))
    completed.append("bug_tracker")
    
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
    
    audit_log.append(f"[{datetime.now().isoformat()}] BUG_TRACKER: {len(bug_tickets)} bugs, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(bug_tickets)} bugs tracked")
    
    return {
        "bug_tickets": bug_tickets,
        "execution_queue": execution_queue,
        "pending_agents": pending_agents,
        "waiting_agents": waiting_agents,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
