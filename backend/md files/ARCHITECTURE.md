# AutoExec AI - Agent Controller Architecture

## Overview

The **Agent Controller** (also called **Orchestrator**) is the central nervous system of the multi-agent system. It manages:

- **Agent Execution Flow** - Routing between agents
- **State Management** - Unified state passed between agents
- **Memory Management** - Context and learning across agents
- **Error Recovery** - Retry logic and recovery routing
- **Audit Trail** - Every decision logged with reasoning

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  AgentOrchestrator (Controller/Router)                      │
│                                                              │
│  • Manages agent registration                               │
│  • Routes state between agents                              │
│  • Handles retries & error recovery                         │
│  • Tracks audit trail                                       │
│  • Manages agent memory                                     │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                      AgentState                              │
│  ─────────────────────────────────────────────────────────  │
│  INPUT:              PROCESSING:           OUTPUT:          │
│  • meeting_id        • workflows           • tasks          │
│  • transcript        • tasks               • execution      │
│                      • errors              • results       │
│                      • recovery            • audit_trail   │
│                                                              │
│  MEMORY:             AUDIT:                                │
│  • context           • audit_trail (complete decision      │
│  • decision_history    history with reasons)              │
│  • failed_attempts                                         │
│  • success_patterns                                        │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Multi-Agent Flow                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Classifier Agent]                                         │
│   - Input: transcript                                       │
│   - Output: workflows (detected types)                      │
│   - Audit: Classification decisions                         │
│                ↓                                            │
│  [Planner Agent]                                            │
│   - Input: workflows                                        │
│   - Output: structured tasks with dependencies              │
│   - Audit: Task decomposition reasoning                     │
│                ↓                                            │
│  [Executor Agent] ← ReAct Loop                              │
│   - Input: tasks                                            │
│   - Output: tool execution results                          │
│   - Audit: Tool calls + success/failure                    │
│                ↓                                            │
│  [Monitor Agent]                                            │
│   - Input: execution results                               │
│   - Output: status, alerts, failures                       │
│   - Audit: Monitoring decisions                            │
│                ↓                                            │
│  [Recovery Agent] ← Error handling                         │
│   - Input: errors, failed tasks                            │
│   - Output: corrective actions, reassignments              │
│   - Audit: Recovery strategies                             │
│                ↓                                            │
│  [Audit Agent]                                              │
│   - Input: all decisions                                    │
│   - Output: formatted audit trail for UI                   │
│   - Storage: Database persistence                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1️⃣ AgentState (shared state.py)

**Purpose**: Single source of truth passed between all agents.

```python
@dataclass
class AgentState:
    # INPUT
    meeting_id: str
    transcript: str
    
    # PROCESSING
    workflows: List[Workflow]  # Classifier → Planner
    tasks: List[Task]          # Planner → Executor
    
    # EXECUTION
    execution_results: Dict    # Executor results
    errors: List               # Any failures
    recovery_actions: List     # Recovery attempts
    
    # AUDIT & MEMORY
    audit_trail: List[AuditEntry]  # 🔥 EVERY DECISION LOGGED
    agent_memory: AgentMemory       # Context for agents
    
    # METADATA
    current_agent: str  # Which agent is running
    status: str         # pending, in_progress, completed
```

**Key Features**:
- ✅ Immutable record of everything
- ✅ Audit trail embedded (not afterthought)
- ✅ Memory attached (agents can store context)
- ✅ Error tracking built-in
- ✅ Easy to serialize (for DB, API)

---

### 2️⃣ BaseAgent (agent_base.py)

**Purpose**: Common interface for all agents. Ensures consistent error handling, memory management, and audit logging.

**Every subclass must implement**:
```python
async def execute(self, state: AgentState) -> AgentState:
    # Your agent logic here
    # Read state, modify state, return state
    pass
```

**Helper Methods**:
```python
# Add decision to audit trail (CRITICAL)
agent.add_audit_decision(
    state=state,
    action="Created 3 tasks",
    reason="Meeting mentions 3 deliverables",
    input_data={"transcript": "..."},
    output_data={"tasks": [...]},
)

# Store context for next agents
agent.update_memory(state, "jira_users", ["alice", "bob"])

# Log failures for recovery agent to learn
agent.log_failed_attempt(
    state=state,
    attempt_details={
        "tried": "create_jira_task",
        "error": "API timeout",
        "retry": True,
    }
)
```

---

### 3️⃣ AgentOrchestrator (orchestrator.py) - THE CONTROLLER

**Purpose**: Central router managing agent execution, state passing, error recovery, and audit.

**Key Methods**:

#### **Register Agents**
```python
orchestrator = AgentOrchestrator(max_retries=2)

# Register all agents
orchestrator.register_agent(classifier_agent)
orchestrator.register_agent(planner_agent)
orchestrator.register_agent(executor_agent)
orchestrator.register_agent(monitor_agent)
orchestrator.register_agent(recovery_agent)
```

#### **Define Agent Flow**
```python
# Linear flow
orchestrator.add_flow("classifier", "planner")
orchestrator.add_flow("planner", "executor")
orchestrator.add_flow("executor", "monitor")

# Conditional routing (error handling)
def has_errors(state):
    return len(state.errors) > 0

orchestrator.add_conditional_flow(
    from_agent="executor",
    condition=has_errors,
    to_agent="recovery",  # If errors, go to recovery instead
)

# Alternative: Continue to next if no errors
orchestrator.add_flow("executor", "monitor")
```

#### **Execute Workflow**
```python
# High-level: Process a meeting
state = orchestrator.process_meeting(
    meeting_id="meeting-123",
    transcript="Rahul will build backend by Friday...",
)

# Returns final state with:
# - workflows (what was detected)
# - tasks (what was created)
# - audit_trail (how decisions were made)
# - execution_results (what worked)
# - errors (what failed)
```

#### **Internal Flow**
```
orchestrator.process_meeting()
    ↓
create initial state (meeting_id, transcript)
    ↓
orchestrator.execute_workflow(start_agent="classifier", state)
    ↓
    Loop:
        1. Execute current agent (with 2-retry max)
        2. Agent modifies state (adds workflows, tasks, audit entries)
        3. Check conditions: is there an error? needs approval?
        4. Route to next agent
        5. Repeat until no next agents (terminal state)
    ↓
Return final state with complete audit trail
```

---

## Agent Lifecycle

### How Each Agent Works

1. **Agent Receives State**
   ```python
   state = AgentState(
       meeting_id="123",
       transcript="...",
   )
   ```

2. **Agent Executes (your logic)**
   ```python
   async def execute(self, state):
       # Read current state
       transcript = state.transcript
       
       # DO SOMETHING (classify, plan, execute, monitor, recover)
       
       # Add audit entry (🔥 CRITICAL)
       self.add_audit_decision(
           state=state,
           action="Detected 2 workflows",
           reason=f"Transcript mentions {key_phrases}",
       )
       
       # Modify state
       state.workflows = [workflow1, workflow2]
       
       # Return modified state
       return state
   ```

3. **Orchestrator Receives Modified State**
   ```python
   state = await executor.run(state)
   # State now has workflow results
   ```

4. **Orchestrator Routes to Next Agent**
   ```python
   next_agents = determine_next_agents(current_agent, state)
   for next_agent in next_agents:
       state = await executor.run(state)
   ```

5. **Audit Trail Grows**
   ```python
   # After classifier
   state.audit_trail = [
       AuditEntry(agent="classifier", action="...", reason="..."),
   ]
   
   # After planner
   state.audit_trail = [
       AuditEntry(agent="classifier", ...),
       AuditEntry(agent="planner", ...),
   ]
   
   # After executor (who retried 3 tools)
   state.audit_trail = [
       AuditEntry(agent="classifier", ...),
       AuditEntry(agent="planner", ...),
       AuditEntry(agent="executor", action="create_jira_task", ...),
       AuditEntry(agent="executor", action="send_slack_notification", ...),
       AuditEntry(agent="executor", action="schedule_calendar", ...),
   ]
   ```

---

## Error Recovery Flow

**Scenario**: Executor tries to create Jira task but API fails.

```
┌──────────────┐
│   Executor   │
│  (ReAct Loop)│ → Tries: create_jira_task()
└──────────────┘              ↓
                         ❌ TIMEOUT
                              ↓
          Retry 1: create_jira_task() → ❌ Still fails
          Retry 2: create_jira_task() → ❌ Still fails
          
          Add to state.errors:
          {
              "agent": "executor",
              "tried": "create_jira_task",
              "error": "API timeout after 2 retries",
              "timestamp": "...",
          }
          ↓
Orchestrator detects has_errors(state) = True
Conditional flow triggers: executor → recovery
          ↓
┌──────────────┐
│  Recovery    │ → Reads errors
│    Agent     │ → Finds alternative: "Jira unavailable, use Slack"
└──────────────┘ → Creates task in Slack instead
                  → Adds audit entry: "Fallback to Slack"
                  → Updates task.metadata: "slack_channel: #todos"
                  ↓
          ✅ Task created (different tool)
          Escalation NOT needed
```

---

## Audit Trail Example

After processing a meeting, the audit_trail looks like:

```json
[
  {
    "timestamp": "2024-03-18T10:00:00",
    "agent_name": "classifier",
    "decision_type": "classification",
    "action": "Detected 2 workflows",
    "reason": "Transcript mentions 'build backend by Friday' (task) and 'need approval for budget' (approval needed)",
    "input_data": {"transcript": "..."},
    "output_data": {"workflows": [{"type": "task_creation", "confidence": 0.95}]},
    "success": true
  },
  {
    "timestamp": "2024-03-18T10:00:01",
    "agent_name": "planner",
    "decision_type": "planning",
    "action": "Created 2 tasks: 'Build backend' and 'Get budget approval'",
    "reason": "Decomposed workflows into granular, assignable tasks with deadlines",
    "input_data": {"workflows": [...]},
    "output_data": {"tasks": [...]},
    "success": true
  },
  {
    "timestamp": "2024-03-18T10:00:02",
    "agent_name": "executor",
    "decision_type": "execution",
    "action": "Created Jira task PROJ-123",
    "reason": "Task 'Build backend' requires persistent tracking",
    "input_data": {"task": "Build backend"},
    "output_data": {"jira_id": "PROJ-123", "url": "..."},
    "success": true
  },
  {
    "timestamp": "2024-03-18T10:00:03",
    "agent_name": "executor",
    "decision_type": "execution",
    "action": "Sent Slack notification to @rahul",
    "reason": "Task assigned to Rahul, needs to be notified",
    "input_data": {"assignee": "rahul", "task": "Build backend"},
    "output_data": {"slack_message_ts": "1234567"},
    "success": true
  },
  {
    "timestamp": "2024-03-18T10:00:04",
    "agent_name": "executor",
    "decision_type": "execution",
    "action": "Failed to create approval task - Jira API timeout",
    "reason": "Approval needs persistent tracking like other tasks",
    "input_data": {"task": "Get ₹5L approval"},
    "output_data": null,
    "success": false,
    "error_message": "API timeout after 2 retries"
  },
  {
    "timestamp": "2024-03-18T10:00:05",
    "agent_name": "recovery",
    "decision_type": "recovery",
    "action": "Created approval task in Slack channel #approvals",
    "reason": "Jira unavailable, fallback to Slack for approval tracking",
    "input_data": {"failed_task": "Get ₹5L approval", "error": "..."},
    "output_data": {"slack_channel": "#approvals", "thread_ts": "..."},
    "success": true
  }
]
```

**This is what the Frontend Trace View shows!** 🔥 Every decision with reasoning.

---

## Memory Management

Each agent can store and retrieve context:

```python
# Executor stores context for Monitor
executor.update_memory(
    state=state,
    context_key="failed_jira_tasks",
    context_value=["task-1", "task-2"],  # For recovery to use
)

# Monitor retrieves context that Executor stored
memory = monitor.get_memory(state)
failed_tasks = memory.context.get("failed_jira_tasks", [])
```

This enables multi-turn intelligence! Agents can learn from each other.

---

## Database Persistence

After orchestration completes, the state is saved:

```python
# Convert state to database models
meeting = MeetingModel(
    id=state.meeting_id,
    transcript=state.transcript,
)

# Save workflows
for workflow in state.workflows:
    db.add(WorkflowModel(...))

# Save tasks  
for task in state.tasks:
    db.add(TaskModel(...))

# 🔥 CRITICAL: Save audit trail completely
for audit_entry in state.audit_trail:
    db.add(AuditLogModel(
        agent_name=audit_entry.agent_name,
        action=audit_entry.action,
        reason=audit_entry.reason,  # Preserved!
        ...
    ))

db.commit()
```

Every decision, every reason, every error is permanently recorded.

---

## Integration with FastAPI

```python
# main.py
from fastapi import FastAPI
from core import AgentOrchestrator

app = FastAPI()
orchestrator = AgentOrchestrator()

# Register all agents
orchestrator.register_agent(classifier)
orchestrator.register_agent(planner)
# ... etc

@app.post("/api/meetings")
async def process_meeting(request: ProcessMeetingRequest):
    # Call orchestrator
    state = await orchestrator.process_meeting(
        meeting_id=request.meeting_id,
        transcript=request.transcript,
    )
    
    # Save to database
    save_state_to_db(state)
    
    # Return to frontend
    return {
        "status": "success",
        "workflows": state.workflows,
        "tasks": state.tasks,
        "audit_trail": state.audit_trail,
    }

@app.get("/api/audit-logs")
async def get_audit_logs(meeting_id: str, agent_name: Optional[str] = None):
    # Query database
    logs = db.query(AuditLogModel).filter(...)
    return {
        "count": len(logs),
        "entries": logs,  # With reasons!
    }
```

---

## Summary

The **Agent Controller (Orchestrator)** is:

✅ **Central Router** - Routes state between agents  
✅ **State Manager** - Unified AgentState passed between agents  
✅ **Memory Manager** - Agents can store/retrieve context  
✅ **Error Handler** - Retries, recovery routing, escalation  
✅ **Audit Logger** - Every decision logged with reasoning  
✅ **Database Bridge** - Persists everything  

**Every agent reads state → modifies state → returns state**

**Every decision is logged with WHY it was made**

This creates a fully transparent, debuggable, auditable multi-agent system. 🔥

---

## Next Steps

1. ✅ Controller/Orchestrator built ← YOU ARE HERE
2. 🔨 Build Classifier Agent (understands meetings)
3. 🔨 Build Planner Agent (breaks into tasks)
4. 🔨 Build Executor Agent (runs tools)
5. 🔨 Build Monitor Agent (tracks progress)
6. 🔨 Build Recovery Agent (fixes failures)
7. 🔨 FastAPI endpoints
8. 🔨 Frontend integration
