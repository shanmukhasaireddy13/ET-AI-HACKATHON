"""
🚀 Meeting to Workflow — True Multi-Agent ReAct System
======================================================
Architecture:
  Phase 1: Parallel extraction agents gather structured data
  Phase 2: Aggregator synchronizes all results
  Phase 3: Strategic Planner creates unified directive
  Phase 4: Brain executes tools via ReAct loop
  Phase 5: Monitor checks results, retries or escalates
  Phase 6: Audit generates final report
"""

from graph import build_graph
from tools.database import save_meeting_results


def create_empty_state(transcript: str) -> dict:
    """Creates a fresh initial state for the True Multi-Agent ReAct Workflow."""
    return {
        # Input
        "meeting_transcript": transcript,
        "meeting_id": "d2fa71be-a953-41f8-b1d2-8e6842d88a13",

        # Phase 1: Understanding (populated by extraction agents)
        "assigned_tasks": [],
        "scheduled_events": [],
        "bug_tickets": [],
        "followup_items": [],
        "meeting_summary": "",
        "decisions": [],
        "key_topics": [],

        # Phase 2: Planning
        "orchestrator_reasoning": "",

        # Phase 3: Execution (ReAct)
        "execution_queue": [],
        "current_step_index": 0,
        "execution_results": [],

        # Phase 4: Monitoring & Recovery
        "errors": [],
        "recovery_actions": [],

        # Human-in-the-loop
        "pending_approvals": [],

        # Audit & Tracing
        "agent_reasoning": [],
        "audit_log": [],
        "is_goal_achieved": False,

        # Legacy compatibility
        "dynamic_steps": [],
        "waiting_agents": {},
        "completed_steps": [],
    }


def load_state_from_db(meeting_id: str) -> dict:
    """
    🔄 STATE HYDRATION
    Loads the full AgentState from Supabase to resume a workflow.
    """
    from tools.database import PROJECT_URL, HEADERS
    import requests

    print(f"🔄 Hydrating state for meeting: {meeting_id}...")

    # 1. Fetch meeting record (transcript, summary)
    res = requests.get(f"{PROJECT_URL}/rest/v1/meetings?id=eq.{meeting_id}", headers=HEADERS)
    meeting = res.json()[0] if res.ok and res.json() else {}
    transcript = meeting.get("transcript", "")
    
    state = create_empty_state(transcript)
    state["meeting_id"] = meeting_id
    state["meeting_summary"] = meeting.get("summary", "")

    # 2. Fetch Extracted Data
    node_data_map = {
        "tasks": "assigned_tasks",
        "bug_tickets": "bug_tickets",
        "events": "scheduled_events",
        "followups": "followup_items",
        "decisions": "decisions",
        "key_topics": "key_topics"
    }
    
    for table, state_key in node_data_map.items():
        res = requests.get(f"{PROJECT_URL}/rest/v1/{table}?meeting_id=eq.{meeting_id}", headers=HEADERS)
        if res.ok:
            data = res.json()
            if state_key == "key_topics":
                state[state_key] = [t.get("topic") for t in data]
            else:
                state[state_key] = data

    # 3. Fetch Execution History (CRITICAL for ReAct)
    res = requests.get(f"{PROJECT_URL}/rest/v1/agent_execution_steps?meeting_id=eq.{meeting_id}&order=step_index.asc", headers=HEADERS)
    if res.ok:
        steps = res.json()
        state["execution_results"] = [
            {
                "tool": s.get("tool_name"), 
                "args": s.get("tool_args", {}), # CRITICAL: must have args to recognize task
                "result": s.get("result", {}), 
                "status": s.get("status")
            }
            for s in steps
        ]

    # 4. Fetch Reasoning Trail
    res = requests.get(f"{PROJECT_URL}/rest/v1/agent_reasoning?meeting_id=eq.{meeting_id}", headers=HEADERS)
    if res.ok:
        reasoning = res.json()
        state["agent_reasoning"] = [
            {"agent": r.get("agent_name"), "reasoning": r.get("reasoning"), "outputs_produced": r.get("context_data")}
            for r in reasoning
        ]
        
        # Hydrate the specific planner directive (orchestrator_reasoning)
        planner_entry = next((r for r in reasoning if r.get("agent_name") == "planner"), None)
        if planner_entry:
            state["orchestrator_reasoning"] = planner_entry.get("reasoning", "")

    print(f"   ✅ State hydrated: {len(state['execution_results'])} previous tools found.")
    return state


def run_scenario(graph, name: str, transcript: str):
    """Runs a single scenario through the full multi-agent pipeline."""
    print(f"\n{'#' * 70}")
    print(f"# SCENARIO: {name.upper()}")
    print(f"# Input: \"{transcript[:80]}...\"")
    print(f"{'#' * 70}")

    state = create_empty_state(transcript)

    # Stream through graph, accumulating state updates
    accumulated_state = dict(state)
    for step_output in graph.stream(state):
        for node_name, updates in step_output.items():
            if isinstance(updates, dict):
                accumulated_state.update(updates)

    # 💾 Persist to Supabase
    try:
        meeting_id = save_meeting_results(accumulated_state)
    except Exception as e:
        print(f"   ⚠️  DB save failed: {e}")

    print(f"\n{'#' * 70}")
    print(f"# ✅ SCENARIO '{name.upper()}' COMPLETE")
    print(f"{'#' * 70}\n")


def main():
    print("=" * 70)
    print("🚀 TRUE MULTI-AGENT ReAct WORKFLOW ENGINE (Meeting Mind)")
    print("   Understand → Plan → Execute → Monitor → Audit")
    print("=" * 70)

    graph = build_graph()

    print("\nType your meeting transcript or request below.")
    print("Type 'exit' or 'quit' to stop.\n")

    scenario_count = 1
    while True:
        try:
            user_input = input(f"[{scenario_count}] Enter transcript: ")
            if user_input.lower().strip() in ['exit', 'quit']:
                break
            if not user_input.strip():
                continue

            run_scenario(graph, f"User_Scenario_{scenario_count}", user_input)
            scenario_count += 1
            print("\n" + "─" * 70 + "\n")
        except KeyboardInterrupt:
            break

    print("✅ Session completed!")


if __name__ == "__main__":
    main()
