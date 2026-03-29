from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
import json
from tools.database import sync_agent_reasoning

SYNTHESIZER_PROMPT = """You are the Meeting Mind Synthesizer, an advanced multi-modal extraction agent. 
Your job is to analyze a meeting transcript and extract ALL structured data in one pass.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract the following categories of information:

1. **Tasks (Administrative/Coordination)**: Action items that are NOT technical bugs.
2. **Bugs (Technical/Defects)**: Software crashes, pipeline errors, technical issues.
3. **Events (Calendar/Scheduling)**: Meeting requests, review sessions, or time-boxed events.
4. **Follow-ups**: Status checks or items requiring tracking but not necessarily "tasks".
5. **Summary**: A professional overview including key decisions and topics.

### EXTRACTION RULES:
- **Tasks**: Include title, assignee, priority, and deadline (YYYY-MM-DD or "TBD").
- **Bugs**: Include title, severity, and reporter.
- **Events**: Include title, time/date, and attendees (names only).
- **Follow-ups**: Include item and owner.
- **Summary**: Concise professional summary.
- **Decisions**: List of what was decided, rationale, and owner.
- **Key Topics**: List of the main themes discussed.

### IMPORTANT:
Return ONLY a valid JSON object in this exact format:
{{
    "tasks": [
        {{"title": "...", "assignee": "...", "priority": "...", "deadline": "..."}}
    ],
    "bugs": [
        {{"title": "...", "severity": "...", "reporter": "..."}}
    ],
    "events": [
        {{"title": "...", "time": "...", "attendees": ["...", "..."]}}
    ],
    "followups": [
        {{"item": "...", "owner": "..."}}
    ],
    "summary": "Full professional summary text...",
    "decisions": [
        {{"decision": "...", "rationale": "...", "owner": "..."}}
    ],
    "key_topics": ["...", "..."]
}}
"""

def synthesizer_node(state: AgentState) -> dict:
    """
    🧠 THE SYNTHESIZER (Phase 1: Universal Extractor)
    Replaces 5 separate agents into a single high-performance node.
    Extracts Tasks, Bugs, Events, Follow-ups, and Summaries in one pass.
    """
    # ── RESUMPTION CHECK ──
    if state.get("assigned_tasks") or state.get("meeting_summary"):
        print("\n🧠 SYNTHESIZER: Resumed State detected. Skipping re-extraction.")
        return {}

    print("\n🧠 SYNTHESIZER: Extracting all meeting data in one pass...")
    
    transcript = state.get("meeting_transcript", "")
    meeting_id = state.get("meeting_id")
    
    prompt = SYNTHESIZER_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={
        "tasks": [], "bugs": [], "events": [], "followups": [],
        "summary": "Analysis failed.", "decisions": [], "key_topics": []
    })
    
    # ── 1. Map to State ──
    tasks = result.get("tasks", [])
    bugs = result.get("bugs", [])
    events = result.get("events", [])
    followups = result.get("followups", [])
    summary = result.get("summary", "No summary generated.")
    decisions = result.get("decisions", [])
    key_topics = result.get("key_topics", [])
    
    # ── 2. Logging & Reasoning ──
    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] SYNTHESIZER: Extracted {len(tasks)} tasks, {len(bugs)} bugs, {len(events)} events.")
    
    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "synthesizer",
        "reasoning": "Unifed extraction pass completed.",
        "outputs_produced": {
            "tasks_count": len(tasks),
            "bugs_count": len(bugs),
            "events_count": len(events),
            "followup_count": len(followups),
            "decisions_count": len(decisions)
        }
    })
    
    # ── 3. Real-time Sync ──
    try:
        sync_agent_reasoning(meeting_id, "synthesizer", "Unifed extraction pass completed.", {
            "tasks": len(tasks), "bugs": len(bugs), "events": len(events)
        })
    except: pass
    
    print(f"   ✅ Extraction Complete: {len(tasks)} tasks, {len(bugs)} bugs, {len(events)} events found.")
    
    return {
        "assigned_tasks": tasks,
        "bug_tickets": bugs,
        "scheduled_events": events,
        "followup_items": followups,
        "meeting_summary": summary,
        "decisions": decisions,
        "key_topics": key_topics,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning
    }
