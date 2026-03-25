from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
from tools.database import sync_agent_reasoning

SUMMARY_PROMPT = """You are a Meeting Summary AI agent. Generate a concise, professional summary of this meeting.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Generate a well-structured meeting summary that includes:
1. Key discussion points
2. Decisions made
3. Action items identified
4. Any outstanding items or risks

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "summary": "String containing your entire well-structured summary...",
    "decisions": [
        {{"decision": "what was decided", "rationale": "why", "owner": "who"}}
    ],
    "key_topics": ["topic1", "topic2"]
}}
"""

def summary_node(state: AgentState) -> dict:
    """
    📝 SUMMARY AGENT (Pure Extractor)
    Generates a comprehensive meeting summary.
    Does NOT queue any tool calls — only returns structured data.
    """
    print("\n📝 SUMMARY: Generating meeting summary...")

    transcript = state.get("meeting_transcript", "")

    prompt = SUMMARY_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"summary": "Meeting summary could not be generated.", "decisions": [], "key_topics": []})

    meeting_summary = result.get("summary", "No summary generated.")
    decisions = result.get("decisions", [])
    key_topics = result.get("key_topics", [])

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] SUMMARY: Generated summary ({len(meeting_summary)} chars), {len(decisions)} decisions")

    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "summary",
        "reasoning": f"Generated meeting summary with {len(decisions)} decisions and {len(key_topics)} key topics.",
        "outputs_produced": {"summary_length": len(meeting_summary), "decisions_count": len(decisions)}
    })

    print(f"   ✅ Summary generated ({len(meeting_summary)} chars), {len(decisions)} decisions found")
    
    # Real-time Sync
    sync_agent_reasoning(state.get("meeting_id"), "summary", f"Generated meeting summary with {len(decisions)} decisions and {len(key_topics)} key topics.", {
        "summary_length": len(meeting_summary),
        "decisions_count": len(decisions),
        "topics_count": len(key_topics)
    })

    return {
        "meeting_summary": meeting_summary,
        "decisions": decisions,
        "key_topics": key_topics,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning,
    }
