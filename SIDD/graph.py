"""
🧠 LangGraph Orchestrator — TRULY DYNAMIC WORKFLOW
====================================================
The workflow is NOT pre-defined. The Orchestrator LLM analyzes the input
and builds dynamic_steps. The Dispatcher loops through the plan, routing
to the dynamic_agent which executes auto-prompts.

FLOW:
  Input → Orchestrator (builds dynamic step sequence)
            ↓
        Dispatcher ←──────────────────────────────┐
            ↓                                     │
     [Dynamic Agent] ─────────────────────────────┘
     (executes auto-prompt, generates JSON outputs)
            
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
from agents.dynamic_agent import dynamic_agent_node
from agents.executor import execution_node
from agents.monitor import monitor_node, get_monitor_route
from agents.recovery import recovery_node, get_recovery_route
from agents.audit import audit_node


def build_graph():
    """Builds the fully dynamic LangGraph workflow."""
    
    builder = StateGraph(AgentState)
    
    # ═══ REGISTER ALL NODES ═══
    builder.add_node("orchestrator",  orchestrator_node)
    builder.add_node("dispatcher",    dispatcher_node)
    builder.add_node("dynamic_agent", dynamic_agent_node)
    builder.add_node("executor",      execution_node)
    builder.add_node("monitor",       monitor_node)
    builder.add_node("recovery",      recovery_node)
    builder.add_node("audit",         audit_node)
    
    # ═══ ENTRY POINT ═══
    builder.set_entry_point("orchestrator")
    
    # ═══ Orchestrator → Dispatcher (always) ═══
    builder.add_edge("orchestrator", "dispatcher")
    
    # ═══ Dispatcher → Dynamic routing (reads dynamic_steps) ═══
    builder.add_conditional_edges(
        "dispatcher",
        get_next_route,
        {
            "dynamic_agent": "dynamic_agent",
            "executor":      "executor",
            "audit":         "audit",
        }
    )
    
    # ═══ Dynamic Agent → back to Dispatcher ═══
    # This creates the dynamic loop: agent finishes → dispatcher checks
    # if more steps in plan → routes to next one
    builder.add_edge("dynamic_agent", "dispatcher")
    
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
    
    builder.add_conditional_edges(
        "recovery",
        get_recovery_route,
        {
            "executor": "executor",
            "audit":    "audit",
        }
    )
    
    # ═══ TERMINAL ═══
    builder.add_edge("audit", END)
    
    return builder.compile()
