from state import AgentState
from datetime import datetime

MAX_CONSECUTIVE_FAILURES = 2

def monitor_node(state: AgentState) -> dict:
    """
    👁️ MONITOR AGENT (with Autonomous Recovery + Human Fallback)
    Checks the last execution result, advances the step index,
    and handles failures with retry or human escalation.
    """
    print("\n👁️ MONITOR: Checking last result...")

    execution_results = state.get("execution_results", [])
    queue = state.get("execution_queue", [])
    step_index = state.get("current_step_index", 0)
    errors = list(state.get("errors", []))
    recovery_actions = list(state.get("recovery_actions", []))
    audit_log = list(state.get("audit_log", []))
    pending_approvals = list(state.get("pending_approvals", []))

    last_status = "unknown"
    if execution_results:
        last = execution_results[-1]
        last_result = last.get("result", {})
        last_status = last_result.get("status", "unknown")
        last_tool = last.get("tool", "unknown")
        print(f"   Last step: {last_status} ({last_tool})")

        if last_status == "failed":
            error_msg = last_result.get("error", "Unknown error")
            errors.append(f"Step {step_index}: {last_tool} failed — {error_msg}")

            # Count consecutive failures
            consecutive_fails = 0
            for r in reversed(execution_results):
                if r.get("result", {}).get("status") == "failed":
                    consecutive_fails += 1
                else:
                    break

            if consecutive_fails >= MAX_CONSECUTIVE_FAILURES:
                # HUMAN FALLBACK: Escalate to approvals queue
                print(f"   🚨 {consecutive_fails} consecutive failures! Escalating to human review.")
                pending_approvals.append({
                    "tool": last_tool,
                    "args": last.get("args", {}),
                    "criticality": 10,
                    "reason": f"Automated Recovery Failed: {consecutive_fails} consecutive failures. Last error: {error_msg}",
                    "source_agent": "Monitor_Escalation"
                })
                recovery_actions.append({
                    "action": "human_escalation",
                    "tool": last_tool,
                    "error": error_msg,
                    "timestamp": datetime.now().isoformat()
                })
                audit_log.append(f"[{datetime.now().isoformat()}] MONITOR: Escalated {last_tool} to human review after {consecutive_fails} failures")
            else:
                # AUTONOMOUS RETRY: Re-queue the failed tool for another attempt
                print(f"   🔄 Autonomous retry: re-queuing {last_tool} (failure {consecutive_fails}/{MAX_CONSECUTIVE_FAILURES})")
                retry_step = queue[step_index - 1] if step_index > 0 and step_index <= len(queue) else None
                if retry_step:
                    queue.append({**retry_step, "retry": True})
                recovery_actions.append({
                    "action": "autonomous_retry",
                    "tool": last_tool,
                    "attempt": consecutive_fails,
                    "timestamp": datetime.now().isoformat()
                })
                audit_log.append(f"[{datetime.now().isoformat()}] MONITOR: Retrying {last_tool} (attempt {consecutive_fails + 1})")

    # Advance index
    next_index = step_index + 1
    remaining = len(queue) - next_index
    print(f"   📊 Progress: {next_index}/{len(queue)} | Remaining: {max(0, remaining)}")

    audit_log.append(f"[{datetime.now().isoformat()}] MONITOR: Step {step_index + 1} checked. Remaining: {max(0, remaining)}")

    return {
        "current_step_index": next_index,
        "execution_queue": queue,
        "errors": errors,
        "recovery_actions": recovery_actions,
        "pending_approvals": pending_approvals,
        "audit_log": audit_log,
    }
