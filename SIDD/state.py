from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    """
    Shared state for the dynamic multi-agent workflow.
    All agents read from and write to this state.
    
    AGENTIC DESIGN:
    - dynamic_steps: LLM-generated workflow plan (not hardcoded)
    - agent_reasoning: per-agent explanations of WHY decisions were made
    - pending_approvals: human-in-the-loop gates for critical actions
    """
    
    # ─── INPUT ───
    meeting_transcript: str
    meeting_id: str
    
    # ─── DYNAMIC WORKFLOW ENGINE ───
    dynamic_steps: List[Dict[str, Any]]   # queue of {"role": "...", "auto_prompt": "..."}
    waiting_agents: Dict[str, List[str]]  # agent/role -> list of items it's waiting on
    completed_steps: List[Dict[str, Any]] # steps that have already run
    
    # ─── ORCHESTRATOR ANALYSIS ───
    orchestrator_reasoning: str      # LLM's reasoning for why it chose this plan
    
    # ─── AGENTIC: PER-AGENT REASONING TRAIL ───
    agent_reasoning: List[Dict[str, Any]]  # [{"agent": "...", "reasoning": "...", "outputs": [...]}]
    
    # ─── SPECIALIZED AGENT OUTPUTS ───
    meeting_summary: str
    assigned_tasks: List[Dict[str, Any]]
    scheduled_events: List[Dict[str, Any]]
    bug_tickets: List[Dict[str, Any]]
    followup_items: List[Dict[str, Any]]
    
    # ─── EXECUTION PIPELINE ───
    execution_queue: List[Dict[str, Any]]   # all tool calls queued by agents
    current_step_index: int                 # position in execution_queue
    execution_results: List[Dict[str, Any]]
    
    # ─── HUMAN-IN-THE-LOOP ───
    pending_approvals: List[Dict[str, Any]]  # actions waiting for human approval
    
    # ─── MONITORING & RECOVERY ───
    errors: List[str]
    recovery_actions: List[Dict[str, Any]]
    
    # ─── AUDIT ───
    audit_log: List[str]
