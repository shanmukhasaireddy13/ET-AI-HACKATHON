from state import AgentState
from datetime import datetime

def dispatcher_node(state: AgentState) -> dict:
    """
    🔀 DISPATCHER (Loop Controller)
    Reads the dynamic_steps and decides where to route next.
    """
    print("\n🔀 DISPATCHER: Checking dynamic steps queue...")
    
    steps = state.get("dynamic_steps", [])
    waiting = state.get("waiting_agents", {})
    completed = state.get("completed_steps", [])
    
    if steps:
        next_step = steps[0]
        role = next_step.get("role", "Unknown")
        print(f"   ➡️  Next dynamic step role: {role} ({len(steps)} remaining)")
        if waiting:
            print(f"   ⏳ Waiting: {list(waiting.keys())}")
        print(f"   ✅ Completed so far: {len(completed)} steps")
    elif waiting:
        print(f"   ⚠️  Deadlock or waiting state reached!")
        print(f"   ⏳ Waiting on: {waiting}")
        print(f"   ✅ Completed so far: {len(completed)}")
    else:
        queue_size = len(state.get("execution_queue", []))
        print(f"   📋 All dynamic steps completed: {len(completed)} total")
        print(f"   📦 Execution queue has {queue_size} actions")
    
    return {}


def get_next_route(state: AgentState) -> str:
    """
    Routing function used by graph.py's conditional edges.
    """
    steps = state.get("dynamic_steps", [])
    
    # More dynamic steps to run?
    if steps:
        return "dynamic_agent"
    
    waiting = state.get("waiting_agents", {})
    if waiting:
        queue = state.get("execution_queue", [])
        if queue:
            return "executor"
        return "audit"
        
    # All agents done — check if there are tool calls to execute
    queue = state.get("execution_queue", [])
    if queue:
        return "executor"
    
    # Nothing to execute, go straight to audit
    return "audit"
