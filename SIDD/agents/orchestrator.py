import json
from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

PLANNER_PROMPT = """You are the SIDD Strategic Planner. You have received structured data extracted by specialized AI agents from a meeting transcript. Your job is to create a comprehensive execution plan.

═══ MEETING SUMMARY ═══
{summary}

═══ EXTRACTED TASKS ({tasks_count}) ═══
{tasks}

═══ EXTRACTED EVENTS ({events_count}) ═══
{events}

═══ EXTRACTED BUGS ({bugs_count}) ═══
{bugs}

═══ EXTRACTED FOLLOW-UPS ({followups_count}) ═══
{followups}

═══ DECISIONS MADE ({decisions_count}) ═══
{decisions}

═══ YOUR MISSION ═══
Create a strategic execution directive that:
1. Prioritizes critical bugs and high-priority tasks first
2. Schedules events and sets up follow-ups
3. Ensures all stakeholders are notified via Slack
4. Creates Jira tickets for tasks and bugs that need tracking

Return ONLY valid JSON:
{{
    "directive": "A comprehensive strategic plan describing what the autonomous agent should execute, in what order, and why.",
    "reasoning": "Why this plan is optimal.",
    "priority_order": ["item1", "item2"],
    "total_actions_expected": 5
}}
"""

def orchestrator_node(state: AgentState) -> dict:
    """
    🏁 STRATEGIC PLANNER
    Reads all extracted data from Understanding phase and creates a unified execution plan.
    """
    print("\n" + "🏁" * 30)
    print("🏁 STRATEGIC PLANNER: Creating execution directive from extracted data...")
    print("🏁" * 30)

    tasks = state.get("assigned_tasks", [])
    events = state.get("scheduled_events", [])
    bugs = state.get("bug_tickets", [])
    followups = state.get("followup_items", [])
    summary = state.get("meeting_summary", "")
    decisions = state.get("decisions", [])

    prompt = PLANNER_PROMPT.format(
        summary=summary or "No summary available.",
        tasks=json.dumps(tasks, indent=2) if tasks else "No tasks extracted.",
        tasks_count=len(tasks),
        events=json.dumps(events, indent=2) if events else "No events extracted.",
        events_count=len(events),
        bugs=json.dumps(bugs, indent=2) if bugs else "No bugs extracted.",
        bugs_count=len(bugs),
        followups=json.dumps(followups, indent=2) if followups else "No follow-ups extracted.",
        followups_count=len(followups),
        decisions=json.dumps(decisions, indent=2) if decisions else "No decisions extracted.",
        decisions_count=len(decisions),
    )

    result = call_gemini_safe(prompt, fallback={
        "directive": "Execute all extracted tasks, events, and bug tracking actions.",
        "reasoning": "Default fallback plan.",
        "priority_order": [],
        "total_actions_expected": len(tasks) + len(events) + len(bugs)
    })

    directive = str(result.get("directive", "Execute all action items."))
    reasoning = str(result.get("reasoning", ""))
    total_expected = result.get("total_actions_expected", 0)

    print(f"   🎯 Directive Set: {directive[:150]}...")
    print(f"   💭 Reasoning: {reasoning[:150]}...")
    print(f"   📊 Expected actions: {total_expected}")

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] PLANNER: Strategic directive set. Expected {total_expected} actions. Reason={reasoning[:200]}")

    agent_reasoning_list = list(state.get("agent_reasoning", []))
    agent_reasoning_list.append({
        "agent": "planner",
        "reasoning": reasoning,
        "outputs_produced": {"directive": directive, "total_expected": total_expected}
    })

    return {
        "orchestrator_reasoning": directive,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning_list,
    }
