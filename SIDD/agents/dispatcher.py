from state import AgentState
from datetime import datetime

def dispatcher_node(state: AgentState) -> dict:
    """
    🔀 DISPATCHER (Loop Controller)
    Reads the dynamic_plan and decides which agent to route to next.
    This node is called repeatedly — after each agent finishes, control
    returns here to dispatch the next one.
    
    Flow:
      Orchestrator → Dispatcher → Agent A → Dispatcher → Agent B → ... → Dispatcher → Executor
    
    Routing logic (used by graph.py's conditional edge):
      - If more agents in plan → route to next agent
      - If plan exhausted AND execution_queue has items → route to executor
      - If plan exhausted AND no execution items → route to audit
    """
    print("\n🔀 DISPATCHER: Checking dynamic plan...")
    
    plan = state.get("dynamic_plan", [])
    index = state.get("current_agent_index", 0)
    completed = state.get("completed_agents", [])
    
    if index < len(plan):
        next_agent = plan[index]
        print(f"   ➡️  Next agent: {next_agent} (step {index + 1}/{len(plan)})")
        print(f"   ✅ Completed so far: {completed}")
    else:
        queue_size = len(state.get("execution_queue", []))
        print(f"   📋 All {len(plan)} agents completed: {completed}")
        print(f"   📦 Execution queue has {queue_size} actions")
    
    # Dispatcher doesn't modify state — routing is handled by
    # the conditional edge function in graph.py
    return {}


def get_next_route(state: AgentState) -> str:
    """
    Routing function used by graph.py's conditional edges.
    Called after dispatcher to determine the next node.
    """
    plan = state.get("dynamic_plan", [])
    index = state.get("current_agent_index", 0)
    
    # More agents to run?
    if index < len(plan):
        return plan[index]
    
    # All agents done — check if there are tool calls to execute
    queue = state.get("execution_queue", [])
    if queue:
        return "executor"
    
    # Nothing to execute, go straight to audit
    return "audit"
