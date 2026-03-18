def create_jira_ticket(title: str, description: str) -> dict:
    """Mock function to simulate creating a Jira ticket."""
    print(f"[Tool] Creating Jira Ticket: {title}")
    return {"status": "success", "ticket_id": "PROJ-123"}

def send_slack_message(channel: str, message: str) -> dict:
    """Mock function to simulate sending a Slack message."""
    print(f"[Tool] Sending Slack message to {channel}: {message}")
    return {"status": "success", "delivered": True}

def schedule_calendar_event(title: str, time: str, attendees: list) -> dict:
    """Mock function to simulate scheduling a calendar event."""
    print(f"[Tool] Scheduling Event: '{title}' at {time} with {attendees}")
    return {"status": "success", "event_link": "http://cal.event/456"}
