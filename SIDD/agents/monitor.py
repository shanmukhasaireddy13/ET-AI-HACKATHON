from state import AgentState
from datetime import datetime

def monitor_node(state: AgentState) -> dict:
    """
    👁️ MONITOR AGENT
    Checks the last execution result and advances the step index.
    Routing decision is made by graph.py conditional edge.
    """
    print("\n👁️ MONITOR: Checking last result...")
    
    execution_results = state.get("execution_results", [])
    queue = state.get("execution_queue", [])
    step_index = state.get("current_step_index", 0)
    audit_log = list(state.get("audit_log", []))
    
    # Check last result
    if execution_results:
        last = execution_results[-1]
        status = last.get("result", {}).get("status", "unknown")
        print(f"   Last step: {status}")
    
    # Advance index
    next_index = step_index + 1
    remaining = len(queue) - next_index
    print(f"   📊 Progress: {next_index}/{len(queue)} | Remaining: {remaining}")
    
    audit_log.append(f"[{datetime.now().isoformat()}] MONITOR: Step {step_index + 1} checked. Remaining: {remaining}")
    
    return {
        "current_step_index": next_index,
        "audit_log": audit_log,
    }


def get_monitor_route(state: AgentState) -> str:
    """Routing function: called after monitor to decide next step."""
    execution_results = state.get("execution_results", [])
    queue = state.get("execution_queue", [])
    current_index = state.get("current_step_index", 0)
    
    # Check for failure (but not pending_approval — that's intentional gating)
    if execution_results:
        last = execution_results[-1].get("result", {})
        status = last.get("status", "")
        if status == "failed":
            return "recovery"
        # pending_approval is not a failure — it's an intentional human gate
    
    # More steps?
    if current_index < len(queue):
        return "executor"
    
    return "audit"
