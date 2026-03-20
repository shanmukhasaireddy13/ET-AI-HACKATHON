"""
🚀 Meeting to Workflow — Dynamic Multi-Agent System
=====================================================
Demonstrates truly dynamic workflow where:
- The Orchestrator decides which agents to use
- Agents can chain to other agents at runtime
- A single input can trigger multiple agents
"""

from graph import build_graph
from tools.database import save_meeting_results


def create_empty_state(transcript: str) -> dict:
    """Creates a fresh initial state."""
    return {
        "meeting_transcript": transcript,
        "meeting_id": "",
        "dynamic_steps": [],
        "waiting_agents": {},
        "completed_steps": [],
        "orchestrator_reasoning": "",
        "agent_reasoning": [],
        "meeting_summary": "",
        "assigned_tasks": [],
        "scheduled_events": [],
        "bug_tickets": [],
        "followup_items": [],
        "execution_queue": [],
        "current_step_index": 0,
        "execution_results": [],
        "pending_approvals": [],
        "errors": [],
        "recovery_actions": [],
        "audit_log": [],
    }


def run_scenario(graph, name: str, transcript: str):
    """Runs a single scenario and shows the dynamic flow."""
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
    
    # 💾 Persist to SQLite
    try:
        meeting_id = save_meeting_results(accumulated_state)
    except Exception as e:
        print(f"   ⚠️  DB save failed: {e}")
    
    print(f"\n{'#' * 70}")
    print(f"# ✅ SCENARIO '{name.upper()}' COMPLETE")
    print(f"{'#' * 70}\n")


def main():
    print("=" * 70)
    print("🚀 DYNAMIC MULTI-AGENT WORKFLOW ENGINE (Groq Integration)")
    print("   No hardcoded routes — agents decide the flow!")
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
