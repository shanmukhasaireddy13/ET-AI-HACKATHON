import json
from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

PLANNER_PROMPT = """You are the Meeting Mind Strategic Planner. You have received structured data extracted by specialized AI agents from a meeting transcript. Your job is to create a comprehensive execution plan.

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
1. **Differentiates Tool Usage**:
   - **JIRA**: Use for all technical bugs, pipeline issues, software development tasks, and feature requests.
   - **NOTION**: Use for general project management, administrative follow-ups, documentation, meeting coordination, and non-technical tasks.
   - **GOOGLE CALENDAR**: Use for scheduling meetings or time-boxed review sessions.
   - **SLACK**: Use for notifications after key actions are taken.
2. **Prevents Duplication**: NEVER create both a Jira ticket and a Notion task for the same item. If an item is technical, Jira is the source of truth.
3. **Prioritizes**: Critical bugs first, then high-priority features.

═══ AVAILABLE TOOL CAPABILITIES ═══
- create_jira_ticket: Create new Jira tickets. Use for technical/dev work.
- update_jira_ticket: Update existing Jira tickets.
- delete_jira_issue: Delete an existing Jira issue. Use when explicitly asked to "delete" or "remove".
- transition_jira_issue: Transition an issue status.
- get_jira_transitions: Discover available status for an issue before transitioning.
- add_jira_comment: Add a comment to a Jira issue.
- get_jira_comments: Retrieve recent comments for context.
- assign_jira_issue: Standalone tool to assign an issue to a user.
- fetch_project_issues: List all recent issues in a project to check for duplicates.
- search_jira_issues: Search existing Jira issues using JQL queries.
- schedule_calendar_event: Schedule Google Calendar events.
- create_notion_task: Create tasks in Notion. Use for administrative work.
- send_slack_message: Send Slack notifications.

Return ONLY valid JSON:
{{
    "directive": "A comprehensive strategic plan describing what the autonomous agent should execute, in what order, and why. Be explicit about which items go to Jira and which go to Notion.",
    "reasoning": "Explain the tool selection logic (e.g. 'Categorized login crash as a Jira bug and meeting notes as a Notion task to avoid redundancy').",
    "priority_order": ["item1", "item2"],
    "total_actions_expected": 5
}}
"""

def orchestrator_node(state: AgentState) -> dict:
    """
    🏁 STRATEGIC PLANNER
    Reads all extracted data from Understanding phase and creates a unified execution plan.
    """
    # ── RESUMPTION CHECK ──
    if state.get("orchestrator_reasoning"):
        print("\n🏁 PLANNER: Resumed State detected. Directive already exists. Skipping.")
        return {}

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
