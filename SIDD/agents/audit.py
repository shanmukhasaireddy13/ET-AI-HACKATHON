from state import AgentState
from datetime import datetime

def audit_node(state: AgentState) -> dict:
    """
    📜 AUDIT AGENT
    Final node. Generates a complete audit report of the entire workflow.
    
    Inter-agent connections:
      Monitor (all done) → THIS → END
      Recovery → THIS → END
      Summary → THIS → END
    """
    print("\n📜 AUDIT: Generating final audit report...")
    
    audit_log = state.get("audit_log", [])
    
    # ─── Build final summary ───
    intent = state.get("intent", "unknown")
    total_tasks = len(state.get("assigned_tasks", []))
    total_events = len(state.get("scheduled_events", []))
    total_bugs = len(state.get("bug_tickets", []))
    total_followups = len(state.get("followup_items", []))
    total_executed = len(state.get("execution_results", []))
    total_errors = len(state.get("errors", []))
    total_recoveries = len(state.get("recovery_actions", []))
    
    report = (
        f"\n{'=' * 50}\n"
        f"📜 FINAL AUDIT REPORT\n"
        f"{'=' * 50}\n"
        f"  Intent Detected  : {intent}\n"
        f"  Tasks Assigned   : {total_tasks}\n"
        f"  Events Scheduled : {total_events}\n"
        f"  Bugs Tracked     : {total_bugs}\n"
        f"  Follow-ups       : {total_followups}\n"
        f"  Steps Executed   : {total_executed}\n"
        f"  Errors           : {total_errors}\n"
        f"  Recoveries       : {total_recoveries}\n"
        f"{'=' * 50}\n"
        f"  Full Log ({len(audit_log)} entries):\n"
    )
    
    for entry in audit_log:
        report += f"    → {entry}\n"
    
    report += f"{'=' * 50}"
    
    print(report)
    
    audit_log.append(f"[{datetime.now().isoformat()}] AUDIT: Final report generated. Workflow complete.")
    
    return {"audit_log": audit_log}
