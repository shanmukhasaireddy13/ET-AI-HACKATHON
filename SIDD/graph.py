"""
🧠 Meeting Mind Agent Engine — True Multi-Agent ReAct Workflow
======================================================
Architecture:
  Phase 1 (Understand):  Parallel extraction agents extract structured data
  Phase 2 (Aggregate):   Aggregator synchronizes all extraction results
  Phase 3 (Plan):        Strategic Planner creates a unified execution directive
  Phase 4 (Execute):     Brain -> Executor -> Monitor (ReAct loop)
  Phase 5 (Audit):       Final report and database persistence
"""

from langgraph.graph import StateGraph, END
from state import AgentState

# Phase 1: Understanding Agent (Unified Extractor)
from agents.synthesizer import synthesizer_node

# Phase 3: Planning
from agents.orchestrator import orchestrator_node

# Phase 4: Execution (ReAct)
from agents.brain import brain_node
from agents.executor import execution_node
from agents.monitor import monitor_node

# Phase 5: Audit
from agents.audit import audit_node


# ─── ROUTING FUNCTIONS ───

def get_brain_route(state: AgentState) -> str:
    """After Brain: either execute proposed actions or finish."""
    if state.get("is_goal_achieved", False):
        return "audit"

    queue = state.get("execution_queue", [])
    current_idx = state.get("current_step_index", 0)
    if current_idx < len(queue):
        return "executor"

    # Safety: if brain proposed nothing and goal not achieved, go to audit
    return "audit"


def get_monitor_route(state: AgentState) -> str:
    """After Monitor: continue executing, loop back to brain, or finish."""
    queue = state.get("execution_queue", [])
    current_idx = state.get("current_step_index", 0)

    # More items in the queue? Keep executing.
    if current_idx < len(queue):
        return "executor"

    # Queue exhausted — loop back to Brain for more reasoning
    return "brain"


def build_graph():
    """
    Builds the True Multi-Agent ReAct pipeline.
    
    Flow:
      ENTRY ──> synthesizer ──> planner ──> brain <───┐
                                              │       │
                                              v       │
                                          executor ──> monitor
                                                        │
                                                      audit ──> END
    """
    builder = StateGraph(AgentState)

    # ─── PHASE 1: Understanding (Unified Extraction) ───
    builder.add_node("synthesizer", synthesizer_node)

    # ─── PHASE 3: Planning ───
    builder.add_node("planner", orchestrator_node)

    # ─── PHASE 4: Execution (ReAct Loop) ───
    builder.add_node("brain", brain_node)
    builder.add_node("executor", execution_node)
    builder.add_node("monitor", monitor_node)

    # ─── PHASE 5: Audit ───
    builder.add_node("audit", audit_node)

    # ═══ EDGES ═══

    # Entry: Start with unified extraction
    builder.set_entry_point("synthesizer")
    
    # Synthesizer -> Planner -> Brain
    builder.add_edge("synthesizer", "planner")
    builder.add_edge("planner", "brain")

    # ReAct Loop
    builder.add_conditional_edges(
        "brain",
        get_brain_route,
        {
            "executor": "executor",
            "audit": "audit"
        }
    )

    builder.add_edge("executor", "monitor")

    builder.add_conditional_edges(
        "monitor",
        get_monitor_route,
        {
            "executor": "executor",
            "brain": "brain"
        }
    )

    # Audit -> END
    builder.add_edge("audit", END)

    return builder.compile()

