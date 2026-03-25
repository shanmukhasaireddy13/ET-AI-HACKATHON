from state import AgentState
from datetime import datetime
from tools.database import save_meeting_results

def audit_node(state: AgentState) -> dict:
    """
    📜 AUDIT AGENT (Full Decision Auditability + Supabase Persistence)
    Final node. Generates a complete audit report and persists all results.
    """
    print("\n📜 AUDIT: Generating final audit report...")

    audit_log = list(state.get("audit_log", []))

    # ─── Build final summary ───
    total_tasks = len(state.get("assigned_tasks", []))
    total_events = len(state.get("scheduled_events", []))
    total_bugs = len(state.get("bug_tickets", []))
    total_followups = len(state.get("followup_items", []))
    total_decisions = len(state.get("decisions", []))
    total_executed = len(state.get("execution_results", []))
    total_errors = len(state.get("errors", []))
    total_recoveries = len(state.get("recovery_actions", []))
    total_approvals = len(state.get("pending_approvals", []))

    # Count auto-executed vs gated
    auto_executed = sum(1 for r in state.get("execution_results", [])
                       if r.get("result", {}).get("status") == "success")
    gated = sum(1 for r in state.get("execution_results", [])
               if r.get("result", {}).get("status") in ("pending_approval", "gated"))
    failed = sum(1 for r in state.get("execution_results", [])
                if r.get("result", {}).get("status") == "failed")

    agent_reasoning = state.get("agent_reasoning", [])

    report = (
        f"\n{'=' * 50}\n"
        f"📜 FINAL AUDIT REPORT (True Multi-Agent ReAct)\n"
        f"{'=' * 50}\n"
        f"  ── Phase 1: Understanding ──\n"
        f"  Tasks Extracted    : {total_tasks}\n"
        f"  Events Extracted   : {total_events}\n"
        f"  Bugs Extracted     : {total_bugs}\n"
        f"  Follow-ups         : {total_followups}\n"
        f"  Decisions Found    : {total_decisions}\n"
        f"  ── Phase 3: Execution ──\n"
        f"  Tool Executions    : {total_executed}\n"
        f"    ├─ Auto-executed : {auto_executed}\n"
        f"    ├─ Gated (Human) : {gated}\n"
        f"    └─ Failed        : {failed}\n"
        f"  ── Phase 4: Monitoring ──\n"
        f"  Errors             : {total_errors}\n"
        f"  Recoveries (Auto)  : {total_recoveries}\n"
        f"  Pending Approvals  : {total_approvals}\n"
        f"{'=' * 50}\n"
    )

    if agent_reasoning:
        report += f"  Agent Reasoning ({len(agent_reasoning)} entries):\n"
        for ar in agent_reasoning:
            report += f"    🧠 [{ar.get('agent')}]: {str(ar.get('reasoning', ''))[:120]}...\n"
        report += f"{'=' * 50}\n"

    report += f"  Full Log ({len(audit_log)} entries):\n"
    for entry in audit_log:
        report += f"    → {entry}\n"
    report += f"{'=' * 50}"

    print(report)

    # ─── PERSIST TO SUPABASE ───
    try:
        meeting_id = save_meeting_results(state)
        if meeting_id:
            print(f"\n   💾 All results persisted to Supabase (meeting: {meeting_id})")
    except Exception as e:
        print(f"\n   ⚠️ Supabase persistence error: {e}")

    audit_log.append(f"[{datetime.now().isoformat()}] AUDIT: Final report generated. "
                    f"Auto-executed: {auto_executed}, Gated: {gated}, Failed: {failed}, Recoveries: {total_recoveries}")

    return {"audit_log": audit_log}
