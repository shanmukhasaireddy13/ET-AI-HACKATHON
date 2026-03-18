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
    "additional_agents_needed": []
}}

For additional_agents_needed: if the transcript also mentions tasks, scheduling, or follow-ups, list those agent names: "task_divider", "scheduler", "followup", "summary"
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
    result = call_gemini_safe(prompt, fallback={"bugs": [], "additional_agents_needed": []})
    
    bug_tickets = result.get("bugs", [])
    extra_agents = result.get("additional_agents_needed", [])
    
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
    
    # ═══ DYNAMIC CHAINING ═══
    dynamic_plan = list(state.get("dynamic_plan", []))
    completed = list(state.get("completed_agents", []))
    index = state.get("current_agent_index", 0)
    completed.append("bug_tracker")
    
    for agent in extra_agents:
        if agent not in dynamic_plan and agent not in completed:
            dynamic_plan.append(agent)
            print(f"   🔗 Gemini chained: Added '{agent}' to plan")
    
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] BUG_TRACKER: {len(bug_tickets)} bugs, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(bug_tickets)} bugs tracked")
    
    return {
        "bug_tickets": bug_tickets,
        "execution_queue": execution_queue,
        "dynamic_plan": dynamic_plan,
        "current_agent_index": index + 1,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
