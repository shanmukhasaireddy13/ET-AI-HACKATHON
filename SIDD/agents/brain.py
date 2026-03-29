import json
from datetime import datetime
from state import AgentState
from utils.llm import call_gemini_safe

BRAIN_PROMPT = """You are the Meeting Mind BRAIN, the autonomous reasoning core of a multi-agent AI system.
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
1. create_jira_ticket(title: str, description: str, priority: str = "Medium", assignee_name: str = None) — Creates a Jira ticket
2. update_jira_ticket(issue_key: str, summary: str = None, description: str = None, priority: str = None, assignee_name: str = None) — Updates an existing Jira ticket
3. delete_jira_issue(issue_key: str) — DELETES an existing Jira issue. Use this when the user asks to "delete" or "remove" a specific ticket.
4. transition_jira_issue(issue_key: str, status: str) — Transitions an issue to a new status (e.g., "Done").
5. get_jira_transitions(issue_key: str) — Returns a list of available status names for an issue. Use this before transition_jira_issue to ensure the status is valid.
6. add_jira_comment(issue_key: str, body: str) — Adds a comment to an existing Jira ticket.
7. get_jira_comments(issue_key: str) — Retrieves recent comments for an issue.
8. assign_jira_issue(issue_key: str, assignee_name: str) — Assigns an existing Jira issue to a user by name.
9. fetch_project_issues(project_key: str) — Lists up to 100 recent issues in a project. Use this to check for duplicates before creating new ones.
10. search_jira_issues(jql: str) — Searches Jira and returns issues matching the JQL query.
11. create_notion_task(title: str, description: str, priority: str = "Medium", deadline: str = "TBD") — Creates a task in Notion. 
   - IMPORTANT: 'deadline' MUST be a valid ISO 8601 date string (YYYY-MM-DD) or "TBD".
   - CRITICAL: There is NO 'owner' or 'assignee' field in Notion. Put assignee info in the 'description' instead.
12. send_slack_message(channel: str, message: str) — Sends a Slack notification.
13. schedule_calendar_event(title: str, time: str, attendees: list = None) — Schedules a Google Calendar event. Time can be natural language. Attendees must be a list of valid emails.

═══ REASONING PROTOCOL (ReAct) ═══
1. **Thought**: What is the next logical action based on the directive, extracted data, and history?
2. **Action**: Select ONE tool to call with concrete arguments derived from the extracted data.
3. **Risk**: Assess criticality (1-10). Use LOW values for normal operations:
   - 1-3: Trivial (Read-only, searching, internal logging)
   - 4-6: Standard operations (Creating tickets, scheduling events, sending messages, creating tasks) — USE THIS FOR MOST ACTIONS.
   - 7-8: Sensitive (Bulk updates, deleting data such as delete_jira_issue, modifying production systems)
   - 9-10: Critical (Irreversible destructive actions only)

═══ IMPORTANT RULES ═══
- Use REAL data from the extracted tasks/events/bugs — do NOT invent new items.
- **NEVER create both a Jira ticket and a Notion task for the same item.** If an item is technical (bugs, dev tasks), use Jira. If it is administrative/coordination, use Notion.
- Execute ONE action at a time so the monitor can verify each step.
- **NEVER re-propose an action that has already been attempted** (whether it succeeded, failed, or was gated). Check the execution history carefully.
- If an action FAILED in the history with an error like "Issue does not exist", do NOT try to update it again. 
- If ALL items in your directive are either "success", "failed", or "gated", set is_goal_achieved to true and summarize.
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
    🧠 THE MEETING MIND BRAIN — Multi-Agent ReAct Core
    Uses extracted data from specialist agents + strategic directive to
    autonomously select and execute tools one at a time.
    """
    print("\n" + "🧠" * 30)
    print("🧠 Meeting Mind BRAIN: Reasoning about next action...")
    print("🧠" * 30)

    transcript = state.get("meeting_transcript", "")
    directive = state.get("orchestrator_reasoning", "Fulfill all action items from the meeting.")
    tasks = state.get("assigned_tasks", [])
    events = state.get("scheduled_events", [])
    bugs = state.get("bug_tickets", [])
    followups = state.get("followup_items", [])

    # Format History
    history_entries = []
    for i, res in enumerate(state.get("execution_results", [])):
        status = res.get("status", "unknown")
        # Handle complex tool results (flatten for the LLM)
        tool_res = res.get("result", {})
        if isinstance(tool_res, dict) and "error" in tool_res:
            status = f"failed ({tool_res['error']})"
        elif isinstance(tool_res, dict) and "ticket_id" in tool_res:
            status = f"success (Created: {tool_res['ticket_id']})"
        elif status == "gated":
            status = "gated (Awaiting human approval)"
        
        tool_name = res.get("tool", "?")
        # Extract meaningful IDs or summaries from args to help the Brain recognize the task
        tool_args = res.get("args", {})
        arg_summary = f": {json.dumps(tool_args)}" if tool_args else ""
        
        history_entries.append(f"Step {i+1} [{tool_name}]{arg_summary} -> {status}")

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

    # ── HARD DEDUPLICATION (The Loop Breaker) ──
    # Check proposed actions against results in state to prevent infinite loops
    final_proposals = []
    history = state.get("execution_results", [])
    
    for action in proposed:
        is_duplicate = False
        a_tool = action.get("tool")
        a_args = action.get("args", {})
        
        for h in history:
            h_tool = h.get("tool")
            h_args = h.get("args", {})
            h_status = h.get("status")
            
            # Simple deep comparison of tool + args
            if a_tool == h_tool and a_args == h_args:
                if h_status in ("success", "gated", "pending_approval"):
                    print(f"   🚫 Prohibited Duplicate: {a_tool} is already {h_status}. Scrubbing.")
                    is_duplicate = True
                    break
        
        if not is_duplicate:
            final_proposals.append(action)

    # If the Brain hallucinated a duplicate that we scrubbed, and now we have nothing, 
    # but the Brain THINKS there are still steps, we should warn or stop.
    if proposed and not final_proposals and not achieved:
        print("   ⚠️  All proposals were duplicates. Forcing goal achievement to break the loop.")
        achieved = True

    # Update state
    execution_queue = list(state.get("execution_queue", []))
    for action in final_proposals:
        execution_queue.append({
            "tool": action.get("tool"),
            "args": action.get("args"),
            "criticality": action.get("criticality", 5),
            "thought": thought,
            "source_agent": "MeetingMind_Brain"
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
