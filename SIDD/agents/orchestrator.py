import json
from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

ORCHESTRATOR_PROMPT = """You are the master orchestrator of a dynamic multi-agent system.
Your job is to analyze input (a meeting transcript, conversation, or request) and dynamically create a sequence of tailored workflow steps for specialized agents to execute.

Input:
\"\"\"{transcript}\"\"\"

═══ AVAILABLE TOOLS (what you can instruct agents to use) ═══

1. create_jira_ticket(title: str, description: str)
   → Creates a real Jira ticket. Use when tasks, bugs, or action items need tracking.

2. send_slack_message(channel: str, message: str)
   → Sends a Slack notification. Use for alerts, updates, or follow-up reminders.

3. schedule_calendar_event(title: str, time: str, attendees: list)
   → Schedules a calendar meeting/event. Use when follow-up meetings are needed.

═══ AVAILABLE DATA OUTPUTS (what agents can produce) ═══

Agents can populate these structured outputs:
- meeting_summary: A text summary of the input
- assigned_tasks: List of {{\"task\": "...", \"assignee\": "...", \"priority\": "high/medium/low"}}
- scheduled_events: List of {{\"title\": "...", \"time\": "...", \"attendees\": [...]}}
- bug_tickets: List of {{\"title\": "...", \"severity\": "...", \"description\": "..."}}
- followup_items: List of {{\"item\": "...", \"owner\": "..."}}
- execution_queue: List of tool calls to execute: {{\"tool\": "<tool_name>", \"args\": {{...}}, \"source_agent\": "<role>"}}

═══ YOUR TASK ═══

Analyze the input and create a workflow plan. For each step, define:
- A role name for the agent
- A detailed auto_prompt instruction telling the agent EXACTLY what to extract/produce
- In the auto_prompt, tell the agent WHICH data outputs to populate and WHICH tools to queue

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "steps": [
        {{
            "role": "AgentRoleName", 
            "auto_prompt": "Detailed instruction including which outputs to populate and which tools to call with what arguments"
        }}
    ],
    "reasoning": "Brief explanation of why you designed this workflow."
}}

Rules:
- Create as many steps as needed based on the input content
- Each auto_prompt MUST be extremely specific about the transcript content  
- If tasks are found, include a step that queues create_jira_ticket tool calls
- If meetings/events are mentioned, include a step that queues schedule_calendar_event
- If notifications are needed, include a step that queues send_slack_message
- Always include at least a summarizer step
- Tool calls in execution_queue MUST use format: {{"tool": "<name>", "args": {{...}}, "source_agent": "<role>"}}
"""

def orchestrator_node(state: AgentState) -> dict:
    """
    🧠 ORCHESTRATOR 
    Analyzes the meeting transcript and DYNAMICALLY builds a sequence of steps with tailored auto-prompts.
    Now includes full awareness of available tools so the LLM can design actionable workflows.
    """
    print("\n" + "=" * 60)
    print("🧠 ORCHESTRATOR: Generating dynamic auto-prompts...")
    print("=" * 60)
    
    transcript = state.get("meeting_transcript", "")
    
    # ═══ CALL LLM ═══
    prompt = ORCHESTRATOR_PROMPT.format(transcript=transcript)
    
    result = call_gemini_safe(
        prompt, 
        fallback={
            "steps": [{"role": "Summarizer", "auto_prompt": "Summarize the transcript and populate meeting_summary."}], 
            "reasoning": "Fallback to basic summary."
        }
    )
    
    steps = result.get("steps", [{"role": "Summarizer", "auto_prompt": "Summarize the transcript and populate meeting_summary."}])
    reasoning = result.get("reasoning", "No reasoning provided")
    
    print(f"\n   📋 Dynamic Steps Created: {len(steps)}")
    for s in steps:
        print(f"      - [{s.get('role')}]: {s.get('auto_prompt', '')[:80]}...")
    print(f"   💭 Reasoning: {reasoning}")
    
    audit_log = state.get("audit_log", [])
    audit_log.append(f"[{datetime.now().isoformat()}] ORCHESTRATOR: Created {len(steps)} dynamic steps | Reason={reasoning}")
    
    return {
        "dynamic_steps": steps,
        "waiting_agents": {},
        "completed_steps": [],
        "orchestrator_reasoning": reasoning,
        "audit_log": audit_log,
    }
