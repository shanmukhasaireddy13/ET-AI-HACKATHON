import json
from datetime import datetime
from state import AgentState
from utils.llm import call_gemini_safe

BRAIN_PROMPT = """You are the SIDD BRAIN, the autonomous reasoning core of a multi-agent AI system.
Your job is to fulfill a Strategic Directive by selecting the right tools to execute.

═══ STRATEGIC DIRECTIVE ═══
{directive}

═══ MEETING CONTEXT ═══
{transcript}

═══ EXTRACTED DATA FROM SPECIALIST AGENTS ═══
Tasks ({tasks_count}): {tasks}
Events ({events_count}): {events}
Bugs ({bugs_count}): {bugs}
Follow-ups ({followups_count}): {followups}

═══ EXECUTION HISTORY (What has already been done) ═══
{history}

═══ AVAILABLE TOOLS ═══
1. create_jira_ticket(title: str, description: str) — Creates a Jira ticket for tracking
2. create_notion_task(title: str, description: str, priority: str = "Medium", deadline: str = "TBD") — Creates a task in Notion
3. send_slack_message(channel: str, message: str) — Sends a Slack notification
4. schedule_calendar_event(title: str, time: str, attendees: list) — Schedules a calendar event

═══ REASONING PROTOCOL (ReAct) ═══
1. **Thought**: What is the next logical action based on the directive, extracted data, and history?
2. **Action**: Select ONE tool to call with concrete arguments derived from the extracted data.
3. **Risk**: Assess criticality (1-10).
   - 1-3: Trivial (Read-only, internal logging)
   - 4-6: Medium (Internal notifications, scheduling)
   - 7-10: High (Permanent external records like Jira/Notion) -> REQUIRES HUMAN GATE.

═══ IMPORTANT RULES ═══
- Use REAL data from the extracted tasks/events/bugs — do NOT invent new items.
- Execute ONE action at a time so the monitor can verify each step.
- **NEVER re-propose an action that is currently "gated" or "awaiting human approval"** in the history. If an action is gated, it means it was successfully submitted for review. Move on to the NEXT task in your directive.
- If ALL tasks in your directive are either "success" or "gated", you have fulfilled your current plan. Set is_goal_achieved to true and summarize.
- When all items from the directive have been processed, set is_goal_achieved to true.

═══ OUTPUT FORMAT ═══
Return ONLY valid JSON:
{{
    "thought": "Explanation of what you're doing next and why",
    "proposed_actions": [
        {{
            "tool": "tool_name",
            "args": {{}},
            "criticality": 5
        }}
    ],
    "is_goal_achieved": false,
    "final_summary": "Only if goal is achieved, summarize all completed work"
}}
"""

def brain_node(state: AgentState) -> dict:
    """
    🧠 THE SIDD BRAIN — Multi-Agent ReAct Core
    Uses extracted data from specialist agents + strategic directive to
    autonomously select and execute tools one at a time.
    """
    print("\n" + "🧠" * 30)
    print("🧠 SIDD BRAIN: Reasoning about next action...")
    print("🧠" * 30)

    transcript = state.get("meeting_transcript", "")
    directive = state.get("orchestrator_reasoning", "Fulfill all action items from the meeting.")
    tasks = state.get("assigned_tasks", [])
    events = state.get("scheduled_events", [])
    bugs = state.get("bug_tickets", [])
    followups = state.get("followup_items", [])

    # Format History
    history_entries = []
    for res in state.get("execution_results", []):
        status = res.get("status", res.get("result", ""))
        history_entries.append(f"Step {res.get('step', '?')} [{res.get('tool', '?')}]: {status}")

    formatted_history = "\n".join(history_entries) if history_entries else "No actions taken yet."

    prompt = BRAIN_PROMPT.format(
        directive=directive,
        transcript=transcript[:2000],
        tasks=json.dumps(tasks, indent=2) if tasks else "None",
        tasks_count=len(tasks),
        events=json.dumps(events, indent=2) if events else "None",
        events_count=len(events),
        bugs=json.dumps(bugs, indent=2) if bugs else "None",
        bugs_count=len(bugs),
        followups=json.dumps(followups, indent=2) if followups else "None",
        followups_count=len(followups),
        history=formatted_history
    )

    result = call_gemini_safe(prompt, fallback={
        "thought": "I need to analyze the extracted data and execute the next action.",
        "proposed_actions": [],
        "is_goal_achieved": False
    })

    thought = str(result.get("thought", "Proceeding with next steps."))
    proposed = result.get("proposed_actions", [])
    achieved = result.get("is_goal_achieved", False)

    print(f"   💭 Thought: {thought[:150]}...")
    if achieved:
        print(f"   🎯 Goal achieved!")
    else:
        print(f"   🔧 Proposed {len(proposed)} actions.")

    # Update state
    execution_queue = list(state.get("execution_queue", []))
    for action in proposed:
        execution_queue.append({
            "tool": action.get("tool"),
            "args": action.get("args"),
            "criticality": action.get("criticality", 5),
            "thought": thought,
            "source_agent": "SIDD_Brain"
        })

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] BRAIN: {thought}")

    return {
        "execution_queue": execution_queue,
        "orchestrator_reasoning": thought if not achieved else state.get("orchestrator_reasoning"),
        "meeting_summary": result.get("final_summary") if achieved else state.get("meeting_summary"),
        "audit_log": audit_log,
        "is_goal_achieved": achieved
    }
