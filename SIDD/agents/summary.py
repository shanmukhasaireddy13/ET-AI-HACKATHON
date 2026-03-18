from state import AgentState
from utils.llm import call_gemini
from datetime import datetime

SUMMARY_PROMPT = """You are a Meeting Summary AI agent. Generate a concise, professional summary of this meeting.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Context from other agents that already processed this meeting:
- Tasks assigned: {tasks_count}
- Events scheduled: {events_count}  
- Bugs tracked: {bugs_count}
- Follow-ups created: {followups_count}
- Agents that ran: {completed_agents}

Generate a well-structured meeting summary that includes:
1. Key discussion points
2. Decisions made
3. Actions taken by the AI system
4. Any outstanding items

Write the summary in plain text, be concise but comprehensive.
"""

def summary_node(state: AgentState) -> dict:
    """
    📝 SUMMARY AGENT (Gemini Flash Powered)
    Generates a comprehensive meeting summary, aware of all work done by other agents.
    """
    print("\n📝 SUMMARY: Generating summary with Gemini Flash...")
    
    transcript = state.get("meeting_transcript", "")
    completed = list(state.get("completed_agents", []))
    
    # ═══ CALL GEMINI FLASH ═══
    prompt = SUMMARY_PROMPT.format(
        transcript=transcript,
        tasks_count=len(state.get("assigned_tasks", [])),
        events_count=len(state.get("scheduled_events", [])),
        bugs_count=len(state.get("bug_tickets", [])),
        followups_count=len(state.get("followup_items", [])),
        completed_agents=completed,
    )
    meeting_summary = call_gemini(prompt, expect_json=False)
    
    # ═══ ADVANCE PLAN ═══
    dynamic_plan = list(state.get("dynamic_plan", []))
    index = state.get("current_agent_index", 0)
    completed.append("summary")
    
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] SUMMARY: Generated ({len(str(meeting_summary))} chars)")
    
    print(f"   ✅ Summary generated ({len(str(meeting_summary))} chars)")
    
    return {
        "meeting_summary": meeting_summary,
        "dynamic_plan": dynamic_plan,
        "current_agent_index": index + 1,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
