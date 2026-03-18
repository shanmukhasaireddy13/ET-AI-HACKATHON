from state import AgentState
from utils.llm import call_gemini_safe
from datetime import datetime

# ─── Available agents ───
AVAILABLE_AGENTS = {
    "task_divider":  "Breaks work into assignable sub-tasks with owners and deadlines",
    "scheduler":     "Handles meeting scheduling, calendar events, and time slots",
    "bug_tracker":   "Creates bug/issue tickets and tracks defects",
    "followup":      "Generates follow-up reminders and pending action checks",
    "summary":       "Produces a concise meeting summary or recap",
}

ORCHESTRATOR_PROMPT = """You are the orchestrator of a multi-agent AI workflow system.
Your job is to analyze a meeting transcript and decide which specialized agents should handle it.

Available agents:
{agents_desc}

Meeting Transcript:
\"\"\"{transcript}\"\"\"

Analyze the transcript and determine:
1. Which agents are needed (can be multiple)
2. The optimal order to run them
3. Your reasoning

IMPORTANT: Return ONLY a valid JSON object in this exact format, no other text:
{{
    "agents": ["agent_name_1", "agent_name_2"],
    "reasoning": "Brief explanation of why these agents were selected and in this order"
}}

Rules:
- Only use agent names from the available list above
- Order matters: put prerequisite agents first
- If the transcript is general with no specific actionable items, use ["summary"]
- You can select 1 to all 5 agents based on what the meeting actually needs
"""

def orchestrator_node(state: AgentState) -> dict:
    """
    🧠 ORCHESTRATOR (Gemini Flash Powered)
    Analyzes the meeting transcript and DYNAMICALLY builds a plan of agents.
    """
    print("\n" + "=" * 60)
    print("🧠 ORCHESTRATOR: Analyzing transcript with Gemini Flash...")
    print("=" * 60)
    
    transcript = state.get("meeting_transcript", "")
    
    # Build the available agents description
    agents_desc = "\n".join([f"- {name}: {desc}" for name, desc in AVAILABLE_AGENTS.items()])
    
    # ═══ CALL GEMINI FLASH ═══
    prompt = ORCHESTRATOR_PROMPT.format(agents_desc=agents_desc, transcript=transcript)
    
    result = call_gemini_safe(prompt, fallback={"agents": ["summary"], "reasoning": "Fallback: defaulting to summary"})
    
    selected_agents = result.get("agents", ["summary"])
    reasoning = result.get("reasoning", "No reasoning provided")
    
    # Validate agent names
    valid_agents = [a for a in selected_agents if a in AVAILABLE_AGENTS]
    if not valid_agents:
        valid_agents = ["summary"]
        reasoning += " (Invalid agents filtered, defaulting to summary)"
    
    print(f"\n   📋 Dynamic Plan: {valid_agents}")
    print(f"   💭 Reasoning: {reasoning}")
    
    audit_log = state.get("audit_log", [])
    audit_log.append(f"[{datetime.now().isoformat()}] ORCHESTRATOR: Plan={valid_agents} | Reason={reasoning}")
    
    return {
        "dynamic_plan": valid_agents,
        "current_agent_index": 0,
        "completed_agents": [],
        "orchestrator_reasoning": reasoning,
        "audit_log": audit_log,
    }
