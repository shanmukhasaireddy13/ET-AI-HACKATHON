from state import AgentState
from datetime import datetime

def aggregator_node(state: AgentState) -> dict:
    """
    🔗 UNDERSTANDING AGGREGATOR
    Synchronization node that runs after all parallel extraction agents.
    Logs a summary of everything extracted and prepares the state for the Planner.
    """
    print("\n" + "🔗" * 30)
    print("🔗 AGGREGATOR: Synchronizing extraction results...")
    print("🔗" * 30)

    tasks = state.get("assigned_tasks", [])
    events = state.get("scheduled_events", [])
    bugs = state.get("bug_tickets", [])
    followups = state.get("followup_items", [])
    summary = state.get("meeting_summary", "")
    decisions = state.get("decisions", [])

    print(f"   📋 Tasks:     {len(tasks)}")
    print(f"   📅 Events:    {len(events)}")
    print(f"   🐛 Bugs:      {len(bugs)}")
    print(f"   🔄 Follow-ups: {len(followups)}")
    print(f"   📝 Summary:   {len(summary)} chars")
    print(f"   ⚖️  Decisions: {len(decisions)}")

    audit_log = list(state.get("audit_log", []))
    audit_log.append(
        f"[{datetime.now().isoformat()}] AGGREGATOR: Synced — "
        f"{len(tasks)} tasks, {len(events)} events, {len(bugs)} bugs, "
        f"{len(followups)} follow-ups, {len(decisions)} decisions"
    )

    print("   ✅ All extraction agents synchronized. Handing off to Planner.")

    return {
        "audit_log": audit_log,
    }
