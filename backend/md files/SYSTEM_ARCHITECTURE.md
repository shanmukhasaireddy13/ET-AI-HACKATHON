# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AutoExec AI - System Architecture                    │
│                         (Agent Controller Framework)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              API Layer (FastAPI)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ POST /api/meetings                                                   │   │
│  │   Input: {meeting_id, transcript}                                   │   │
│  │   Output: {workflows, tasks, audit_trail}                           │   │
│  │                                                                      │   │
│  │ GET /api/audit-logs?meeting_id=X&agent_name=Y                      │   │
│  │ GET /api/tasks/{meeting_id}                                         │   │
│  │ POST /api/approvals/{task_id}/decision                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                      AgentOrchestrator (Controller) 🔥                       │
│                                                                              │
│  core/orchestrator.py                                                       │
│                                                                              │
│  • Registers agents                                                         │
│  • Defines agent flows: classifier → planner → executor → monitor           │
│  • Routes state between agents                                              │
│  • Handles error recovery routing                                           │
│  • Manages retries (max 2 before escalation)                               │
│  • Tracks audit trail                                                       │
│                                                                              │
│  Methods:                                                                    │
│    - process_meeting(meeting_id, transcript)                               │
│    - execute_workflow(start_agent, state)                                  │
│    - add_flow(from_agent, to_agent)                                        │
│    - add_conditional_flow(agent, condition, next_agent)                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Shared State (AgentState)                             │
│                                                                              │
│  core/agent_state.py                                                        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ INPUT          PROCESSING        OUTPUT         AUDIT 🔥      │         │
│  │──────────────────────────────────────────────────────────────  │         │
│  │ • transcript   • workflows       • tasks        audit_trail[]  │         │
│  │ • meeting_id   • tasks           • results      [entry1,      │         │
│  │                • errors          • escalations  entry2, ...]  │         │
│  │                • recovery        • approvals                   │         │
│  │                                                                 │         │
│  │ MEMORY                            METADATA                     │         │
│  │──────────────────────────────────────────────────────────────  │         │
│  │ agent_memory {                    • current_agent              │         │
│  │   context: {...},                 • status                     │         │
│  │   decision_history: [...],        • created_at                │         │
│  │   failed_attempts: [...],         • updated_at                │         │
│  │   success_patterns: [...]                                      │         │
│  │ }                                                               │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                              │
│  🔑 Key Feature: EVERY agent reads state → modifies state → returns state  │
│  🔥 AUDIT TRAIL: Built-in, not afterthought                                │
│  💾 MEMORY: Agents can store context for other agents                       │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Agent Executors (To Build)                          │
│                                                                              │
│  Each agent inherits from BaseAgent (core/agent_base.py)                   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Classifier  │→ │   Planner    │→ │  Executor    │→ │   Monitor    │   │
│  │              │  │              │  │              │  │              │   │
│  │ • Read:      │  │ • Read:      │  │ • Read:      │  │ • Read:      │   │
│  │   transcript │  │   workflows  │  │   tasks      │  │   results    │   │
│  │              │  │              │  │              │  │              │   │
│  │ • Output:    │  │ • Output:    │  │ • Output:    │  │ • Output:    │   │
│  │   workflows  │  │   tasks      │  │   executed   │  │   status     │   │
│  │              │  │   (decomposed)  │   results    │  │              │   │
│  │ • Audit:     │  │              │  │              │  │ • Audit:     │   │
│  │   "Detected  │  │ • Audit:     │  │ • Audit:     │  │   "Verified" │   │
│  │    intent"   │  │   "Broke into" │ "Executed"   │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│                             ↓                                               │
│                      ┌──────────────┐                                       │
│                      │   Recovery   │ ← If Monitor detects errors          │
│                      │   (Fallback) │                                       │
│                      │              │                                       │
│                      │ • Read:      │                                       │
│                      │   errors     │                                       │
│                      │              │                                       │
│                      │ • Output:    │                                       │
│                      │   alternatives                                       │
│                      │              │                                       │
│                      │ • Audit:     │                                       │
│                      │   "Fallback" │                                       │
│                      └──────────────┘                                       │
│                                                                              │
│  ✅ Each agent guaranteed:                                                  │
│     • Error handling (no crashes)                                           │
│     • Audit logging (action + REASON)                                       │
│     • Memory access (can store/retrieve context)                            │
│     • Retry support (orchestrator retries failed agents)                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Database Layer (Persistence)                            │
│                                                                              │
│  models.py (SQLAlchemy)                                                     │
│                                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐   │
│  │  Meetings   │  │  Workflows   │  │   Tasks    │  │  AuditLogs 🔥   │   │
│  │─────────────│  │──────────────│  │────────────│  │─────────────────│   │
│  │ • id        │  │ • id         │  │ • id       │  │ • agent_name    │   │
│  │ • transcript│  │ • type       │  │ • title    │  │ • action        │   │
│  │ • created_at│  │ • confidence │  │ • assigned │  │ • reason 🔥     │   │
│  │             │  │ • meeting_id │  │ • status   │  │ • input_data    │   │
│  │ [1:N]       │  │ [1:N]        │  │ • due_date │  │ • output_data   │   │
│  │ Relations→  │  │ Relations→   │  │ • meeting_ │  │ • success       │   │
│  │ Workflows   │  │ Tasks        │  │   id       │  │ • timestamp     │   │
│  │ Tasks       │  │              │  │ • workflow │  │ [1:N] Relations │   │
│  │ AuditLogs   │  │              │  │   _id      │  │ → Meetings      │   │
│  │ Approvals   │  │              │  │ [1:N]      │  │                 │   │
│  └─────────────┘  └──────────────┘  │ Relations→ │  └─────────────────┘   │
│                                      │ Approvals  │                        │
│  ┌────────────────────┐              └────────────┘   ✅ Complete Audit    │
│  │    Approvals       │                              Trail Persisted        │
│  │────────────────────│              🔥 KEY FEATURE   Every Decision        │
│  │ • task_id          │                              With Reasoning        │
│  │ • status (pending, │                                                    │
│  │   approved,        │   Each agent writes its                           │
│  │   rejected)        │   decisions to audit_logs                         │
│  │ • approved_by      │   with:                                           │
│  │ • feedback         │   - action (what)                                 │
│  │ [1:1] Relations→   │   - reason (WHY) ← Most important!               │
│  │ Tasks              │   - input/output data                             │
│  └────────────────────┘   - timestamp                                     │
│                                                                              │
│  database.py - Connection & Session Management                              │
│  schemas.py - FastAPI Serialization Models                                  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Frontend Trace View (To Build)                            │
│                                                                              │
│  agent-trace-timeline.tsx                                                   │
│                                                                              │
│  Displays audit_trail to users:                                             │
│                                                                              │
│  Timeline:                                                                   │
│    [Classifier] Detected 3 workflows                                        │
│       └─ Reason: "Transcript mentions task, approval, and scheduling"      │
│       └─ Inputs: {transcript: "..."}                                        │
│       └─ Outputs: {workflows: []}                                           │
│                                                                              │
│    [Planner] Created 3 tasks with dependencies                              │
│       └─ Reason: "Decomposed workflows into assignable units"              │
│       └─ Inputs: {workflows: [...]}                                         │
│       └─ Outputs: {tasks: []}                                               │
│                                                                              │
│    [Executor] Created Jira task PROJ-123                                    │
│       └─ Reason: "Task requires persistent tracking"                        │
│       └─ Tool: jira_create_task                                             │
│       └─ Result: {jira_id: "PROJ-123"}                                      │
│                                                                              │
│    [Executor] Failed to schedule calendar                                   │
│       └─ Reason: "Calendar API timeout"                                     │
│       └─ Error: "Connection timeout after 2 retries"                        │
│                                                                              │
│    [Recovery] Created Slack reminder                                        │
│       └─ Reason: "Calendar failed, fallback to Slack"                       │
│       └─ Result: {channel: "#todo", message_ts: "..."}                      │
│                                                                              │
│  🔥 This is what makes the system EXPLAINABLE and TRUSTWORTHY!             │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

```
User Input:
{
  "meeting_id": "m-123",
  "transcript": "Rahul will build backend by Friday. Need ₹5L approval."
}
    ↓
Orchestrator receives
    ↓
Create AgentState:
{
  meeting_id: "m-123",
  transcript: "...",
  workflows: [],
  tasks: [],
  audit_trail: [],
}
    ↓
Execute workflow (starting from classifier):
    
    1. Run Classifier:
       ├─ Reads: state.transcript
       ├─ Processes: LLM detects intent
       └─ Outputs: 
          - state.workflows = [{type: "task_creation"}, {type: "approval_needed"}]
          - state.audit_trail.append({
              agent: "classifier",
              action: "Detected 2 workflows",
              reason: "Transcript mentions deliverable and budget approval"
            })
    
    2. Orchestrator routes: classifier → planner
    
    3. Run Planner:
       ├─ Reads: state.workflows
       ├─ Processes: Decomposes into granular tasks
       └─ Outputs:
          - state.tasks = [{title: "Build backend", assigned_to: "rahul"}, ...]
          - state.audit_trail.append({
              agent: "planner",
              action: "Created 2 tasks",
              reason: "Decomposed into assignable units with owners"
            })
    
    4. Orchestrator routes: planner → executor
    
    5. Run Executor:
       ├─ Reads: state.tasks
       ├─ Processes: Creates Jira task, sends Slack notification
       └─ Outputs:
          - state.execution_results = {jira_id: "PROJ-123", ...}
          - state.audit_trail.append({
              agent: "executor",
              action: "Created Jira task PROJ-123",
              reason: "Task requires persistent tracking"
            })
    
    6. Orchestrator routes: executor → monitor
    
    7. Run Monitor:
       ├─ Reads: state.execution_results
       └─ Outputs:
          - state.audit_trail.append({
              agent: "monitor",
              action: "All tasks executed successfully",
              reason: "No errors detected"
            })
    
    8. No errors, no next agent → DONE
    ↓
Return Final State:
{
  meeting_id: "m-123",
  workflows: [2 workflows],
  tasks: [2 tasks],
  execution_results: {jira_id: "PROJ-123", ...},
  audit_trail: [
    {agent: "classifier", action: "...", reason: "..."},
    {agent: "planner", action: "...", reason: "..."},
    {agent: "executor", action: "...", reason: "..."},
    {agent: "monitor", action: "...", reason: "..."},
  ]
}
    ↓
Save to database:
- meetings_table ← meeting_id, transcript
- workflows_table ← (2 rows)
- tasks_table ← (2 rows)
- audit_logs_table ← (4 rows with reasons!)
    ↓
Frontend displays:
[Timeline of audit trail with expandable decision details]
```

---

## Summary

The **Agent Controller Framework** provides:

✅ **Unified State**: Single AgentState object  
✅ **Explicit Routing**: Define agent flows programmatically  
✅ **Error Resilience**: Automatic retries + recovery routing  
✅ **Audit Trail**: Complete decision history with REASONS  
✅ **Memory System**: Agents can share context  
✅ **Database Ready**: Full persistence schema  
✅ **Type Safe**: Pydantic + SQLAlchemy  

All agents follow the same pattern:
1. Read state
2. Do work
3. Log audit entry (with reason!)
4. Modify state
5. Return state

The orchestrator handles everything else. 🚀
