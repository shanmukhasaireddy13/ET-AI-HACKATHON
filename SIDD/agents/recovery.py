from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

RECOVERY_PROMPT = """You are the RECOVERY AGENT in an agentic AI system.
A tool execution just failed. Your job is to analyze the failure and decide the best recovery strategy.

═══ FAILURE CONTEXT ═══
Tool that failed: {tool_name}
Arguments used: {tool_args}
Error message: {error_message}
Source agent: {source_agent}

═══ AVAILABLE TOOLS YOU CAN RETRY WITH ═══
1. create_jira_ticket(title: str, description: str)
2. send_slack_message(channel: str, message: str)  
3. schedule_calendar_event(title: str, time: str, attendees: list)

═══ YOUR TASK ═══
Analyze the failure and decide ONE of these strategies:
1. **retry** — Try the same tool with corrected arguments
2. **alternative** — Use a different tool to achieve the same goal
3. **escalate** — The error is unrecoverable, escalate to a human via Slack

Return ONLY valid JSON:
{{
    "strategy": "retry" | "alternative" | "escalate",
    "reasoning": "Detailed explanation of WHY you chose this strategy and what went wrong",
    "retry_action": {{
        "tool": "<tool_name>",
        "args": {{...}},
        "source_agent": "RecoveryAgent"
    }},
    "escalation_message": "Message to send to humans if escalating (only if strategy=escalate)"
}}

If strategy is "retry" or "alternative", populate retry_action with the corrected tool call.
If strategy is "escalate", populate escalation_message and set retry_action to null.
"""

def recovery_node(state: AgentState) -> dict:
    """
    🛠️ RECOVERY AGENT (LLM-Driven)
    Analyzes failures using the LLM and decides:
    - Retry with modified args
    - Use an alternative tool
    - Escalate to human
    
    This is what makes it AGENTIC — not just logging errors,
    but reasoning about them and self-correcting.
    """
    print("\n🛠️ RECOVERY: Analyzing failures with LLM...")
    
    errors = list(state.get("errors", []))
    execution_results = list(state.get("execution_results", []))
    execution_queue = list(state.get("execution_queue", []))
    audit_log = list(state.get("audit_log", []))
    recovery_actions = list(state.get("recovery_actions", []))
    
    # Find the last failed execution result
    failed_result = None
    for r in reversed(execution_results):
        if r.get("result", {}).get("status") == "failed":
            failed_result = r
            break
    
    if not failed_result:
        print("   ℹ️  No failed results to recover from.")
        audit_log.append(f"[{datetime.now().isoformat()}] RECOVERY: No actionable failures found.")
        return {"audit_log": audit_log}
    
    tool_name = failed_result.get("tool", "unknown")
    source = failed_result.get("source", "unknown")
    error_msg = failed_result.get("result", {}).get("error", "Unknown error")
    
    # Find the original step args from execution_queue
    step_idx = failed_result.get("step", 0)
    original_args = {}
    if step_idx < len(execution_queue):
        original_args = execution_queue[step_idx].get("args", {})
    
    print(f"   🔍 Failed tool: {tool_name}")
    print(f"   📝 Error: {error_msg}")
    print(f"   🤖 Consulting LLM for recovery strategy...")
    
    # ═══ CALL LLM FOR INTELLIGENT RECOVERY ═══
    import json
    prompt = RECOVERY_PROMPT.format(
        tool_name=tool_name,
        tool_args=json.dumps(original_args),
        error_message=error_msg,
        source_agent=source
    )
    
    result = call_gemini_safe(prompt, fallback={
        "strategy": "escalate",
        "reasoning": "LLM unavailable — escalating to human as safety measure.",
        "retry_action": None,
        "escalation_message": f"Tool '{tool_name}' failed: {error_msg}. Needs manual intervention."
    })
    
    strategy = result.get("strategy", "escalate")
    reasoning = result.get("reasoning", "No reasoning provided")
    
    print(f"   💭 Strategy: {strategy.upper()}")
    print(f"   💭 Reasoning: {reasoning}")
    
    recovery_entry = {
        "original_error": error_msg,
        "failed_tool": tool_name,
        "strategy": strategy,
        "reasoning": reasoning,
        "timestamp": datetime.now().isoformat()
    }
    
    if strategy in ("retry", "alternative"):
        retry_action = result.get("retry_action")
        if retry_action and isinstance(retry_action, dict):
            # Inject the corrected action back into execution queue
            execution_queue.append(retry_action)
            recovery_entry["retry_tool"] = retry_action.get("tool")
            recovery_entry["retry_args"] = retry_action.get("args")
            print(f"   🔄 Queued retry: {retry_action.get('tool')} with corrected args")
        else:
            strategy = "escalate"
            print(f"   ⚠️  No valid retry action from LLM — falling back to escalation")
    
    if strategy == "escalate":
        escalation_msg = result.get("escalation_message", f"Tool '{tool_name}' failed: {error_msg}")
        recovery_entry["escalation"] = escalation_msg
        # Auto-send escalation via Slack
        from tools.external_apis import send_slack_message
        try:
            send_slack_message("#alerts", f"🚨 ESCALATION: {escalation_msg}")
            print(f"   📨 Escalation sent to #alerts")
        except:
            print(f"   ⚠️  Could not send escalation to Slack")
    
    recovery_actions.append(recovery_entry)
    
    audit_log.append(
        f"[{datetime.now().isoformat()}] RECOVERY [{strategy.upper()}]: "
        f"Tool '{tool_name}' failed → {reasoning}"
    )
    
    print(f"   ✅ Recovery complete. Strategy: {strategy}")
    
    return {
        "recovery_actions": recovery_actions,
        "execution_queue": execution_queue,
        "audit_log": audit_log,
    }


def get_recovery_route(state: AgentState) -> str:
    """
    Routing function: after recovery, check if new retry steps were added.
    If yes → route back to executor for another attempt.
    If no → go to audit (escalation or unrecoverable).
    """
    recovery_actions = state.get("recovery_actions", [])
    if recovery_actions:
        last = recovery_actions[-1]
        if last.get("strategy") in ("retry", "alternative"):
            return "executor"
    return "audit"
