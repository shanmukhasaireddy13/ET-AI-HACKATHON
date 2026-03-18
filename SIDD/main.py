"""
🚀 Meeting to Workflow — Dynamic Multi-Agent System
=====================================================
Demonstrates truly dynamic workflow where:
- The Orchestrator decides which agents to use
- Agents can chain to other agents at runtime
- A single input can trigger multiple agents
"""

from graph import build_graph


def create_empty_state(transcript: str) -> dict:
    """Creates a fresh initial state."""
    return {
        "meeting_transcript": transcript,
        "dynamic_plan": [],
        "current_agent_index": 0,
        "completed_agents": [],
        "orchestrator_reasoning": "",
        "meeting_summary": "",
        "assigned_tasks": [],
        "scheduled_events": [],
        "bug_tickets": [],
        "followup_items": [],
        "execution_queue": [],
        "current_step_index": 0,
        "execution_results": [],
        "errors": [],
        "recovery_actions": [],
        "audit_log": [],
    }


# ════════════════════════════════════════════════════════
#  TEST SCENARIOS
# ════════════════════════════════════════════════════════

TEST_SCENARIOS = {
    # ─── Single intent ───
    "pure_bug_report": (
        "We found a critical bug — the login page crashes on mobile devices. "
        "Create a Jira ticket immediately and flag it as high priority."
    ),

    # ─── Multi-intent (this is the key test!) ───
    "task_and_scheduling": (
        "Assign the frontend redesign task to the design team and split the work. "
        "Also schedule a follow-up meeting tomorrow at 10 AM to review progress."
    ),

    # ─── Complex multi-intent ───
    "full_meeting": (
        "Team, we need to assign the API refactoring to backend and divide it into subtasks. "
        "There's also a critical bug — the payment page is broken, create a ticket. "
        "Schedule a review meeting for next week with the whole team. "
        "And follow up with DevOps on the deployment status."
    ),

    # ─── Fallback / summary only ───
    "general_discussion": (
        "We had a great discussion about the company roadmap and future vision. "
        "Please summarize the key points from today's meeting."
    ),
}


def run_scenario(graph, name: str, transcript: str):
    """Runs a single scenario and shows the dynamic flow."""
    print(f"\n{'#' * 70}")
    print(f"# SCENARIO: {name.upper()}")
    print(f"# Input: \"{transcript[:80]}...\"")
    print(f"{'#' * 70}")
    
    state = create_empty_state(transcript)
    
    final_state = None
    for step_output in graph.stream(state):
        for node_name, updates in step_output.items():
            pass  # agents print their own output
        final_state = step_output
    
    print(f"\n{'#' * 70}")
    print(f"# ✅ SCENARIO '{name.upper()}' COMPLETE")
    print(f"{'#' * 70}\n")


def main():
    print("=" * 70)
    print("🚀 DYNAMIC MULTI-AGENT WORKFLOW ENGINE")
    print("   No hardcoded routes — agents decide the flow!")
    print("=" * 70)
    
    graph = build_graph()
    
    for name, transcript in TEST_SCENARIOS.items():
        run_scenario(graph, name, transcript)
        print("\n" + "─" * 70 + "\n")
    
    print("✅ All scenarios completed!")


if __name__ == "__main__":
    main()
