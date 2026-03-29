"""
🔌 External API Integrations
==============================
Reads OAuth credentials from the shared PostgreSQL database (written by Express).
Falls back to .env if no DB credentials exist.
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()


def _get_integration(service: str) -> dict:
    """Load saved integration credentials from shared PostgreSQL."""
    # Try PostgreSQL first (shared with Express)
    try:
        import psycopg2
        conn = psycopg2.connect(
            os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sidd")
        )
        cur = conn.cursor()
        cur.execute(
            "SELECT id, service, base_url, email, api_token, project_key, status, connected_at, extra FROM integrations WHERE service = %s AND status = 'connected'",
            (service.lower(),)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {
                "id": row[0], "service": row[1], "base_url": row[2],
                "email": row[3], "api_token": row[4], "project_key": row[5],
                "status": row[6], "connected_at": row[7], "extra": row[8] or "{}"
            }
    except Exception as e:
        print(f"[Tool] PostgreSQL lookup failed ({e}), trying SQLite fallback...")
    
    # Fallback to local SQLite (for backward compatibility)
    try:
        from tools.database import _get_conn, init_db
        init_db()
        conn = _get_conn()
        row = conn.execute("SELECT * FROM integrations WHERE service = ? AND status = 'connected'", (service,)).fetchone()
        conn.close()
        if row:
            return dict(row)
    except Exception:
        pass
    return {}


# ═════════════════════════════════════════
#  JIRA — READS FROM SHARED POSTGRES DB
# ═════════════════════════════════════════

def create_jira_ticket(title: str, description: str) -> dict:
    """
    Creates a real Jira ticket via the Jira Cloud REST API (v3).
    Reads OAuth credentials from the shared PostgreSQL database.
    """
    integration = _get_integration("jira")
    
    if integration:
        base_url = integration.get("base_url", "").rstrip("/")
        email = integration.get("email", "")
        api_token = integration.get("api_token", "")
        project_key = integration.get("project_key", "AE")
    else:
        # Fallback to .env
        base_url = os.getenv("JIRA_BASE_URL", "").rstrip("/")
        email = os.getenv("JIRA_USER_EMAIL", "")
        api_token = os.getenv("JIRA_API_KEY", "")
        project_key = os.getenv("JIRA_PROJECT_KEY", "AE")

    if not all([base_url, email, api_token]):
        print(f"[Tool] ⚠️  Jira not connected — using mock. Connect Jira from the Integrations page.")
        return {"status": "success", "ticket_id": "MOCK-001", "mock": True}

    try:
        import requests
        
        # Check if this is an OAuth token (has cloud_id in extras)
        cloud_id = ""
        if integration:
            try:
                extra = json.loads(integration.get("extra", "{}"))
                cloud_id = extra.get("cloud_id", "")
            except Exception:
                pass
        
        if cloud_id:
            # OAuth 2.0 — use Bearer token with cloud-scoped API
            url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/issue"
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            auth = None
        else:
            # Legacy API token — use Basic Auth
            from requests.auth import HTTPBasicAuth
            url = f"{base_url}/rest/api/3/issue"
            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            auth = HTTPBasicAuth(email, api_token)

        payload = json.dumps({
            "fields": {
                "project": {"key": project_key},
                "summary": title,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": description}],
                        }
                    ],
                },
                "issuetype": {"name": "Task"},
            }
        })

        print(f"[Tool] 🔗 Creating Jira ticket: {title}")
        response = requests.post(url, data=payload, headers=headers, auth=auth, timeout=15)

        if response.status_code in (200, 201):
            data = response.json()
            ticket_key = data.get("key", "UNKNOWN")
            ticket_url = f"{base_url}/browse/{ticket_key}"
            print(f"[Tool] ✅ Jira ticket created: {ticket_key}  →  {ticket_url}")
            return {"status": "success", "ticket_id": ticket_key, "url": ticket_url}
        else:
            error_msg = response.text[:300]
            print(f"[Tool] ❌ Jira API error ({response.status_code}): {error_msg}")
            return {"status": "failed", "error": f"HTTP {response.status_code}: {error_msg}"}

    except Exception as e:
        print(f"[Tool] ❌ Jira API exception: {e}")
        return {"status": "failed", "error": str(e)}


# ═════════════════════════════════════════
#  SLACK — MOCK (ready for future integration)
# ═════════════════════════════════════════

def send_slack_message(channel: str, message: str) -> dict:
    """Mock function to simulate sending a Slack message."""
    print(f"[Tool] 📨 Sending Slack message to {channel}: {message}")
    return {"status": "success", "delivered": True}


# ═════════════════════════════════════════
#  CALENDAR — MOCK (ready for future integration)
# ═════════════════════════════════════════

def schedule_calendar_event(title: str, time: str, attendees: list) -> dict:
    """Mock function to simulate scheduling a calendar event."""
    print(f"[Tool] 📅 Scheduling Event: '{title}' at {time} with {attendees}")
    return {"status": "success", "event_link": "http://cal.event/456"}


# ═════════════════════════════════════════
#  NOTION — INTEGRATED TASK MANAGEMENT
# ═════════════════════════════════════════

def create_notion_task(title: str, description: str = "", deadline: str = None, priority: str = "Medium", effort: float = None) -> dict:
    """
    Creates a task in Notion. Handles credentials from DB or .env fallback.
    """
    integration = _get_integration("notion")
    
    if integration:
        token = integration.get("api_token", "")
        # Try to find database_id in extra or project_key
        try:
            extra = json.loads(integration.get("extra", "{}"))
            database_id = extra.get("database_id", "")
        except:
            database_id = ""
        
        if not database_id:
            database_id = integration.get("project_key", "")
    else:
        # Fallback to .env
        token = os.getenv("NOTION_TOKEN", "")
        database_id = os.getenv("NOTION_DATABASE_ID", "")

    if not all([token, database_id]):
        print(f"[Tool] ⚠️  Notion not fully connected (missing token or DB ID) — using mock.")
        return {"status": "success", "task_id": "MOCK-NOTION-123", "mock": True}

    try:
        from notion_client import Client
        notion = Client(auth=token)
        
        properties = {
            "Name": {"title": [{"text": {"content": title}}]}
        }
        
        # Add rich_text description if provided
        if description:
            properties["Description"] = {"rich_text": [{"text": {"content": description}}]}
            
        # Optional properties (if they exist in the workspace schema)
        if deadline:
            properties["Deadline"] = {"date": {"start": deadline}}
        
        if priority:
            # We assume a 'Priority' Select property exists
            properties["Priority"] = {"select": {"name": priority}}
            
        if effort is not None:
            # We assume an 'Effort (Hours)' Number property exists
            properties["Effort (Hours)"] = {"number": effort}

        print(f"[Tool] 🔗 Creating Notion task: {title}")
        response = notion.pages.create(
            parent={"database_id": database_id.replace("-", "")},
            properties=properties
        )
        
        task_id = response.get("id")
        task_url = response.get("url")
        print(f"[Tool] ✅ Notion task created: {task_id}")
        return {"status": "success", "task_id": task_id, "url": task_url}

    except Exception as e:
        print(f"[Tool] ❌ Notion API error: {e}")
        return {"status": "failed", "error": str(e)}
