from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

TASK_DIVIDER_PROMPT = """You are a Task Divider AI agent. Your job is to analyze a meeting transcript and extract all actionable tasks.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract all tasks that need to be done. For each task, determine:
- A clear title
- Who should be assigned (if mentioned, otherwise use "unassigned")
- Priority (high/medium/low)
- Deadline (if mentioned, otherwise use "TBD")

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "tasks": [
        {{"id": "TASK-001", "title": "task description", "assignee": "person or team", "priority": "high", "deadline": "date or TBD"}},
    ],
    "additional_agents_needed": [],
    "waiting_on": []
}}

For additional_agents_needed: if you notice the transcript also mentions scheduling meetings, bugs, or follow-ups that weren't your primary task, list those agent names: "scheduler", "bug_tracker", "followup", "summary"
For waiting_on: ONLY list valid agent names if you absolutely cannot proceed without them. Usually, you do NOT need to wait. Return [] in most cases. Valid agents: "scheduler", "bug_tracker", "followup", "summary".
"""

def task_divider_node(state: AgentState) -> dict:
    """
    📋 TASK DIVIDER AGENT (Gemini Flash Powered)
    Extracts actionable tasks from the meeting transcript.
    Can dynamically chain to other agents if it detects additional work.
    """
    print("\n📋 TASK DIVIDER: Extracting tasks with Gemini Flash...")
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL GEMINI FLASH ═══
    prompt = TASK_DIVIDER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"tasks": [], "additional_agents_needed": [], "waiting_on": []})
    
    assigned_tasks = result.get("tasks", [])
    extra_agents = result.get("additional_agents_needed", [])
    
    # Filter waiting_on strictly and ignore already completed agents
    valid_agents = {"scheduler", "bug_tracker", "followup", "summary"}
    raw_waiting = result.get("waiting_on", [])
    completed = list(state.get("completed_agents", []))
    if isinstance(raw_waiting, list):
        waiting_on = [a for a in raw_waiting if a in valid_agents and a not in completed]
    else:
        waiting_on = []
    
    pending_agents = list(state.get("pending_agents", []))
    if "task_divider" in pending_agents:
        pending_agents.remove("task_divider")
        
    audit_log = list(state.get("audit_log", []))
    
    if waiting_on:
        print(f"   ⏳ TASK DIVIDER waiting on: {waiting_on}")
        waiting_agents = dict(state.get("waiting_agents", {}))
        waiting_agents["task_divider"] = waiting_on
        audit_log.append(f"[{datetime.now().isoformat()}] TASK_DIVIDER: Waiting on {waiting_on}")
        return {
            "pending_agents": pending_agents,
            "waiting_agents": waiting_agents,
            "audit_log": audit_log,
        }
    
    # ─── Build execution queue ───
    execution_queue = list(state.get("execution_queue", []))
    for task in assigned_tasks:
        execution_queue.append({
            "tool": "create_jira_ticket",
            "args": {"title": task.get("title", "Untitled"), "description": f"Assigned to {task.get('assignee', 'unassigned')}. Priority: {task.get('priority', 'medium')}. Due: {task.get('deadline', 'TBD')}"},
            "source_agent": "task_divider",
        })
        execution_queue.append({
            "tool": "send_slack_message",
            "args": {"channel": "#tasks", "message": f"📋 New task: {task.get('title', 'Untitled')} — Assigned to: {task.get('assignee', 'unassigned')}"},
            "source_agent": "task_divider",
        })
    
    # ═══ DYNAMIC CHAINING & UNBLOCKING ═══
    completed = list(state.get("completed_agents", []))
    completed.append("task_divider")
    
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
    
    audit_log.append(f"[{datetime.now().isoformat()}] TASK_DIVIDER: {len(assigned_tasks)} tasks extracted, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(assigned_tasks)} tasks extracted")
    
    return {
        "assigned_tasks": assigned_tasks,
        "execution_queue": execution_queue,
        "pending_agents": pending_agents,
        "waiting_agents": waiting_agents,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
