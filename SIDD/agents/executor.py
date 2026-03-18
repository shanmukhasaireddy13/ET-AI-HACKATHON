from state import AgentState
from tools.external_apis import create_jira_ticket, send_slack_message, schedule_calendar_event
from datetime import datetime

# ─── Tool Registry ───
TOOL_REGISTRY = {
    "create_jira_ticket": create_jira_ticket,
    "send_slack_message": send_slack_message,
    "schedule_calendar_event": schedule_calendar_event,
}

def execution_node(state: AgentState) -> dict:
    """
    ⚡ EXECUTOR AGENT
    Processes every action in execution_queue, one at a time.
    After each call, Monitor checks the result.
    """
    print("\n⚡ EXECUTOR: Running action...")
    
    queue = state.get("execution_queue", [])
    step_index = state.get("current_step_index", 0)
    execution_results = list(state.get("execution_results", []))
    errors = list(state.get("errors", []))
    audit_log = list(state.get("audit_log", []))
    
    if step_index >= len(queue):
        print("   ℹ️  No more actions in queue.")
        return {}
    
    step = queue[step_index]
    tool_name = step.get("tool")
    args = step.get("args", {})
    source = step.get("source_agent", "unknown")
    
    print(f"   🔧 [{step_index + 1}/{len(queue)}] Tool: {tool_name} (from: {source})")
    
    result = {"status": "failed", "error": f"Unknown tool: {tool_name}"}
    try:
        tool_fn = TOOL_REGISTRY.get(tool_name)
        if tool_fn:
            result = tool_fn(**args)
        else:
            raise ValueError(f"Tool '{tool_name}' not in registry")
    except Exception as e:
        result = {"status": "failed", "error": str(e)}
        errors.append(f"Step {step_index + 1} ({tool_name}): {str(e)}")
    
    execution_results.append({"step": step_index, "tool": tool_name, "source": source, "result": result})
    
    icon = "✅" if result.get("status") == "success" else "❌"
    print(f"   {icon} {result.get('status')}")
    
    audit_log.append(f"[{datetime.now().isoformat()}] EXECUTOR: {tool_name} → {result.get('status')}")
    
    return {
        "execution_results": execution_results,
        "errors": errors,
        "audit_log": audit_log,
    }
