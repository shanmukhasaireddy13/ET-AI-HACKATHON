from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    """
    Shared state for the True Multi-Agent ReAct Workflow.
    
    ARCHITECTURE:
    Phase 1 (Understand): Extraction agents populate structured data
    Phase 2 (Plan): Orchestrator creates strategic directive from extracted data
    Phase 3 (Execute): Brain + Executor run the ReAct loop
    Phase 4 (Monitor): Monitor checks results, retries or escalates to human
    """
    
    # ─── INPUT ───
    meeting_transcript: str
    meeting_id: str
    
    # ─── PHASE 1: UNDERSTANDING (Extraction Agent Outputs) ───
    assigned_tasks: List[Dict[str, Any]]      # task_divider output
    scheduled_events: List[Dict[str, Any]]    # scheduler output
    bug_tickets: List[Dict[str, Any]]         # bug_tracker output
    followup_items: List[Dict[str, Any]]      # followup output
    meeting_summary: str                       # summary output
    decisions: List[Dict[str, Any]]           # summary output (decisions extracted)
    key_topics: List[str]                      # summary output
    
    # ─── PHASE 2: PLANNING ───
    orchestrator_reasoning: str                # Strategic directive from planner
    
    # ─── PHASE 3: EXECUTION (ReAct Loop) ───
    execution_queue: List[Dict[str, Any]]      # Tool calls queued by brain
    current_step_index: int                    # Position in execution_queue
    execution_results: List[Dict[str, Any]]    # Results from executor
    
    # ─── PHASE 4: MONITORING & RECOVERY ───
    errors: List[str]
    recovery_actions: List[Dict[str, Any]]
    
    # ─── HUMAN-IN-THE-LOOP ───
    pending_approvals: List[Dict[str, Any]]    # Actions waiting for human review
    
    # ─── AUDIT & TRACING ───
    agent_reasoning: List[Dict[str, Any]]      # Per-agent reasoning trail
    audit_log: List[str]                       # Full timeline
    is_goal_achieved: bool                     # Flag for ReAct loop termination
    
    # ─── LEGACY (kept for backward compatibility) ───
    dynamic_steps: List[Dict[str, Any]]
    waiting_agents: Dict[str, List[str]]
    completed_steps: List[Dict[str, Any]]
