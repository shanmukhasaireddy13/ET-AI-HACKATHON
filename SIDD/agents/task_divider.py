from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
from tools.database import sync_agent_reasoning

TASK_DIVIDER_PROMPT = """You are a Task Divider AI agent. Your job is to analyze a meeting transcript and extract all actionable tasks.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract each task. For each task, provide:
- A clear, concise title
- The assignee (if mentioned, otherwise "unassigned")
- Priority (high/medium/low)
- Deadline (if mentioned, otherwise "TBD")

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "tasks": [
        {{"title": "task description", "assignee": "person", "priority": "high", "deadline": "2023-12-01"}}
    ]
}}
"""

def task_divider_node(state: AgentState) -> dict:
    """
    📋 TASK DIVIDER AGENT (Pure Extractor)
    Identifies all actionable tasks from the transcript.
    Does NOT queue any tool calls — only returns structured data.
    """
    print("\n📋 TASK DIVIDER: Extracting tasks...")

    transcript = state.get("meeting_transcript", "")

    prompt = TASK_DIVIDER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"tasks": []})

    assigned_tasks = result.get("tasks", [])

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] TASK_DIVIDER: Extracted {len(assigned_tasks)} tasks")

    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "task_divider",
        "reasoning": f"Extracted {len(assigned_tasks)} actionable tasks from transcript.",
        "outputs_produced": {"tasks": assigned_tasks}
    })

    print(f"   ✅ Task extraction complete: {len(assigned_tasks)} tasks found")
    
    # Real-time Sync
    sync_agent_reasoning(state.get("meeting_id"), "task_divider", f"Extracted {len(assigned_tasks)} actionable tasks from transcript.", {"tasks_count": len(assigned_tasks)})

    return {
        "assigned_tasks": assigned_tasks,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning,
    }
