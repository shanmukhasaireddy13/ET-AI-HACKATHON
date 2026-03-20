# Agent Controller - Quick Reference

## Project Structure

```
backend/
├── core/                          # 🔥 Agent Infrastructure
│   ├── __init__.py
│   ├── agent_state.py            # Unified state object (SharedMemory)
│   ├── agent_base.py             # Base class for all agents
│   └── orchestrator.py           # Central Controller/Router
│
├── agents/                        # Agent implementations (to build)
│   ├── __init__.py
│   ├── classifier.py             # Detects workflows
│   ├── planner.py                # Decomposes into tasks
│   ├── executor.py               # Executes tools
│   ├── monitor.py                # Tracks progress
│   └── recovery.py               # Fixes failures
│
├── tools/                         # Tool implementations
│   ├── jira_tools.py
│   ├── slack_tools.py
│   └── calendar_tools.py
│
├── models.py                      # SQLAlchemy DB models
├── schemas.py                     # Pydantic API schemas
├── database.py                    # DB connection & session
├── main.py                        # FastAPI app (to build)
├── ARCHITECTURE.md                # Detailed architecture docs
└── requirements.txt               # Dependencies
```

## Core Components Built

### 1. AgentState (agent_state.py)
- **Unified state object** passed between all agents
- Contains: transcript, workflows, tasks, errors, audit_trail, memory
- **CRITICAL**: Audit trail embedded in every state

### 2. BaseAgent (agent_base.py) 
- **Abstract base class** for all agents
- Provides: error handling, audit logging, memory management
- Methods: `execute()`, `add_audit_decision()`, `get_memory()`, `update_memory()`

### 3. AgentOrchestrator (orchestrator.py) 🔥 **THE CONTROLLER**
- **Central router** managing agent execution
- Manages: agent registration, routing, state passing, retries, error recovery
- Methods: `register_agent()`, `add_flow()`, `add_conditional_flow()`, `process_meeting()`

### 4. Database Models (models.py)
- MeetingModel, WorkflowModel, TaskModel, AuditLogModel, ApprovalModel
- Every decision persisted with reasoning

### 5. API Schemas (schemas.py)
- Request/response models for FastAPI
- Serialization of state, tasks, audit trails

---

## How It Works (Flow Diagram)

```
User API Call: POST /api/meetings
    ↓
{"meeting_id": "123", "transcript": "..."}
    ↓
orchestrator.process_meeting()
    ↓
Create AgentState(meeting_id="123", transcript="...")
    ↓
Execute Workflow:
    ┌─────────────────┐
    │   Classifier    │ ← Reads transcript
    │    (Agent 1)    │   Outputs: workflows
    └────────┬────────┘   Audit: Classification decisions
             ↓
    ┌─────────────────┐
    │    Planner      │ ← Reads workflows
    │    (Agent 2)    │   Outputs: tasks with dependencies
    └────────┬────────┘   Audit: Planning decisions
             ↓
    ┌─────────────────┐
    │    Executor     │ ← Reads tasks
    │    (Agent 3)    │   Outputs: tool execution results
    └────────┬────────┘   Audit: Tool calls + results
             ↓
    ┌─────────────────┐
    │    Monitor      │ ← Reads execution results
    │    (Agent 4)    │   Outputs: status, alerts
    └────────┬────────┘   Audit: Monitoring decisions
             ├─→ If errors: Go to Recovery
             │
             └─→ If success: Done
    ┌─────────────────┐
    │    Recovery     │ ← Reads errors
    │    (Agent 5)    │   Outputs: corrective actions
    └────────┬────────┘   Audit: Recovery strategies
             ↓
    ┌─────────────────┐
    │     Audit       │ ← Formats audit trail
    │    (Agent 6)    │   For database & frontend
    └─────────────────┘
             ↓
Return Final State:
{
  "workflows": [...],
  "tasks": [...],
  "audit_trail": [  ← 🔥 COMPLETE DECISION HISTORY
    {
      "agent": "classifier",
      "action": "...",
      "reason": "..."  ← WHY (THIS IS KEY)
    },
    ...
  ]
}
```

## Key Features

✅ **Unified State**: Single AgentState object passed between all agents  
✅ **Explicit Audit**: Every decision logged with WHY (reason field)  
✅ **Memory System**: Agents can store context for other agents to use  
✅ **Error Recovery**: Conditional routing (if error → recovery)  
✅ **Retry Logic**: Built-in 2-retry max before escalation  
✅ **Database Persistence**: Complete audit trail saved  
✅ **Type Safety**: Pydantic + SQLAlchemy models  

## Next: Building the First Agent

The **Classifier Agent** will:
1. Read state.transcript
2. Detect workflow types
3. Add to state.workflows
4. Log audit decision with reason
5. Return modified state

Then orchestrator routes to Planner Agent, etc.

---

## How to Use the Controller

```python
from core import AgentOrchestrator, BaseAgent
from agents import ClassifierAgent, PlannerAgent, ExecutorAgent

# 1. Create orchestrator
orchestrator = AgentOrchestrator(max_retries=2)

# 2. Create agents
classifier = ClassifierAgent(llm_client=gemini_client)
planner = PlannerAgent(llm_client=gemini_client)
executor = ExecutorAgent(llm_client=gemini_client)

# 3. Register all agents
orchestrator.register_agents_batch([classifier, planner, executor])

# 4. Define flow
orchestrator.add_flow("classifier", "planner")
orchestrator.add_flow("planner", "executor")

# Optional: Error recovery flow
def has_errors(state):
    return len(state.errors) > 0

orchestrator.add_conditional_flow(
    "executor",
    has_errors,
    "recovery"
)

# 5. Process meeting
state = await orchestrator.process_meeting(
    meeting_id="meeting-1",
    transcript="Rahul will build backend by Friday..."
)

# 6. Access results
print(f"Workflows: {state.workflows}")
print(f"Tasks: {state.tasks}")
print(f"Audit trail: {state.audit_trail}")

# 7. Save to database
save_to_db(state)
```

The **Orchestrator is now ready to orchestrate agents!** ✅
