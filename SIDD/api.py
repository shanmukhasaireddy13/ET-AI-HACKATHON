"""
SIDD Agent Engine — Pure AI Core
No CRUD, no web logic, no OAuth.
Just the LangGraph agent execution engine.
"""
import json
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import create_empty_state
from graph import build_graph
from tools.database import save_meeting_results, get_meeting, _get_conn, init_db

app = FastAPI(title="SIDD Agent Engine", version="3.0.0")

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


class AgentProcessRequest(BaseModel):
    meeting_id: Optional[str] = None
    transcript: str


class ApprovalDecisionRequest(BaseModel):
    status: str  # "approved" or "rejected"
    approved_by: str = "human"
    feedback: str = ""


# ═══════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "sidd-agent-engine", "version": "3.0"}


# ═══════════════════════════════════════════
#  AGENT EXECUTION (Core)
# ═══════════════════════════════════════════

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


@app.post("/api/agent/process")
async def process_agent(req: AgentProcessRequest, background_tasks: BackgroundTasks):
    """
    The ONLY endpoint Express calls.
    Accepts a meeting_id + transcript, kicks off the LangGraph pipeline in the background.
    """
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


# ═══════════════════════════════════════════
#  AGENT DATA (for Express to read results)
# ═══════════════════════════════════════════

@app.get("/api/runs/{run_id}/snapshot")
async def run_snapshot(run_id: str):
    """Fallback snapshot by run_id (kept for Express compatibility)."""
    m = get_meeting(run_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    return _build_snapshot(m, run_id)


@app.get("/api/audit-logs/{meeting_id}")
async def audit_logs(meeting_id: str):
    m = get_meeting(meeting_id)
    if not m:
        return []
        
    logs = []
    for idx, l in enumerate(m.get("audit_log", [])):
        entry = l["entry"]
        agent = "System"
        if "ORCHESTRATOR" in entry: agent = "Orchestrator"
        elif "DYNAMIC_AGENT" in entry:
            import re
            match = re.search(r'DYNAMIC_AGENT \[(.+?)\]', entry)
            agent = match.group(1) if match else "DynamicAgent"
        elif "EXECUTOR" in entry: agent = "Executor"
        elif "MONITOR" in entry: agent = "Monitor"
        elif "RECOVERY" in entry: agent = "Recovery"
        elif "AUDIT" in entry: agent = "Audit"
            
        logs.append({
            "timestamp": datetime.now().isoformat(),
            "agent": agent,
            "action": entry,
            "details": {}
        })
    return logs


@app.get("/api/tasks/{meeting_id}")
async def fetch_tasks(meeting_id: str):
    m = get_meeting(meeting_id)
    if not m:
        return []
    return m.get("tasks", [])


@app.get("/api/workflows/{meeting_id}")
async def fetch_workflows(meeting_id: str):
    return []


@app.get("/api/reasoning/{meeting_id}")
async def fetch_reasoning(meeting_id: str):
    """Returns all per-agent reasoning — shows WHY decisions were made."""
    m = get_meeting(meeting_id)
    if not m:
        return []
    return m.get("agent_reasoning", [])


@app.post("/api/approvals/{approval_id}/decision")
async def approval_decision(approval_id: str, req: ApprovalDecisionRequest):
    """
    Human approves or rejects a gated action.
    If approved, the held tool call is EXECUTED immediately.
    """
    from tools.database import decide_approval
    
    if req.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    updated = decide_approval(approval_id, req.status, req.approved_by, req.feedback)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    result = {"approval": updated, "execution_result": None}
    
    if req.status == "approved":
        tool_name = updated.get("tool", "")
        args_raw = updated.get("args", "{}")
        args = json.loads(args_raw) if isinstance(args_raw, str) else args_raw
        
        tool_fn = TOOL_REGISTRY.get(tool_name)
        if tool_fn:
            try:
                exec_result = tool_fn(**args)
                result["execution_result"] = exec_result
            except Exception as e:
                result["execution_result"] = {"status": "failed", "error": str(e)}
    
    return result


def _build_snapshot(m, meeting_id):
    """Shared helper to build a snapshot dict from a meeting record."""
    tasks = []
    for t in m.get("tasks", []):
        tasks.append({
            "title": t["task"], 
            "owner": t["assignee"] or "System", 
            "status": t.get("status", "pending"),
            "priority": t.get("priority", "medium")
        })
    
    agent_statuses = []
    for ar in m.get("agent_reasoning", []):
        agent_statuses.append({
            "agent": ar.get("agent", ""),
            "status": "completed",
            "reasoning": ar.get("reasoning", "")
        })
    
    approvals = m.get("pending_approvals", [])
    
    return {
        "id": meeting_id,
        "meeting_id": meeting_id,
        "status": "completed" if tasks else "running",
        "meeting_transcript": m.get("transcript", ""),
        "summary": m.get("summary", ""),
        "tasks": tasks,
        "workflows": [],
        "execution_proposals": [],
        "errors": [],
        "agent_statuses": agent_statuses if agent_statuses else [{"status": "running"}],
        "approvals": [dict(a) for a in approvals],
        "agent_reasoning": m.get("agent_reasoning", []),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
