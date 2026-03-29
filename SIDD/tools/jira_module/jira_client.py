import logging
# Suppress verbose HTTP output from the Jira SDK
logging.getLogger("jira").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

from jira import JIRA

def _client(domain: str, email: str, token: str) -> JIRA:
    """Return an authenticated JIRA client."""
    return JIRA(
        server=f"https://{domain.strip()}.atlassian.net",
        basic_auth=(email.strip(), token.strip()),
    )


def fetch_projects(domain: str, email: str, token: str) -> list[dict]:
    """Fetch all Jira projects the user has access to."""
    jira = _client(domain, email, token)
    projects = jira.projects()
    return [{"key": p.key, "name": p.name} for p in sorted(projects, key=lambda p: p.name)]


def fetch_issue_types(domain: str, email: str, token: str, project_key: str) -> list[str]:
    """Fetch valid issue type names for a specific project."""
    jira = _client(domain, email, token)
    try:
        meta = jira.createmeta(
            projectKeys=project_key.strip().upper(),
            expand="projects.issuetypes",
        )
        projects = meta.get("projects", [])
        if projects:
            return [it["name"] for it in projects[0].get("issuetypes", [])]
    except Exception:
        pass
    return ["Task", "Bug", "Story"]


def create_issue(domain: str, email: str, token: str, project_key: str, parsed: dict) -> dict:
    jira = _client(domain, email, token)
    fields = {
        "project":     {"key": project_key.strip().upper()},
        "summary":     parsed["summary"],
        "description": parsed.get("description", ""),
        "issuetype":   {"name": parsed.get("issuetype", "Task")},
        "priority":    {"name": parsed.get("priority", "Medium")},
    }
    if parsed.get("due_date"): fields["duedate"] = parsed["due_date"]
    if parsed.get("labels"): fields["labels"] = [str(l).replace(" ", "_") for l in parsed["labels"]]

    if assignee_name := parsed.get("assignee_name"):
        try:
            users = jira.search_users(query=assignee_name)
            if users: fields["assignee"] = {"accountId": users[0].accountId}
        except Exception: pass

    issue = jira.create_issue(fields=fields)
    return {"key": issue.key, "url": f"https://{domain.strip()}.atlassian.net/browse/{issue.key}"}

def get_issue(domain: str, email: str, token: str, issue_key: str) -> dict:
    jira = _client(domain, email, token)
    issue = jira.issue(issue_key)
    return {
        "key": issue.key,
        "summary": issue.fields.summary,
        "description": getattr(issue.fields, 'description', ''),
        "status": issue.fields.status.name,
        "priority": issue.fields.priority.name,
        "assignee_name": issue.fields.assignee.displayName if issue.fields.assignee else None,
        "url": f"https://{domain.strip()}.atlassian.net/browse/{issue.key}"
    }

def update_issue(domain: str, email: str, token: str, issue_key: str, parsed: dict) -> dict:
    jira = _client(domain, email, token)
    issue = jira.issue(issue_key)
    
    fields_to_update = {}
    if parsed.get("summary"): fields_to_update["summary"] = parsed["summary"]
    if parsed.get("description"): fields_to_update["description"] = parsed["description"]
    if parsed.get("priority"): fields_to_update["priority"] = {"name": parsed["priority"]}
    
    if parsed.get("assignee_name"):
        users = jira.search_users(query=parsed["assignee_name"])
        if users: fields_to_update["assignee"] = {"accountId": users[0].accountId}

    issue.update(fields=fields_to_update)
    return {"key": issue.key, "url": f"https://{domain.strip()}.atlassian.net/browse/{issue.key}"}

def search_issues(domain: str, email: str, token: str, jql: str) -> list[dict]:
    jira = _client(domain, email, token)
    issues = jira.search_issues(jql, maxResults=10)
    return [{
        "key": issue.key,
        "summary": issue.fields.summary,
        "status": issue.fields.status.name,
        "assignee_name": issue.fields.assignee.displayName if issue.fields.assignee else None,
        "url": f"https://{domain.strip()}.atlassian.net/browse/{issue.key}"
    } for issue in issues]
