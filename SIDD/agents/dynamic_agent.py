import json
from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

DYNAMIC_AGENT_PROMPT = """You are acting as an AI Agent dynamically assigned to the role: {role}

Your specific instruction (auto_prompt) for this execution:
{auto_prompt}

Input Transcript:
\"\"\"{transcript}\"\"\"

═══ AVAILABLE TOOLS YOU CAN QUEUE ═══
If your instructions say to call tools, add them to execution_queue using this EXACT format:
- create_jira_ticket: {{"tool": "create_jira_ticket", "args": {{"title": "...", "description": "..."}}, "source_agent": "{role}"}}
- send_slack_message: {{"tool": "send_slack_message", "args": {{"channel": "#general", "message": "..."}}, "source_agent": "{role}"}}
- schedule_calendar_event: {{"tool": "schedule_calendar_event", "args": {{"title": "...", "time": "...", "attendees": [...]}}, "source_agent": "{role}"}}

═══ OUTPUT FORMAT ═══
Execute your instruction carefully. Return ONLY a valid JSON object (no markdown, no backticks).

CRITICAL: You MUST include a "reasoning" field that explains:
- WHY you chose these specific outputs
- WHAT evidence from the transcript drove each decision
- HOW this connects to the overall workflow goal

{{
    "reasoning": "Explain WHY you made each decision, citing specific parts of the transcript",
    "meeting_summary": "Summary text if relevant",
    "assigned_tasks": [{{"task": "...", "assignee": "...", "priority": "high/medium/low"}}],
    "scheduled_events": [{{"title": "...", "time": "...", "attendees": [...]}}],
    "bug_tickets": [{{"title": "...", "severity": "...", "description": "..."}}],
    "followup_items": [{{"item": "...", "owner": "..."}}],
    "execution_queue": [{{"tool": "<tool_name>", "args": {{...}}, "source_agent": "{role}"}}]
}}
Only include the keys that make sense for your role. ALWAYS include reasoning.
"""

def dynamic_agent_node(state: AgentState) -> dict:
    """
    🤖 DYNAMIC AGENT (Agentic — with reasoning)
    Executes the auto_prompt created by the Orchestrator for the current step.
    Now captures and logs WHY each decision was made — the key differentiator
    between automation and agentic AI.
    """
    steps = state.get("dynamic_steps", [])
    if not steps:
        return {}

    current_step = steps[0]
    role = current_step.get("role", "UnknownRole")
    auto_prompt = current_step.get("auto_prompt", "Do nothing.")
    
    print("\n" + "-" * 60)
    print(f"🤖 DYNAMIC AGENT [{role}]: Executing auto-prompt...")
    print("-" * 60)
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL LLM ═══
    prompt = DYNAMIC_AGENT_PROMPT.format(role=role, auto_prompt=auto_prompt, transcript=transcript)
    result = call_gemini_safe(prompt, fallback={})
    
    updates = {}
    
    # ═══ CAPTURE REASONING (Agentic differentiator) ═══
    reasoning = result.get("reasoning", "No reasoning provided by agent")
    agent_reasoning = list(state.get("agent_reasoning", []))
    reasoning_entry = {
        "agent": role,
        "reasoning": reasoning,
        "timestamp": datetime.now().isoformat(),
        "outputs_produced": []
    }
    
    if "meeting_summary" in result and result["meeting_summary"]:
        existing_summary = state.get("meeting_summary", "")
        updates["meeting_summary"] = existing_summary + "\n" + result["meeting_summary"] if existing_summary else result["meeting_summary"]
        reasoning_entry["outputs_produced"].append("meeting_summary")
        
    for list_key in ["assigned_tasks", "scheduled_events", "bug_tickets", "followup_items", "execution_queue"]:
        if list_key in result and isinstance(result[list_key], list) and result[list_key]:
            existing_list = list(state.get(list_key, []))
            updates[list_key] = existing_list + result[list_key]
            reasoning_entry["outputs_produced"].append(f"{list_key}: {len(result[list_key])} items")
    
    agent_reasoning.append(reasoning_entry)
    updates["agent_reasoning"] = agent_reasoning
    
    # Remove this step from dynamic_steps and add to completed_steps
    remaining_steps = steps[1:]
    completed_steps = list(state.get("completed_steps", []))
    completed_steps.append(current_step)
    
    updates["dynamic_steps"] = remaining_steps
    updates["completed_steps"] = completed_steps
    
    # ═══ RICH AUDIT LOG (shows WHY, not just WHAT) ═══
    audit_log = list(state.get("audit_log", []))
    audit_log.append(
        f"[{datetime.now().isoformat()}] DYNAMIC_AGENT [{role}]: "
        f"Executed auto-prompt | REASONING: {reasoning[:200]}"
    )
    updates["audit_log"] = audit_log
    
    print(f"   ✅ Finished executing role: {role}")
    print(f"   💭 Reasoning: {reasoning[:120]}...")
    if updates.get("assigned_tasks"):
        print(f"      - Added {len(result.get('assigned_tasks', []))} tasks")
    if updates.get("scheduled_events"):
        print(f"      - Added {len(result.get('scheduled_events', []))} events")
    if updates.get("bug_tickets"):
        print(f"      - Added {len(result.get('bug_tickets', []))} bug tickets")
    if updates.get("followup_items"):
        print(f"      - Added {len(result.get('followup_items', []))} follow-ups")
    if updates.get("execution_queue"):
        new_tools = len(result.get('execution_queue', []))
        print(f"      - Queued {new_tools} tool calls for execution")
        
    return updates
