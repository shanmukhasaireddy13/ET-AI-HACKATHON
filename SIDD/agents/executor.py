import json
from datetime import datetime
from state import AgentState
from tools.external_apis import create_jira_ticket, send_slack_message, schedule_calendar_event, create_notion_task
from tools.database import save_execution_step, update_execution_step, record_activity

# Mapping tool names to actual Python functions
TOOL_MAP = {
    "create_jira_ticket": create_jira_ticket,
    "send_slack_message": send_slack_message,
    "schedule_calendar_event": schedule_calendar_event,
    "create_notion_task": create_notion_task
}

# Threshold for human intervention (defined by the Brain/Planner risk assessment)
APPROVAL_THRESHOLD = 7 

def execution_node(state: AgentState) -> dict:
    """
    🛡️ THE GATEKEEPER (Executor)
    Handles tool execution with dynamic risk-based gating.
    Logs every step to the technical trace table.
    """
    queue = state.get("execution_queue", [])
    idx = state.get("current_step_index", 0)
    meeting_id = state.get("meeting_id")
    
    if idx >= len(queue):
        print("   ℹ️ Executor: No pending tasks in queue.")
        return {}

    step = queue[idx]
    tool_name = step.get("tool")
    args = step.get("args", {})
    criticality = step.get("criticality", 5)
    thought = step.get("thought", "")
    
    print(f"\n🛡️ EXECUTOR: Processing Step {idx+1} [{tool_name}] (Risk: {criticality})")
    
    # 1. Initialize Trace Entry in DB
    trace_entry = save_execution_step(meeting_id, {
        "step_index": idx + 1,
        "agent_role": "SIDD_Brain",
        "thought": thought,
        "tool_name": tool_name,
        "tool_args": args,
        "criticality": criticality,
        "status": "executing"
    })
    trace_id = trace_entry.get("id") if trace_entry else None

    # 2. Dynamic Gating Logic
    if criticality >= APPROVAL_THRESHOLD:
        print(f"   ⚠️ ACTION GATED: Risk Level {criticality} requires human approval.")
        
        # Log Gated Status
        if trace_id:
            update_execution_step(trace_id, {"status": "gated"})
            
        pending_approvals = list(state.get("pending_approvals", []))
        pending_approvals.append({
            "tool": tool_name,
            "args": args,
            "criticality": criticality,
            "reason": f"Automated Risk Assessment: Level {criticality}/10 tool call.",
            "source_agent": "SIDD_Brain",
            "trace_id": trace_id
        })
        
        execution_results = list(state.get("execution_results", []))
        execution_results.append({
            "step": idx,
            "tool": tool_name,
            "result": {"status": "gated", "message": "Awaiting human approval — this action is pending review. Move to the next task."}
        })
        
        return {
            "pending_approvals": pending_approvals,
            "execution_results": execution_results
        }

    # 3. Autonomous Execution
    print(f"   ⚡ Executing {tool_name} autonomously...")
    tool_fn = TOOL_MAP.get(tool_name)
    
    if not tool_fn:
        error = f"Unknown tool: {tool_name}"
        if trace_id: update_execution_step(trace_id, {"status": "failed", "error": error})
        return {"execution_results": state.get("execution_results", []) + [{"step": idx, "tool": tool_name, "result": {"status": "failed", "error": error}}]}

    try:
        result = tool_fn(**args)
        print(f"   ✅ Execution Success: {result}")
        if trace_id: update_execution_step(trace_id, {"status": "success", "result": result})
        
        execution_results = list(state.get("execution_results", []))
        execution_results.append({
            "step": idx,
            "tool": tool_name,
            "result": {"status": "success", "data": result}
        })
        
        return {"execution_results": execution_results}
        
    except Exception as e:
        error_msg = str(e)
        print(f"   ❌ Execution Failed: {error_msg}")
        if trace_id: update_execution_step(trace_id, {"status": "failed", "error": error_msg})
        
        execution_results = list(state.get("execution_results", []))
        execution_results.append({
            "step": idx,
            "tool": tool_name,
            "result": {"status": "failed", "error": error_msg}
        })
        
        return {"execution_results": execution_results}
