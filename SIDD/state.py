from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    """
    Shared state for the dynamic multi-agent workflow.
    All agents read from and write to this state.
    The key innovation is `dynamic_plan` — an ordered list of agent names
    that the Orchestrator builds and agents can modify at runtime.
    """
    
    # ─── INPUT ───
    meeting_transcript: str
    
    # ─── DYNAMIC WORKFLOW ENGINE ───
    dynamic_plan: List[str]          # ordered list of agent names to invoke, e.g. ["task_divider", "scheduler"]
    current_agent_index: int         # which agent in the plan we're currently at
    completed_agents: List[str]      # agents that have already run
    
    # ─── ORCHESTRATOR ANALYSIS ───
    orchestrator_reasoning: str      # LLM's reasoning for why it chose this plan
    
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
    
    # ─── MONITORING & RECOVERY ───
    errors: List[str]
    recovery_actions: List[Dict[str, Any]]
    
    # ─── AUDIT ───
    audit_log: List[str]
