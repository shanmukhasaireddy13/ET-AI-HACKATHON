from state import AgentState
from tools.external_apis import create_jira_ticket, send_slack_message, schedule_calendar_event
from datetime import datetime
import uuid

# ─── Tool Registry ───
TOOL_REGISTRY = {
    "create_jira_ticket": create_jira_ticket,
    "send_slack_message": send_slack_message,
    "schedule_calendar_event": schedule_calendar_event,
}

# ─── Tools that REQUIRE human approval before execution ───
# This is the AGENTIC distinction: the system knows when to pause
# and ask a human, rather than blindly executing everything.
HIGH_RISK_TOOLS = {
    "create_jira_ticket",       # Creates permanent external records
    "send_slack_message",       # Sends messages to real humans
}

def execution_node(state: AgentState) -> dict:
    """
    ⚡ EXECUTOR AGENT (with Human-in-the-Loop)
    
    AGENTIC BEHAVIOR:
    - Low-risk actions (calendar): execute immediately
    - High-risk actions (Jira, Slack): route to pending_approvals for human review
    - This shows the system KNOWS its own limitations and defers appropriately
    """
    print("\n⚡ EXECUTOR: Running action...")
    
    queue = state.get("execution_queue", [])
    step_index = state.get("current_step_index", 0)
    execution_results = list(state.get("execution_results", []))
    errors = list(state.get("errors", []))
    audit_log = list(state.get("audit_log", []))
    pending_approvals = list(state.get("pending_approvals", []))
    
    if step_index >= len(queue):
        print("   ℹ️  No more actions in queue.")
        return {}
    
    step = queue[step_index]
    tool_name = step.get("tool")
    args = step.get("args", {})
    source = step.get("source_agent", "unknown")
    
    print(f"   🔧 [{step_index + 1}/{len(queue)}] Tool: {tool_name} (from: {source})")
    
    # ═══ HUMAN-IN-THE-LOOP GATE ═══
    if tool_name in HIGH_RISK_TOOLS:
        approval_id = f"approval-{uuid.uuid4().hex[:8]}"
        approval_entry = {
            "id": approval_id,
            "meeting_id": state.get("meeting_id", ""),
            "tool": tool_name,
            "args": args,
            "source_agent": source,
            "status": "pending",
            "reason": f"Agent '{source}' wants to execute '{tool_name}' — requires human approval",
            "created_at": datetime.now().isoformat(),
        }
        pending_approvals.append(approval_entry)
        
        # Log a "gated" result so monitor advances correctly
        execution_results.append({
            "step": step_index, 
            "tool": tool_name, 
            "source": source, 
            "result": {"status": "pending_approval", "approval_id": approval_id}
        })
        
        audit_log.append(
            f"[{datetime.now().isoformat()}] EXECUTOR [GATED]: "
            f"'{tool_name}' from {source} → HELD for human approval (id: {approval_id})"
        )
        
        print(f"   🛑 HELD for human approval (id: {approval_id})")
        print(f"      Reason: High-risk action requires human verification")
        
        return {
            "execution_results": execution_results,
            "pending_approvals": pending_approvals,
            "audit_log": audit_log,
        }
    
    # ═══ AUTO-EXECUTE low-risk tools ═══
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
