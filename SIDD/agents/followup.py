from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime
from tools.database import sync_agent_reasoning

FOLLOWUP_PROMPT = """You are a Follow-Up AI agent. Your job is to extract all follow-up actions, reminders, and status checks from a meeting transcript.

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Extract each follow-up. For each, provide:
- The follow-up item
- Owner (if mentioned)

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "followups": [
        {{"item": "what needs tracking", "owner": "person"}}
    ]
}}
"""

def followup_node(state: AgentState) -> dict:
    """
    🔄 FOLLOW-UP AGENT (Pure Extractor)
    Tracks status updates and required follow-ups.
    Does NOT queue any tool calls — only returns structured data.
    """
    print("\n🔄 FOLLOW-UP: Extracting follow-ups...")

    transcript = state.get("meeting_transcript", "")

    prompt = FOLLOWUP_PROMPT.format(transcript=transcript)
    result = call_gemini_safe(prompt, fallback={"followups": []})

    followup_items = result.get("followups", [])

    audit_log = list(state.get("audit_log", []))
    audit_log.append(f"[{datetime.now().isoformat()}] FOLLOWUP: Extracted {len(followup_items)} follow-up items")

    agent_reasoning = list(state.get("agent_reasoning", []))
    agent_reasoning.append({
        "agent": "followup",
        "reasoning": f"Extracted {len(followup_items)} follow-up items from transcript.",
        "outputs_produced": {"followups": followup_items}
    })

    print(f"   ✅ Follow-up extraction complete: {len(followup_items)} items found")
    
    # Real-time Sync
    sync_agent_reasoning(state.get("meeting_id"), "followup", f"Extracted {len(followup_items)} follow-up items from transcript.", {"followup_count": len(followup_items)})

    return {
        "followup_items": followup_items,
        "audit_log": audit_log,
        "agent_reasoning": agent_reasoning,
    }
