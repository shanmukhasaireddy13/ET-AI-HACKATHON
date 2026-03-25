"""
🚀 Supabase Persistence Layer for SIDD
======================================
Stores all meeting workflow results in Supabase PostgreSQL via PostgREST.
"""

import os
import json
import uuid
from typing import Optional, Dict
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load env from SIDD folder
load_dotenv()

PROJECT_URL = os.getenv("PROJECT_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:3001")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def init_db():
    """No-op for Supabase as schema is managed via migrations."""
    pass

def _post(table: str, data: dict):
    url = f"{PROJECT_URL}/rest/v1/{table}"
    try:
        resp = requests.post(url, headers=HEADERS, json=data)
        resp.raise_for_status()
        res_data = resp.json()
        if isinstance(res_data, list) and len(res_data) > 0:
            return res_data[0]
        return res_data
    except Exception as e:
        print(f"❌ Supabase POST Error ({table}): {e}")
        return None

def record_activity(category: str, action: str, description: str = "", entity_id: Optional[str] = None, entity_type: Optional[str] = None, metadata: Optional[Dict] = None):
    """Log a unified activity event to Supabase."""
    payload = {
        "category": category,
        "action": action,
        "description": description,
        "metadata": metadata or {}
    }
    if entity_id: payload["entity_id"] = entity_id
    if entity_type: payload["entity_type"] = entity_type
    
    return _post("activity_events", payload)

def save_meeting_results(state: dict) -> str:
    """Persist the final LangGraph state into Supabase."""
    meeting_id = state.get("meeting_id")
    if not meeting_id:
        return ""

    # 1. Update/Inject summary into meetings table
    url = f"{PROJECT_URL}/rest/v1/meetings?id=eq.{meeting_id}"
    update_data = {
        "summary": state.get("meeting_summary", ""),
        "status": "completed",
    }
    requests.patch(url, headers=HEADERS, json=update_data)

    # 2. Tasks
    for t in state.get("assigned_tasks", []):
        task_payload = {
            "meeting_id": meeting_id,
            "title": t.get("title", str(t)) if isinstance(t, dict) else str(t),
            "assignee_name": t.get("assignee", "Unassigned") if isinstance(t, dict) else "Unassigned",
            "priority": t.get("priority", "medium") if isinstance(t, dict) else "medium",
            "status": "pending"
        }
        
        # Only add due_at if it's not TBD and exists
        deadline = t.get("deadline") if isinstance(t, dict) else None
        if deadline and deadline != "TBD":
            try:
                # Basic check for date-like string before sending
                task_payload["due_at"] = deadline
            except:
                pass
                
        _post("tasks", task_payload)

    # 3. Events
    for ev in state.get("scheduled_events", []):
        _post("events", {
            "meeting_id": meeting_id,
            "title": ev.get("title", str(ev)),
            "time": ev.get("time", ""),
            "attendees": ev.get("attendees", [])
        })

    # 4. Bug Tickets
    for bt in state.get("bug_tickets", []):
        _post("bug_tickets", {
            "meeting_id": meeting_id,
            "title": bt.get("title", str(bt)),
            "severity": bt.get("severity", "medium"),
            "jira_ticket_id": bt.get("jira_ticket_id", "")
        })

    # 5. Followups
    for fu in state.get("followup_items", []):
        _post("followups", {
            "meeting_id": meeting_id,
            "item": fu.get("item", str(fu)),
            "owner": fu.get("owner", "")
        })

    # 6. Approvals (PostgreSQL table: approvals)
    for ap in state.get("pending_approvals", []):
        _post("approvals", {
            "meeting_id": meeting_id,
            "tool_name": ap.get("tool", ""),
            "args": ap.get("args", {}),
            "source_agent": ap.get("source_agent", ""),
            "status": "pending",
            "reason": ap.get("reason", "")
        })

    # 7. Agent Reasoning & Metrics Update
    for ar in state.get("agent_reasoning", []):
        agent_name = ar.get("agent", "")
        _post("agent_reasoning", {
            "meeting_id": meeting_id,
            "agent_name": agent_name,
            "reasoning": ar.get("reasoning", ""),
            "context_data": ar.get("outputs_produced", {}) if isinstance(ar.get("outputs_produced"), dict) else {"outputs": ar.get("outputs_produced")}
        })
        
        # Update Metrics (Increment tasks_done)
        try:
            m_url = f"{PROJECT_URL}/rest/v1/agent_metrics?agent_id=eq.{agent_name}"
            m_resp = requests.get(m_url, headers=HEADERS)
            if m_resp.status_code == 200 and m_resp.json():
                curr = m_resp.json()[0]
                requests.patch(m_url, headers=HEADERS, json={
                    "tasks_done": curr["tasks_done"] + 1,
                    "last_active_at": datetime.now().isoformat()
                })
        except:
            pass

    # 8. Decisions (Extracted meeting decisions)
    for dec in state.get("decisions", []):
        decision_text = str(dec)
        if isinstance(dec, dict):
            # Try multiple common keys the LLM might use
            decision_text = dec.get("decision") or dec.get("text") or dec.get("value") or str(dec)
            
        _post("decisions", {
            "meeting_id": meeting_id,
            "text": decision_text,
            "priority": dec.get("priority", "Normal") if isinstance(dec, dict) else "Normal",
            "confidence": int(str(dec.get("confidence", 90)).replace("%","")) if isinstance(dec, dict) else 90,
            "timestamp": dec.get("timestamp", "") if isinstance(dec, dict) else ""
        })

    # 9. Key Topics
    for topic in state.get("key_topics", []):
        _post("key_topics", {
            "meeting_id": meeting_id,
            "topic": str(topic)
        })

    # 10. Log Completion Activity
    # 10. Sync to MongoDB via Express Gateway (The Archive)
    sync_results_to_mongo(meeting_id, state)

    record_activity(
        category="meeting",
        action="analyzed",
        description=f"Meeting analyzed successfully.",
        entity_id=meeting_id,
        entity_type="meeting"
    )

    print(f"   🚀 Meeting results synced to Supabase & MongoDB (id: {meeting_id})")
    return meeting_id


def sync_agent_reasoning(meeting_id: str, agent_name: str, reasoning: str, outputs: dict = None, status: str = "completed"):
    """
    ⚡ REAL-TIME SYNC
    Updates Supabase agent_reasoning table immediately so the frontend updates its status.
    """
    if not meeting_id: return
    
    payload = {
        "meeting_id": meeting_id,
        "agent_name": agent_name,
        "reasoning": reasoning,
        "status": status,
        "context_data": outputs or {}
    }
    _post("agent_reasoning", payload)


def sync_results_to_mongo(meeting_id: str, state: dict):
    """
    📦 ARCHIVAL SYNC
    Calls the Express Gateway to update the MongoDB document with the final snapshot.
    """
    url = f"{GATEWAY_URL}/api/meetings/{meeting_id}/sync"
    
    # Format tasks for MongoDB array
    tasks = []
    for t in state.get("assigned_tasks", []):
        if isinstance(t, dict):
            tasks.append({
                "title": t.get("title", ""),
                "assignee": t.get("assignee", "Unassigned"),
                "priority": t.get("priority", "medium"),
                "status": "pending"
            })
            
    # Format decisions for MongoDB array
    decisions = []
    for d in state.get("decisions", []):
        if isinstance(d, dict):
            decisions.append({
                "text": d.get("decision", str(d)),
                "rationale": d.get("rationale", ""),
                "owner": d.get("owner", "")
            })

    payload = {
        "summary": state.get("meeting_summary", ""),
        "tasks": tasks,
        "decisions": decisions,
        "status": "completed"
    }
    
    try:
        requests.patch(url, headers=HEADERS, json=payload)
    except Exception as e:
        print(f"⚠️ MongoDB Sync Error: {e}")

def get_meeting(meeting_id: str) -> dict:
    """Retrieve meeting data for API snapshots."""
    url = f"{PROJECT_URL}/rest/v1/meetings?id=eq.{meeting_id}&select=*,tasks(count)"
    resp = requests.get(url, headers=HEADERS)
    data = resp.json()
    return data[0] if data else {}

def decide_approval(approval_id: str, decision: str, approved_by: str = "", feedback: str = "") -> dict:
    """Update approval status in Supabase."""
    url = f"{PROJECT_URL}/rest/v1/approvals?id=eq.{approval_id}"
    update_data = {
        "status": decision,
        "decided_at": datetime.now().isoformat()
    }
    resp = requests.patch(url, headers=HEADERS, json=update_data)
    # Fetch updated
    resp = requests.get(f"{PROJECT_URL}/rest/v1/approvals?id=eq.{approval_id}", headers=HEADERS)
    data = resp.json()
    return data[0] if data else {}

def save_execution_step(meeting_id: str, step_data: dict) -> dict:
    """Log a granular execution step to Supabase (The Technical Trace)."""
    if not meeting_id:
        return {}  # Skip saving if testing locally without a UUID

    try:
        criticality = int(step_data.get("criticality", 5))
    except (ValueError, TypeError):
        criticality = 5

    payload = {
        "meeting_id": meeting_id,
        "step_index": step_data.get("step_index", 0),
        "agent_role": step_data.get("agent_role", "SIDD_Brain"),
        "thought": step_data.get("thought", ""),
        "tool_name": step_data.get("tool_name", ""),
        "tool_args": step_data.get("tool_args", {}),
        "criticality": criticality,
        "status": step_data.get("status", "pending"),
        "result": step_data.get("result", {}),
        "error": step_data.get("error", "")
    }
    
    return _post("agent_execution_steps", payload)

def update_execution_step(step_id: str, update_data: dict):
    """Update an existing execution step (e.g., mark as success/failed)."""
    url = f"{PROJECT_URL}/rest/v1/agent_execution_steps?id=eq.{step_id}"
    requests.patch(url, headers=HEADERS, json=update_data)
