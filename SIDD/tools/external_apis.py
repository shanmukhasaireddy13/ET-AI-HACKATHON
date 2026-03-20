"""
🔌 External API Integrations
==============================
Reads credentials from the integrations DB table (user-configured).
Falls back to .env if no DB credentials exist.
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()


def _get_integration(service: str) -> dict:
    """Load saved integration credentials from the database."""
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
#  JIRA — READS FROM DB OR .ENV
# ═════════════════════════════════════════

def create_jira_ticket(title: str, description: str) -> dict:
    """
    Creates a real Jira ticket via the Jira Cloud REST API (v3).
    Reads credentials from the integrations DB first, falls back to .env.
    """
    # Try DB-saved credentials first
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
        from requests.auth import HTTPBasicAuth

        url = f"{base_url}/rest/api/3/issue"
        auth = HTTPBasicAuth(email, api_token)
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
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


def test_jira_connection(base_url: str, email: str, api_token: str) -> dict:
    """Tests if Jira credentials are valid by fetching the current user."""
    try:
        import requests
        from requests.auth import HTTPBasicAuth
        
        url = f"{base_url.rstrip('/')}/rest/api/3/myself"
        auth = HTTPBasicAuth(email, api_token)
        headers = {"Accept": "application/json"}
        
        response = requests.get(url, headers=headers, auth=auth, timeout=10)
        
        if response.status_code == 200:
            user = response.json()
            return {
                "status": "success",
                "user": user.get("displayName", ""),
                "email": user.get("emailAddress", ""),
                "account_id": user.get("accountId", "")
            }
        else:
            return {"status": "failed", "error": f"HTTP {response.status_code}: {response.text[:200]}"}
    except Exception as e:
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
