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
    "additional_agents_needed": []
}}

For additional_agents_needed: if you notice the transcript also mentions scheduling meetings, bugs, or follow-ups that weren't your primary task, list those agent names: "scheduler", "bug_tracker", "followup", "summary"
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
    result = call_gemini_safe(prompt, fallback={"tasks": [], "additional_agents_needed": []})
    
    assigned_tasks = result.get("tasks", [])
    extra_agents = result.get("additional_agents_needed", [])
    
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
    
    # ═══ DYNAMIC CHAINING — Gemini decides if more agents needed ═══
    dynamic_plan = list(state.get("dynamic_plan", []))
    completed = list(state.get("completed_agents", []))
    index = state.get("current_agent_index", 0)
    completed.append("task_divider")
    
    for agent in extra_agents:
        if agent not in dynamic_plan and agent not in completed:
            dynamic_plan.append(agent)
            print(f"   🔗 Gemini chained: Added '{agent}' to plan")
    
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] TASK_DIVIDER: {len(assigned_tasks)} tasks extracted, {len(extra_agents)} agents chained")
    
    print(f"   ✅ {len(assigned_tasks)} tasks extracted")
    
    return {
        "assigned_tasks": assigned_tasks,
        "execution_queue": execution_queue,
        "dynamic_plan": dynamic_plan,
        "current_agent_index": index + 1,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
