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
            os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/meeting_mind")
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

def create_jira_ticket(title: str, description: str, priority: str = "Medium", assignee_name: str = None, issuetype: str = "Task") -> dict:
    """
    Creates a real Jira ticket via the Jira Cloud SDK or REST API (v3).
    Prioritizes .env credentials for simplicity and falls back to DB.
    """
    # 1. Look for .env first (Single Source of Truth)
    base_url = os.getenv("JIRA_BASE_URL", "").rstrip("/")
    email = os.getenv("JIRA_USER_EMAIL", "")
    api_token = os.getenv("JIRA_API_KEY", "")
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    integration = None

    # 2. Fallback to Database if .env is missing
    if not all([base_url, email, api_token]):
        integration = _get_integration("jira")
        if integration:
            base_url = integration.get("base_url", "").rstrip("/")
            email = integration.get("email", "")
            api_token = integration.get("api_token", "")
            project_key = integration.get("project_key", project_key)

    if not all([base_url, email, api_token]):
        print(f"[Tool] ⚠️  Jira not connected — using mock. Connect Jira from the Integrations page.")
        return {"status": "success", "ticket_id": "MOCK-001", "mock": True}

    # ── Try Jira SDK first (from the integrated Jira Agent) ──
    try:
        from tools.jira_module import jira_client
        domain = base_url.split("://")[-1].split(".atlassian.net")[0] if base_url else ""
        if domain:
            # Auto-detect project key if needed
            actual_project_key = project_key
            try:
                projects = jira_client.fetch_projects(domain, email, api_token)
                if projects:
                    available_keys = [p["key"] for p in projects]
                    if project_key not in available_keys:
                        actual_project_key = available_keys[0]
                        print(f"[Tool] ℹ️ Project '{project_key}' not found. Using '{actual_project_key}' instead.")
            except Exception:
                pass

            parsed = {
                "summary": title,
                "description": description,
                "priority": priority or "Medium",
                "issuetype": issuetype or "Task",
            }
            if assignee_name:
                parsed["assignee_name"] = assignee_name
            print(f"[Tool] 🔗 Creating Jira ticket via SDK: {title} [Project: {actual_project_key}]")
            result = jira_client.create_issue(domain, email, api_token, actual_project_key, parsed)
            print(f"[Tool] ✅ Jira ticket created: {result['key']}  →  {result['url']}")
            return {"status": "success", "ticket_id": result["key"], "url": result["url"]}
    except Exception as sdk_err:
        print(f"[Tool] ℹ️ Jira SDK fallback to REST API: {sdk_err}")

    # ── Fallback: Direct REST API ──
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

        fields = {
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
            "issuetype": {"name": issuetype or "Task"},
            "priority": {"name": priority or "Medium"},
        }

        payload = json.dumps({"fields": fields})

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

def _get_jira_credentials():
    # 1. Look for .env first
    base_url = os.getenv("JIRA_BASE_URL", "").rstrip("/")
    email = os.getenv("JIRA_USER_EMAIL", "")
    api_token = os.getenv("JIRA_API_KEY", "")
    
    # 2. Fallback to Database
    if not all([base_url, email, api_token]):
        integration = _get_integration("jira")
        if integration:
            base_url = integration.get("base_url", "").rstrip("/")
            email = integration.get("email", "")
            api_token = integration.get("api_token", "")
    
    domain = base_url.split("://")[-1].split(".atlassian.net")[0] if base_url else ""
    return domain, email, api_token

def update_jira_ticket(issue_key: str, summary: str = None, description: str = None, priority: str = None, assignee_name: str = None) -> dict:
    """Updates an existing Jira ticket using the Jira Agent SDK."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️  Jira not connected — using mock update.")
        return {"status": "success", "issue_key": issue_key, "mock": True}

    try:
        from tools.jira_module import jira_client
        parsed = {}
        if summary: parsed["summary"] = summary
        if description: parsed["description"] = description
        if priority: parsed["priority"] = priority
        if assignee_name: parsed["assignee_name"] = assignee_name
        
        print(f"[Tool] 🔗 Updating Jira ticket {issue_key}")
        result = jira_client.update_issue(domain, email, api_token, issue_key, parsed)
        return {"status": "success", "url": result["url"], "key": result["key"]}
    except Exception as e:
        print(f"[Tool] ❌ Jira update error: {e}")
        return {"status": "failed", "error": str(e)}

def search_jira_issues(jql: str) -> dict:
    """Searches Jira issues using JQL."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️  Jira not connected — returning mock search.")
        return {"status": "success", "issues": []}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 🔍 Searching Jira issues with JQL: {jql}")
        issues = jira_client.search_issues(domain, email, api_token, jql)
        return {"status": "success", "issues": issues}
    except Exception as e:
        print(f"[Tool] ❌ Jira search error: {e}")
        return {"status": "failed", "error": str(e)}

def delete_jira_issue(issue_key: str) -> dict:
    """Deletes an existing Jira issue."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock delete successful.")
        return {"status": "success", "issue_key": issue_key, "mock": True}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 🗑️ Deleting Jira issue {issue_key}")
        jira_client.delete_issue(domain, email, api_token, issue_key)
        return {"status": "success", "issue_key": issue_key}
    except Exception as e:
        print(f"[Tool] ❌ Jira delete error: {e}")
        return {"status": "failed", "error": str(e)}

def add_jira_comment(issue_key: str, body: str) -> dict:
    """Adds a comment to an existing Jira issue."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock comment successful.")
        return {"status": "success", "issue_key": issue_key, "mock": True}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 💬 Adding Jira comment to {issue_key}")
        jira_client.add_comment(domain, email, api_token, issue_key, body)
        return {"status": "success", "issue_key": issue_key}
    except Exception as e:
        print(f"[Tool] ❌ Jira comment error: {e}")
        return {"status": "failed", "error": str(e)}

def transition_jira_issue(issue_key: str, status: str) -> dict:
    """Transitions a Jira issue (e.g. to 'Done', 'In Progress')."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock transition successful.")
        return {"status": "success", "issue_key": issue_key, "mock": True}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 🔄 Transitioning Jira issue {issue_key} to '{status}'")
        jira_client.transition_issue(domain, email, api_token, issue_key, status)
        return {"status": "success", "issue_key": issue_key}
    except Exception as e:
        print(f"[Tool] ❌ Jira transition error: {e}")
        return {"status": "failed", "error": str(e)}

def get_jira_comments(issue_key: str) -> dict:
    """Retrieves recent comments for a Jira issue."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock comments successful.")
        return {"status": "success", "comments": [{"author": "System", "body": "Mock comment for integration test"}]}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 💬 Fetching comments for {issue_key}")
        comments = jira_client.get_comments(domain, email, api_token, issue_key)
        return {"status": "success", "comments": comments}
    except Exception as e:
        print(f"[Tool] ❌ Jira comments error: {e}")
        return {"status": "failed", "error": str(e)}

def get_jira_transitions(issue_key: str) -> dict:
    """Gets available status transitions for a Jira issue (e.g., 'Done', 'In Progress')."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock transitions successful.")
        return {"status": "success", "transitions": ["To Do", "In Progress", "Done"]}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 🔍 Fetching available transitions for {issue_key}")
        transitions = jira_client.get_transitions(domain, email, api_token, issue_key)
        return {"status": "success", "transitions": transitions}
    except Exception as e:
        print(f"[Tool] ❌ Jira transitions error: {e}")
        return {"status": "failed", "error": str(e)}

def assign_jira_issue(issue_key: str, assignee_name: str) -> dict:
    """Assigns a Jira issue to a user by name."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — mock assignment successful.")
        return {"status": "success", "issue_key": issue_key, "mock": True}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 👤 Assigning {issue_key} to {assignee_name}")
        jira_client.assign_issue(domain, email, api_token, issue_key, assignee_name)
        return {"status": "success", "issue_key": issue_key}
    except Exception as e:
        print(f"[Tool] ❌ Jira assignment error: {e}")
        return {"status": "failed", "error": str(e)}

def fetch_project_issues(project_key: str) -> dict:
    """Fetches up to 100 recent issues for a given project."""
    domain, email, api_token = _get_jira_credentials()
    if not all([domain, email, api_token]):
        print(f"[Tool] ⚠️ Jira not connected — returning mock issues.")
        return {"status": "success", "issues": []}
    
    try:
        from tools.jira_module import jira_client
        print(f"[Tool] 📂 Fetching issues for project {project_key}")
        issues = jira_client.fetch_all_project_issues(domain, email, api_token, project_key)
        return {"status": "success", "issues": issues}
    except Exception as e:
        print(f"[Tool] ❌ Jira fetch error: {e}")
        return {"status": "failed", "error": str(e)}


# ═════════════════════════════════════════
#  SLACK — MOCK (ready for future integration)
# ═════════════════════════════════════════

def send_slack_message(channel: str, message: str) -> dict:
    """Mock function to simulate sending a Slack message."""
    print(f"[Tool] 📨 Sending Slack message to {channel}: {message}")
    return {"status": "success", "delivered": True}


# ═════════════════════════════════════════
#  CALENDAR — AUTONOMOUS AGENT INTEGRATION
# ═════════════════════════════════════════

def schedule_calendar_event(title: str, time: str, attendees: list = None) -> dict:
    """Schedules a real calendar event using the Google Calendar Agent."""
    # Filter attendees: only keep valid email addresses (contain '@')
    # The Brain often passes role names like "QA team" which crash the API
    valid_attendees = None
    if attendees:
        valid_attendees = [a for a in attendees if isinstance(a, str) and "@" in a]
        dropped = [a for a in attendees if not isinstance(a, str) or "@" not in a]
        if dropped:
            print(f"[Tool] ℹ️ Dropped non-email attendees: {dropped}")
        if not valid_attendees:
            valid_attendees = None

    print(f"[Tool] 📅 Scheduling Event: '{title}' at {time} with {valid_attendees or '(no attendees)'}")
    try:
        from tools.gcalendar.calendar_client import CalendarClient
        client = CalendarClient()
        result = client.create_event(title=title, time_text=time, duration_minutes=60, attendees=valid_attendees)
        if "error" in result:
            print(f"[Tool] ❌ Google Calendar API error: {result['error']}")
            return {"status": "failed", "error": result["error"]}
        
        event_link = result.get('event_link', '')
        print(f"[Tool] ✅ Google Calendar event created: {event_link}")
        return {"status": "success", "event_link": event_link, "details": result}
    except Exception as e:
        print(f"[Tool] ❌ Google Calendar Exception: {e}")
        return {"status": "failed", "error": str(e)}


# ═════════════════════════════════════════
#  NOTION — INTEGRATED TASK MANAGEMENT
# ═════════════════════════════════════════

def create_notion_task(title: str, description: str = "", deadline: str = None, priority: str = "Medium", effort: float = None, **kwargs) -> dict:
    """
    Creates a task in Notion. Handles credentials from DB or .env fallback.
    """
    # ── Handle Brain hallucinations (extra args like 'owner') ──
    if kwargs:
        print(f"[Tool] ℹ️ Ignoring unrecognized Notion task parameters: {list(kwargs.keys())}")
        if "owner" in kwargs and not description.strip().endswith(f"(Assignee: {kwargs['owner']})"):
             description += f"\n\n(Assignee: {kwargs['owner']})"

    # ── Handle "TBD" or invalid date formats ──
    clean_deadline = deadline
    if deadline and isinstance(deadline, str):
        if deadline.strip().lower() in ("tbd", "n/a", "asap", "none", "", "unknown"):
            clean_deadline = None

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
        if clean_deadline:
            properties["Deadline"] = {"date": {"start": clean_deadline}}
        
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
