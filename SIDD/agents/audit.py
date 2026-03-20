from state import AgentState
from datetime import datetime

def audit_node(state: AgentState) -> dict:
    """
    📜 AUDIT AGENT (Agentic — Full Decision Auditability)
    Final node. Generates a complete audit report with:
    - What each agent decided and WHY
    - Which actions were auto-executed vs held for approval
    - Recovery decisions and their reasoning
    """
    print("\n📜 AUDIT: Generating final audit report...")
    
    audit_log = list(state.get("audit_log", []))
    
    # ─── Build final summary ───
    total_tasks = len(state.get("assigned_tasks", []))
    total_events = len(state.get("scheduled_events", []))
    total_bugs = len(state.get("bug_tickets", []))
    total_followups = len(state.get("followup_items", []))
    total_executed = len(state.get("execution_results", []))
    total_errors = len(state.get("errors", []))
    total_recoveries = len(state.get("recovery_actions", []))
    total_approvals = len(state.get("pending_approvals", []))
    
    # Count auto-executed vs gated
    auto_executed = sum(1 for r in state.get("execution_results", []) 
                       if r.get("result", {}).get("status") == "success")
    gated = sum(1 for r in state.get("execution_results", []) 
               if r.get("result", {}).get("status") == "pending_approval")
    
    # Reasoning summary
    agent_reasoning = state.get("agent_reasoning", [])
    
    report = (
        f"\n{'=' * 50}\n"
        f"📜 FINAL AUDIT REPORT (Agentic AI)\n"
        f"{'=' * 50}\n"
        f"  Orchestrator Plan  : {len(state.get('completed_steps', []))} dynamic steps\n"
        f"  Tasks Assigned     : {total_tasks}\n"
        f"  Events Scheduled   : {total_events}\n"
        f"  Bugs Tracked       : {total_bugs}\n"
        f"  Follow-ups         : {total_followups}\n"
        f"  Tool Executions    : {total_executed}\n"
        f"    ├─ Auto-executed : {auto_executed}\n"
        f"    └─ Held for approval : {gated}\n"
        f"  Errors             : {total_errors}\n"
        f"  Recoveries (LLM)  : {total_recoveries}\n"
        f"  Pending Approvals  : {total_approvals}\n"
        f"{'=' * 50}\n"
    )
    
    if agent_reasoning:
        report += f"  Agent Reasoning ({len(agent_reasoning)} entries):\n"
        for ar in agent_reasoning:
            report += f"    🧠 [{ar.get('agent')}]: {ar.get('reasoning', '')[:120]}...\n"
        report += f"{'=' * 50}\n"
    
    report += f"  Full Log ({len(audit_log)} entries):\n"
    for entry in audit_log:
        report += f"    → {entry}\n"
    report += f"{'=' * 50}"
    
    print(report)
    
    audit_log.append(f"[{datetime.now().isoformat()}] AUDIT: Final report generated. "
                    f"Auto-executed: {auto_executed}, Gated: {gated}, Recoveries: {total_recoveries}")
    
    return {"audit_log": audit_log}
