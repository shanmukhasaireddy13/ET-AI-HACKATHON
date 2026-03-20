from state import AgentState
from utils.llm import call_gemini_safe
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

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "summary": "String containing your entire well-structured summary formatted logically...",
    "waiting_on": []
}}
For waiting_on: ONLY list valid agent names. Valid agents: "task_divider", "scheduler", "bug_tracker", "followup". If you need tasks or bugs to be processed first, return ["task_divider", "bug_tracker"]. Otherwise return [].
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
    result = call_gemini_safe(prompt, fallback={"summary": "Failed to generate summary.", "waiting_on": []})
    
    meeting_summary = result.get("summary", "No summary generated.")
    
    # Filter waiting_on strictly and ignore already completed agents
    valid_agents = {"task_divider", "scheduler", "bug_tracker", "followup"}
    raw_waiting = result.get("waiting_on", [])
    completed = list(state.get("completed_agents", []))
    if isinstance(raw_waiting, list):
        waiting_on = [a for a in raw_waiting if a in valid_agents and a not in completed]
    else:
        waiting_on = []
    
    pending_agents = list(state.get("pending_agents", []))
    if "summary" in pending_agents:
        pending_agents.remove("summary")
        
    audit_log = list(state.get("audit_log", []))
    
    if waiting_on:
        print(f"   ⏳ SUMMARY waiting on: {waiting_on}")
        waiting_agents = dict(state.get("waiting_agents", {}))
        waiting_agents["summary"] = waiting_on
        audit_log.append(f"[{datetime.now().isoformat()}] SUMMARY: Waiting on {waiting_on}")
        return {
            "pending_agents": pending_agents,
            "waiting_agents": waiting_agents,
            "audit_log": audit_log,
        }
    
    # ═══ UNBLOCKING ═══
    completed.append("summary")
    
    waiting_agents = dict(state.get("waiting_agents", {}))
    # Unblock agents whose dependencies are met
    for agent, deps in list(waiting_agents.items()):
        if all(d in completed for d in deps):
            print(f"   🟢 Unblocked agent: {agent}")
            pending_agents.append(agent)
            del waiting_agents[agent]
            
    audit_log.append(f"[{datetime.now().isoformat()}] SUMMARY: Generated ({len(meeting_summary)} chars)")
    
    print(f"   ✅ Summary generated ({len(meeting_summary)} chars)")
    
    return {
        "meeting_summary": meeting_summary,
        "pending_agents": pending_agents,
        "waiting_agents": waiting_agents,
        "completed_agents": completed,
        "audit_log": audit_log,
    }
