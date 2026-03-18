"""
🧠 LangGraph Orchestrator — TRULY DYNAMIC WORKFLOW
====================================================
The workflow is NOT pre-defined. The Orchestrator LLM analyzes the input
and builds a dynamic_plan. The Dispatcher loops through the plan, routing
to each agent. Agents can ADD more agents to the plan at runtime.

FLOW:
  Input → Orchestrator (builds dynamic plan)
            ↓
        Dispatcher ←──────────────────────────────┐
            ↓                                     │
     [Dynamic Agent] ─────────────────────────────┘
     (agent advances index, may add more agents)
            
     When plan is exhausted:
        Dispatcher → Executor ←───────────────┐
                         ↓                    │
                     Monitor ─(more steps)────┘
                         │
                         ├─(failure)─→ Recovery → Audit → END
                         │
                         └─(all done)─→ Audit → END
"""

from langgraph.graph import StateGraph, END
from state import AgentState

from agents.orchestrator import orchestrator_node
from agents.dispatcher import dispatcher_node, get_next_route
from agents.task_divider import task_divider_node
from agents.scheduler import scheduler_node
from agents.bug_tracker import bug_tracker_node
from agents.followup import followup_node
from agents.summary import summary_node
from agents.executor import execution_node
from agents.monitor import monitor_node, get_monitor_route
from agents.recovery import recovery_node
from agents.audit import audit_node


def build_graph():
    """Builds the fully dynamic LangGraph workflow."""
    
    builder = StateGraph(AgentState)
    
    # ═══ REGISTER ALL NODES ═══
    builder.add_node("orchestrator",  orchestrator_node)
    builder.add_node("dispatcher",    dispatcher_node)
    builder.add_node("task_divider",  task_divider_node)
    builder.add_node("scheduler",     scheduler_node)
    builder.add_node("bug_tracker",   bug_tracker_node)
    builder.add_node("followup",      followup_node)
    builder.add_node("summary",       summary_node)
    builder.add_node("executor",      execution_node)
    builder.add_node("monitor",       monitor_node)
    builder.add_node("recovery",      recovery_node)
    builder.add_node("audit",         audit_node)
    
    # ═══ ENTRY POINT ═══
    builder.set_entry_point("orchestrator")
    
    # ═══ Orchestrator → Dispatcher (always) ═══
    builder.add_edge("orchestrator", "dispatcher")
    
    # ═══ Dispatcher → Dynamic routing (reads plan) ═══
    builder.add_conditional_edges(
        "dispatcher",
        get_next_route,
        {
            "task_divider": "task_divider",
            "scheduler":    "scheduler",
            "bug_tracker":  "bug_tracker",
            "followup":     "followup",
            "summary":      "summary",
            "executor":     "executor",
            "audit":        "audit",
        }
    )
    
    # ═══ Every specialized agent → back to Dispatcher ═══
    # This creates the dynamic loop: agent finishes → dispatcher checks
    # if more agents in plan → routes to next one
    for agent in ["task_divider", "scheduler", "bug_tracker", "followup", "summary"]:
        builder.add_edge(agent, "dispatcher")
    
    # ═══ Execution Pipeline ═══
    builder.add_edge("executor", "monitor")
    
    builder.add_conditional_edges(
        "monitor",
        get_monitor_route,
        {
            "executor": "executor",
            "recovery": "recovery",
            "audit":    "audit",
        }
    )
    
    builder.add_edge("recovery", "audit")
    
    # ═══ TERMINAL ═══
    builder.add_edge("audit", END)
    
    return builder.compile()
