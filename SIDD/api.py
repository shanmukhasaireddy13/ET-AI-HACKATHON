"""
SIDD Agent Engine — Pure AI Core
No CRUD, no web logic, no OAuth.
Just the LangGraph agent execution engine.
"""
import json
import uuid
from datetime import datetime
from typing import Optional

import requests
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from main import create_empty_state
from graph import build_graph
from tools.database import save_meeting_results, get_meeting, init_db, HEADERS, PROJECT_URL

app = FastAPI(title="SIDD Agent Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import tool registry for approval execution
from tools.external_apis import create_jira_ticket, send_slack_message, schedule_calendar_event, create_notion_task
TOOL_REGISTRY = {
    "create_jira_ticket": create_jira_ticket,
    "send_slack_message": send_slack_message,
    "schedule_calendar_event": schedule_calendar_event,
    "create_notion_task": create_notion_task,
}


class AgentProcessRequest(BaseModel):
    meeting_id: Optional[str] = None
    transcript: str
    metadata: Optional[dict] = None


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
    """Runs the LangGraph workflow. The audit node handles persistence."""
    graph = build_graph()
    state = create_empty_state(transcript)
    state["meeting_id"] = meeting_id
    
    try:
        accumulated_state = dict(state)
        for step_output in graph.stream(state):
            for node_name, updates in step_output.items():
                if isinstance(updates, dict):
                    accumulated_state.update(updates)
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
    meeting_id = req.meeting_id or str(uuid.uuid4())
    
    # Extract metadata
    meta = req.metadata or {}
    title = meta.get("title") or f"Meeting {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    platform = meta.get("platform") or "zoom"
    duration = meta.get("duration") or 0
    participants = meta.get("participants") or []

    # Create initial record in Supabase
    url = f"{PROJECT_URL}/rest/v1/meetings"
    initial_data = {
        "id": meeting_id,
        "transcript": req.transcript,
        "title": title,
        "status": "processing",
        "source": platform,
        "duration": duration,
        "participants": participants,
        "created_at": datetime.now().isoformat()
    }
    requests.post(url, headers=HEADERS, json=initial_data)
    
    # NEW: Record Activity
    from tools.database import record_activity
    record_activity(
        category="meeting",
        action="ingested",
        description=f"Meeting '{title}' uploaded and processing started.",
        entity_id=meeting_id,
        entity_type="meeting"
    )

    background_tasks.add_task(run_workflow_sync, meeting_id, req.transcript)
    
    return {
        "meeting_id": meeting_id,
        "run_id": str(uuid.uuid4()),
        "status": "running",
        "current_stage": "orchestrator"
    }


class ChatRequest(BaseModel):
    messages: list


from fastapi.responses import StreamingResponse

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Chat endpoint — streams structured JSON-line events for the frontend
    workflow visualization. Each line is a JSON object with a 'type' field.
    """
    init_db()
    
    user_messages = [m for m in req.messages if m.get("role") == "user"]
    if not user_messages:
        return StreamingResponse(
            iter([json.dumps({"type": "error", "message": "No user message provided."}) + "\n"]),
            media_type="text/plain"
        )
    
    transcript = user_messages[-1].get("content", "")
    if not transcript.strip():
        return StreamingResponse(
            iter([json.dumps({"type": "error", "message": "Empty message received."}) + "\n"]),
            media_type="text/plain"
        )
    
    meeting_id = str(uuid.uuid4())
    
    def emit(event_type, **kwargs):
        return json.dumps({"type": event_type, **kwargs}) + "\n"
    
    def generate():
        try:
            yield emit("status", message=f"Starting 100% Agentic Analysis for meeting {meeting_id}...")
            
            graph = build_graph()
            state = create_empty_state(transcript)
            state["meeting_id"] = meeting_id
            
            accumulated_state = dict(state)
            for step_output in graph.stream(state):
                for node_name, updates in step_output.items():
                    # Map node names to user-friendly stages
                    stage_map = {
                        "planner": "Planning Strategy",
                        "brain": "Reasoning & Goal Execution",
                        "executor": "Executing Tool Calls",
                        "monitor": "Reviewing Results",
                        "audit": "Finalizing Analysis"
                    }
                    yield emit("node_start", node=node_name, stage=stage_map.get(node_name, node_name))
                    
                    if isinstance(updates, dict):
                        accumulated_state.update(updates)
                        
                        # Special: If Brain has a new thought, emit it immediately
                        if node_name == "brain" and "orchestrator_reasoning" in updates:
                            yield emit("thought", content=updates["orchestrator_reasoning"])
                            
                        # Special: If Executor has new results, emit them
                        if node_name == "executor" and "execution_results" in updates:
                            yield emit("execution", data=updates["execution_results"][-1])
                            
                    yield emit("node_complete", node=node_name)
            
            # Save final results
            try:
                save_meeting_results(accumulated_state)
            except Exception as e:
                yield emit("warning", message=f"Could not save final results — {e}")
            
            # Emit structured outputs for the frontend to update various tabs
            outputs = {
                "summary": accumulated_state.get("meeting_summary", ""),
                "tasks": accumulated_state.get("assigned_tasks", []),
                "events": accumulated_state.get("scheduled_events", []),
                "bugs": accumulated_state.get("bug_tickets", []),
                "followups": accumulated_state.get("followup_items", []),
                "approvals": accumulated_state.get("pending_approvals", []),
                "reasoning": accumulated_state.get("agent_reasoning", [])
            }
            
            for key, data in outputs.items():
                if data:
                    yield emit(key, data=data if key != "summary" else None, content=data if key == "summary" else None)
            
            yield emit("done", meeting_id=meeting_id)
            
        except Exception as e:
            import traceback
            yield emit("error", message=str(e))
            traceback.print_exc()

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")


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
    # In the new architecture, we mainly pull from agent_execution_steps if available,
    # or fall back to the audit_log list in the meeting record.
    raw_logs = m.get("audit_log", [])
    for l in raw_logs:
        entry = l if isinstance(l, str) else str(l)
        agent = "System"
        
        if "PLANNER" in entry: agent = "Planner"
        elif "BRAIN" in entry: agent = "SIDD Brain"
        elif "EXECUTOR" in entry: agent = "Executor"
        elif "MONITOR" in entry: agent = "Monitor"
        elif "AUDIT" in entry: agent = "Auditor"
            
        logs.append({
            "timestamp": datetime.now().isoformat(), # Ideally we'd parse from log if available
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


class TaskPushRequest(BaseModel):
    service: str  # "jira" or "notion"


@app.post("/api/tasks/{task_id}/push")
async def push_task_manual(task_id: str, req: TaskPushRequest):
    """
    Manually push a specific task to Jira or Notion.
    """
    init_db()
    
    # 1. Fetch task from Supabase
    url = f"{PROJECT_URL}/rest/v1/tasks?id=eq.{task_id}"
    resp = requests.get(url, headers=HEADERS)
    if not resp.ok or not resp.json():
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = resp.json()[0]
    
    # 2. Map service to tool
    tool_name = "create_jira_ticket" if req.service == "jira" else "create_notion_task"
    tool_fn = TOOL_REGISTRY.get(tool_name)
    
    if not tool_fn:
        raise HTTPException(status_code=400, detail=f"Tool {tool_name} not found")
    
    # 3. Prepare args
    args = {
        "title": task.get("title", "Untitled Task"),
        "description": f"Created from meeting: {task.get('meeting_id', 'Unknown')}"
    }
    
    if req.service == "notion":
        args["priority"] = task.get("priority", "Medium")
        # deadline could be added here if due_at exists
    
    # 4. Execute
    try:
        result = tool_fn(**args)
        
        # 5. Update task in Supabase on success
        if result.get("status") == "success":
            update_payload = {}
            if req.service == "jira":
                update_payload["jira_key"] = result.get("ticket_id")
            elif req.service == "notion":
                # We'll store Notion URL in a metadata field or project_key (Supabase schema dependent)
                # For now, we'll just record it in activity
                pass
            
            if update_payload:
                requests.patch(url, headers=HEADERS, json=update_payload)
                
            # Log Activity
            from tools.database import record_activity
            record_activity(
                category="task",
                action="pushed",
                description=f"Task '{task.get('title')}' pushed to {req.service}.",
                entity_id=task_id,
                entity_type="task",
                metadata={"service": req.service, "result": result}
            )
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
