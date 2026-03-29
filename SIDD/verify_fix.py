import os
import sys
import json

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from graph import build_graph
from main import create_empty_state

def run_loop_verification():
    print("=" * 70)
    print("🚀 SIDD LOOP VERIFICATION")
    print("=" * 70)

    # 1. Build the graph
    graph = build_graph()

    # 2. Test Transcript: The user's failing scenario
    transcript = "delete the PROJ-38 and create a ticket for the frotent team leader kanna to update the ui componetnes and also the meeting should be schecduled on tommorow to meet the clinet"
    print(f"\n📝 Test Transcript:\n\"{transcript}\"")

    # 3. Initialize state
    state = create_empty_state(transcript)
    state["meeting_id"] = "loop-test-001"

    # 4. Process Workflow (Simulating multiple iterations)
    # We want to see if the second iteration (after success/gating) stops proposing.
    
    print("\n⚡ Processing Iteration 1...")
    accumulated_state = dict(state)
    for step_output in graph.stream(state):
        for node_name, updates in step_output.items():
            if isinstance(updates, dict):
                accumulated_state.update(updates)
                if node_name == "brain":
                    print(f"   🔹 Brain Thought: {updates.get('audit_log', [''])[0]}")
                if node_name == "executor":
                    last_res = updates.get("execution_results", [{}])[-1]
                    print(f"   🛡️ Executor: {last_res.get('tool')} -> {last_res.get('result', {}).get('status')}")

    # Iteration 2: Loop back to brain (as Monitor would)
    print("\n⚡ Processing Iteration 2 (Simulating loop back to Brain)...")
    # In a real run, Monitor would have advanced the index.
    # We just run the graph again with the accumulated state.
    
    # We'll see if the Brain proposes anything new or sets is_goal_achieved
    final_output = graph.invoke(accumulated_state)
    
    print("\n" + "=" * 70)
    print("📊 VERIFICATION RESULTS")
    print("=" * 70)
    
    results = final_output.get("execution_results", [])
    queue = final_output.get("execution_queue", [])
    achieved = final_output.get("is_goal_achieved", False)
    
    print(f"\n✅ Total Actions in Queue: {len(queue)}")
    print(f"✅ Total Results recorded: {len(results)}")
    print(f"✅ Goal Achieved Flag: {achieved}")

    # Check for duplicates
    tool_arg_pairs = []
    duplicates = []
    for q in queue:
        pair = (q['tool'], json.dumps(q['args']))
        if pair in tool_arg_pairs:
            duplicates.append(pair)
        tool_arg_pairs.append(pair)
    
    if duplicates:
        print(f"❌ FAILURE: Detected {len(duplicates)} duplicate actions in queue!")
        for d in duplicates:
            print(f"   - {d[0]} {d[1]}")
    else:
        print("✅ SUCCESS: No duplicate actions detected.")

    print("\n" + "=" * 70)

if __name__ == "__main__":
    run_loop_verification()
