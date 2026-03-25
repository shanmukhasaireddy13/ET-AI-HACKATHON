"""
🧠 SIDD Agent Engine — True Multi-Agent ReAct Workflow
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

# Phase 1: Understanding Agents (Pure Extractors)
from agents.task_divider import task_divider_node
from agents.scheduler import scheduler_node
from agents.bug_tracker import bug_tracker_node
from agents.followup import followup_node
from agents.summary import summary_node

# Phase 2: Aggregation
from agents.aggregator import aggregator_node

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
      ENTRY
        ├──> task_divider ──┐
        ├──> scheduler   ───┤
        ├──> bug_tracker ───┼──> aggregator ──> planner ──> brain <───┐
        ├──> followup    ───┤                                 │       │
        └──> summary     ───┘                                 v       │
                                                          executor ──> monitor
                                                                        │
                                                                      audit ──> END
    """
    builder = StateGraph(AgentState)

    # ─── PHASE 1: Understanding (Parallel Extraction) ───
    builder.add_node("task_divider", task_divider_node)
    builder.add_node("scheduler", scheduler_node)
    builder.add_node("bug_tracker", bug_tracker_node)
    builder.add_node("followup", followup_node)
    builder.add_node("summary", summary_node)

    # ─── PHASE 2: Aggregation ───
    builder.add_node("aggregator", aggregator_node)

    # ─── PHASE 3: Planning ───
    builder.add_node("planner", orchestrator_node)

    # ─── PHASE 4: Execution (ReAct Loop) ───
    builder.add_node("brain", brain_node)
    builder.add_node("executor", execution_node)
    builder.add_node("monitor", monitor_node)

    # ─── PHASE 5: Audit ───
    builder.add_node("audit", audit_node)

    # ═══ EDGES ═══

    # Entry: Fan out to all extraction agents in parallel
    builder.set_entry_point("task_divider")
    # Since LangGraph doesn't natively support parallel fan-out from entry,
    # we chain them sequentially but each is independent (no data dependencies)
    builder.add_edge("task_divider", "scheduler")
    builder.add_edge("scheduler", "bug_tracker")
    builder.add_edge("bug_tracker", "followup")
    builder.add_edge("followup", "summary")

    # All extractors converge at Aggregator
    builder.add_edge("summary", "aggregator")

    # Aggregator -> Planner -> Brain
    builder.add_edge("aggregator", "planner")
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
