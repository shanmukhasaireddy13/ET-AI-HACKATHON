import json
import uuid
import sqlite3
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import create_empty_state
from graph import build_graph
from tools.database import (
    save_meeting_results, get_all_meetings, get_meeting, _get_conn,
    init_db, get_pending_approvals, decide_approval
)

app = FastAPI(title="SIDD Agentic AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import tool registry for approval execution
from tools.external_apis import create_jira_ticket, send_slack_message, schedule_calendar_event
TOOL_REGISTRY = {
    "create_jira_ticket": create_jira_ticket,
    "send_slack_message": send_slack_message,
    "schedule_calendar_event": schedule_calendar_event,
}


class ProcessMeetingRequest(BaseModel):
    meeting_id: Optional[str] = None
    transcript: str


class ApprovalDecisionRequest(BaseModel):
    status: str  # "approved" or "rejected"
    approved_by: str = "human"
    feedback: str = ""


def run_workflow_sync(meeting_id: str, transcript: str):
    """Runs the LangGraph workflow and saves the result."""
    graph = build_graph()
    state = create_empty_state(transcript)
    state["meeting_id"] = meeting_id
    
    accumulated_state = dict(state)
    for step_output in graph.stream(state):
        for node_name, updates in step_output.items():
            if isinstance(updates, dict):
                accumulated_state.update(updates)
                
    try:
        conn = _get_conn()
        conn.execute("DELETE FROM meetings WHERE id = ?", (meeting_id,))
        conn.commit()
        conn.close()
        
        save_meeting_results(accumulated_state)
    except Exception as e:
        print(f"Failed to run workflow for {meeting_id}: {e}")
        import traceback
        traceback.print_exc()


# ═══════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "sidd-agentic-ai", "version": "2.0"}


# ═══════════════════════════════════════════
#  MEETINGS
# ═══════════════════════════════════════════

@app.post("/api/meetings/process")
async def process_meeting(req: ProcessMeetingRequest, background_tasks: BackgroundTasks):
    init_db()
    meeting_id = req.meeting_id or f"mtg-{uuid.uuid4().hex[:8]}"
    
    conn = _get_conn()
    conn.execute(
        "INSERT INTO meetings (id, transcript, summary, orchestrator_reasoning, dynamic_steps, completed_steps, created_at) VALUES (?,?,?,?,?,?,?)",
        (meeting_id, req.transcript, "", "", "[]", "[]", datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    background_tasks.add_task(run_workflow_sync, meeting_id, req.transcript)
    
    return {
        "meeting_id": meeting_id,
        "run_id": f"run-{uuid.uuid4().hex[:8]}",
        "status": "running",
        "current_stage": "orchestrator"
    }


@app.get("/api/dashboard/meetings")
async def dashboard_meetings(limit: int = 20):
    init_db()
    conn = _get_conn()
    rows = conn.execute("SELECT id, transcript, summary, dynamic_steps, created_at FROM meetings ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    
    payload = []
    for r in rows:
        m = dict(r)
        has_summary = bool(m.get("summary"))
        steps_len = len(json.loads(m.get("dynamic_steps", "[]")))
        
        tasks_count = conn.execute("SELECT COUNT(*) FROM tasks WHERE meeting_id = ?", (m["id"],)).fetchone()[0]
        approval_count = conn.execute("SELECT COUNT(*) FROM pending_approvals WHERE meeting_id = ? AND status = 'pending'", (m["id"],)).fetchone()[0]
        
        if tasks_count == 0 and not has_summary and steps_len == 0:
            status = "running"
        elif approval_count > 0:
            status = "needs_review"
        else:
            status = "completed"
            
        payload.append({
            "id": m["id"],
            "status": status,
            "current_stage": status,
            "task_count": tasks_count,
            "approval_count": approval_count,
            "proposal_count": 0,
            "error_count": 0,
            "updated_at": m["created_at"],
            "transcript": m.get("transcript", "")
        })
    conn.close()
    return payload


@app.get("/api/meetings/{meeting_id}/snapshot")
async def meeting_snapshot(meeting_id: str):
    m = get_meeting(meeting_id)
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    tasks_count = len(m.get("tasks", []))
    approvals = m.get("pending_approvals", [])
    pending_count = sum(1 for a in approvals if a.get("status") == "pending")
    
    if pending_count > 0:
        status = "needs_review"
    elif tasks_count > 0 or m.get("summary"):
        status = "completed"
    else:
        status = "running"
    
    tasks = []
    for t in m.get("tasks", []):
        tasks.append({
            "title": t["task"], 
            "owner": t["assignee"] or "System", 
            "status": t.get("status", "pending"),
            "priority": t.get("priority", "medium")
        })
    
    # Build agent status list from reasoning
    agent_statuses = []
    for ar in m.get("agent_reasoning", []):
        agent_statuses.append({
            "agent": ar.get("agent", ""),
            "status": "completed",
            "reasoning": ar.get("reasoning", "")
        })
         
    return {
        "id": meeting_id,
        "meeting_id": meeting_id,
        "status": status,
        "meeting_transcript": m.get("transcript", ""),
        "summary": m.get("summary", ""),
        "orchestrator_reasoning": m.get("orchestrator_reasoning", ""),
        "tasks": tasks,
        "workflows": [],
        "execution_proposals": [],
        "errors": [],
        "agent_statuses": agent_statuses if agent_statuses else [{"status": status}],
        "approvals": [dict(a) for a in approvals],
        "agent_reasoning": m.get("agent_reasoning", []),
    }


# ═══════════════════════════════════════════
#  AUDIT LOGS
# ═══════════════════════════════════════════

@app.get("/api/audit-logs/{meeting_id}")
async def audit_logs(meeting_id: str):
    m = get_meeting(meeting_id)
    if not m:
        return []
        
    logs = []
    for idx, l in enumerate(m.get("audit_log", [])):
        entry = l["entry"]
        # Parse agent name from entry format: "[timestamp] AGENT_TYPE [role]: ..."
        agent = "System"
        if "ORCHESTRATOR" in entry:
            agent = "Orchestrator"
        elif "DYNAMIC_AGENT" in entry:
            # Extract role name from brackets
            import re
            match = re.search(r'DYNAMIC_AGENT \[(.+?)\]', entry)
            agent = match.group(1) if match else "DynamicAgent"
        elif "EXECUTOR" in entry:
            agent = "Executor"
        elif "MONITOR" in entry:
            agent = "Monitor"
        elif "RECOVERY" in entry:
            agent = "Recovery"
        elif "AUDIT" in entry:
            agent = "Audit"
            
        logs.append({
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "action": entry,
            "details": {}
        })
    return logs


# ═══════════════════════════════════════════
#  APPROVALS (Human-in-the-Loop)
# ═══════════════════════════════════════════

@app.get("/api/approvals")
async def fetch_approvals(meeting_id: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    """Get all pending approvals — the human-in-the-loop queue."""
    approvals = get_pending_approvals(meeting_id=meeting_id, status=status)
    # Parse args from JSON string back to dict for the frontend
    for a in approvals:
        if isinstance(a.get("args"), str):
            try:
                a["args"] = json.loads(a["args"])
            except:
                pass
    return approvals


@app.post("/api/approvals/{approval_id}/decision")
async def approval_decision(approval_id: str, req: ApprovalDecisionRequest):
    """
    Human approves or rejects a gated action.
    If approved, the held tool call is EXECUTED immediately.
    This is the core human-in-the-loop mechanism.
    """
    if req.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Update the approval status
    updated = decide_approval(approval_id, req.status, req.approved_by, req.feedback)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    result = {"approval": updated, "execution_result": None}
    
    # If approved — EXECUTE the held tool call now
    if req.status == "approved":
        tool_name = updated.get("tool", "")
        args_raw = updated.get("args", "{}")
        args = json.loads(args_raw) if isinstance(args_raw, str) else args_raw
        
        tool_fn = TOOL_REGISTRY.get(tool_name)
        if tool_fn:
            try:
                exec_result = tool_fn(**args)
                result["execution_result"] = exec_result
                
                # Log the execution in audit
                conn = _get_conn()
                conn.execute(
                    "INSERT INTO audit_log (meeting_id, entry) VALUES (?,?)",
                    (updated.get("meeting_id", ""),
                     f"[{datetime.now().isoformat()}] APPROVAL_EXECUTOR: {tool_name} → {exec_result.get('status', 'unknown')} (approved by {req.approved_by})")
                )
                conn.commit()
                conn.close()
            except Exception as e:
                result["execution_result"] = {"status": "failed", "error": str(e)}
    
    return result


# ═══════════════════════════════════════════
#  TASKS
# ═══════════════════════════════════════════

@app.get("/api/tasks/{meeting_id}")
async def fetch_tasks(meeting_id: str):
    m = get_meeting(meeting_id)
    if not m:
        return []
    return m.get("tasks", [])


@app.get("/api/workflows/{meeting_id}")
async def fetch_workflows(meeting_id: str):
    return []


# ═══════════════════════════════════════════
#  AGENT REASONING (Agentic Differentiator)
# ═══════════════════════════════════════════

@app.get("/api/reasoning/{meeting_id}")
async def fetch_reasoning(meeting_id: str):
    """Returns all per-agent reasoning for a meeting — shows WHY decisions were made."""
    m = get_meeting(meeting_id)
    if not m:
        return []
    return m.get("agent_reasoning", [])


# ═══════════════════════════════════════════
#  INTEGRATIONS (Self-Service Connections)
# ═══════════════════════════════════════════

class JiraConnectRequest(BaseModel):
    base_url: str
    email: str
    api_token: str
    project_key: str = "AE"


@app.get("/api/integrations")
async def list_integrations():
    """List all connected integrations."""
    init_db()
    conn = _get_conn()
    rows = conn.execute("SELECT id, service, base_url, email, project_key, status, connected_at FROM integrations").fetchall()
    conn.close()
    
    # Build a status map for known services
    connected = {dict(r)["service"]: dict(r) for r in rows}
    
    services = [
        {
            "service": "jira",
            "name": "Jira Cloud",
            "description": "Create tickets, track bugs, and manage tasks automatically.",
            "icon": "🎫",
            "connected": "jira" in connected,
            "details": connected.get("jira", {}),
        },
        {
            "service": "slack",
            "name": "Slack",
            "description": "Send notifications, alerts, and escalation messages to channels.",
            "icon": "💬",
            "connected": False,
            "details": {},
            "coming_soon": True,
        },
        {
            "service": "google_calendar",
            "name": "Google Calendar",
            "description": "Schedule follow-up meetings and events with attendees.",
            "icon": "📅",
            "connected": False,
            "details": {},
            "coming_soon": True,
        },
    ]
    return services


@app.post("/api/integrations/jira/test")
async def test_jira(req: JiraConnectRequest):
    """Test Jira credentials before saving."""
    from tools.external_apis import test_jira_connection
    result = test_jira_connection(req.base_url, req.email, req.api_token)
    return result


@app.post("/api/integrations/jira")
async def connect_jira(req: JiraConnectRequest):
    """Connect Jira by saving credentials after testing."""
    from tools.external_apis import test_jira_connection
    
    # Test first
    test_result = test_jira_connection(req.base_url, req.email, req.api_token)
    if test_result.get("status") != "success":
        raise HTTPException(status_code=400, detail=f"Connection failed: {test_result.get('error', 'Unknown error')}")
    
    # Save to DB
    init_db()
    conn = _get_conn()
    integration_id = f"int-{uuid.uuid4().hex[:8]}"
    conn.execute(
        "INSERT OR REPLACE INTO integrations (id, service, base_url, email, api_token, project_key, status, connected_at) VALUES (?,?,?,?,?,?,?,?)",
        (integration_id, "jira", req.base_url.rstrip("/"), req.email, req.api_token, req.project_key, "connected", datetime.now().isoformat())
    )
    conn.commit()
    conn.close()
    
    return {
        "status": "connected",
        "service": "jira",
        "user": test_result.get("user", ""),
        "email": test_result.get("email", ""),
    }


@app.delete("/api/integrations/jira")
async def disconnect_jira():
    """Disconnect Jira by removing saved credentials."""
    init_db()
    conn = _get_conn()
    conn.execute("DELETE FROM integrations WHERE service = 'jira'")
    conn.commit()
    conn.close()
    return {"status": "disconnected", "service": "jira"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
