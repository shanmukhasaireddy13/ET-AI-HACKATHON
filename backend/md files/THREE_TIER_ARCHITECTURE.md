# 3-Tier Architecture: Frontend → Express → Python AI Engine

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND TIER (Next.js)                          │
│                    - React UI Components                            │
│                    - Dashboard & Trace View                         │
│                    - Approval Screen                                │
│                    Port: 3000                                       │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP/JSON
                    ┌─────────────▼────────────┐
                    │   EXPRESS GATEWAY        │
                    │   (Node.js Middleware)   │
                    │   Port: 3001             │
                    │                          │
                    │ • Route requests         │
                    │ • Handle CORS            │
                    │ • Request tracing        │
                    │ • Response formatting    │
                    │ • Error handling         │
                    └─────────────┬────────────┘
                                  │ HTTP/JSON
┌─────────────────────────────────▼───────────────────────────────────┐
│               PYTHON AI ENGINE (FastAPI)                            │
│               Port: 8000                                            │
├─────────────────────────────────────────────────────────────────────┤
│                   AgentOrchestrator (Controller)                    │
│                                                                     │
│  • Manages agent execution flow                                    │
│  • Routes state between agents                                     │
│  • Handles error recovery                                          │
│  • Maintains audit trail                                           │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Agent Implementations                         │   │
│  │                                                            │   │
│  │  [Classifier] → [Planner] → [Executor] → [Monitor]        │   │
│  │                                             ↓              │   │
│  │                                         [Recovery]         │   │
│  │                                                            │   │
│  │  Each agent:                                               │   │
│  │  • Reads AgentState                                        │   │
│  │  • Performs work (LLM reasoning, tool execution)           │   │
│  │  • Logs decisions with REASONING (audit trail)             │   │
│  │  • Modifies state                                          │   │
│  │  • Returns state to orchestrator                           │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Shared Agent State (In-Memory)                │   │
│  │                                                            │   │
│  │  AgentState {                                             │   │
│  │    meeting_id, transcript,      (INPUT)                  │   │
│  │    workflows, tasks,             (PROCESSING)             │   │
│  │    execution_results, errors,   (OUTPUT)                 │   │
│  │    audit_trail,                  (🔥 DECISIONS LOGGED)     │   │
│  │    agent_memory,                 (CONTEXT FOR AGENTS)      │   │
│  │  }                                                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              FastAPI HTTP Endpoints                        │   │
│  │                                                            │   │
│  │  POST   /api/meetings/process     → Process transcript    │   │
│  │  GET    /api/audit-logs/:meeting  → Get decision trail    │   │
│  │  GET    /api/tasks/:meeting       → Get tasks             │   │
│  │  PATCH  /api/tasks/:id            → Update task           │   │
│  │  GET    /api/approvals            → Get approvals         │   │
│  │  POST   /api/approvals/:id/decide → Submit decision       │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ SQL
                    ┌─────────────▼────────────┐
                    │   DATABASE TIER          │
                    │   (SQLite/PostgreSQL)    │
                    │                          │
                    │  Tables:                 │
                    │  • meetings              │
                    │  • workflows             │
                    │  • tasks                 │
                    │  • audit_logs            │
                    │  • approvals             │
                    └──────────────────────────┘
```

---

## Data Flow: From Meeting to Execution

### Example: Processing a Meeting

**Input (from Frontend)**:
```json
{
  "meeting_id": "meeting-123",
  "transcript": "Rahul will build the API by Friday. Need ₹5L approval. Schedule demo with client Monday."
}
```

**Flow**:

1. **Frontend Sends Request**
   ```
   Frontend (Next.js) 
     POST /api/meetings 
     → {"meeting_id": "meeting-123", "transcript": "..."}
   ```

2. **Express Gateway Receives & Routes**
   ```javascript
   // server.js (Express)
   app.post('/api/meetings', async (req, res) => {
     // Generate request ID for tracing
     const requestId = uuid.v4();
     
     // Call Python backend
     axios.post('http://localhost:8000/api/meetings/process', {
       meeting_id: req.body.meeting_id,
       transcript: req.body.transcript
     }, {
       headers: {'X-Request-ID': requestId}  // For request tracing
     })
   })
   ```

3. **Python AI Engine Processes**
   ```python
   # main.py (FastAPI)
   @app.post("/api/meetings/process")
   async def process_meeting(request: ProcessMeetingRequest):
       # Call orchestrator
       state = await orchestrator.process_meeting(
           meeting_id=request.meeting_id,
           transcript=request.transcript,
       )
   ```

4. **Orchestrator Executes Agents**
   ```python
   # core/orchestrator.py
   state = AgentState(meeting_id="meeting-123", transcript="...")
   
   # Classifier Agent
   state = await classifier.execute(state)
   # → Detects workflows: task_creation, approval_needed, scheduling
   # → Logs: "Detected 3 workflows" + reasoning
   
   # Planner Agent (next)
   state = await planner.execute(state)
   # → Decomposes into 3 tasks
   # → Logs decision
   
   # Executor Agent
   state = await executor.execute(state)
   # → Creates Jira task, sends Slack notification
   # → Logs each tool call
   
   # Monitor Agent
   state = await monitor.execute(state)
   # → Checks all results successful
   # → Logs: "All tasks executed successfully"
   ```

5. **Database Persistence**
   ```python
   # Save to database
   db.add(MeetingModel(...))
   db.add(WorkflowModel(...)) # 3 rows
   db.add(TaskModel(...))      # 3 rows
   db.add(AuditLogModel(...))  # Multiple rows: "Detected workflows", "Created tasks", "Executed tools"
   db.commit()
   ```

6. **Response Returns to Frontend**
   ```json
   {
     "success": true,
     "meeting_id": "meeting-123",
     "workflows": {
       "count": 3,
       "items": [
         {"type": "task_creation", "confidence": 0.95},
         {"type": "approval_needed", "confidence": 0.88},
         {"type": "scheduling", "confidence": 0.92}
       ]
     },
     "tasks": {
       "count": 3,
       "items": [
         {"title": "Build API", "assigned_to": "rahul", "status": "pending"},
         ...
       ]
     },
     "audit_trail": {
       "count": 5,
       "entries": [
         {
           "agent_name": "classifier",
           "action": "Detected 3 workflows",
           "reason": "Transcript mentions task, approval, and scheduling",
           "input_data": {"transcript": "..."},
           "output_data": {"workflows": [...]}
         },
         {
           "agent_name": "planner",
           "action": "Created 3 tasks",
           "reason": "Decomposed workflows into assignable units",
           ...
         },
         ...
       ]
     }
   }
   ```

7. **Frontend Displays Results**
   - Dashboard shows 3 tasks
   - Trace View displays audit trail with decision reasoning
   - Approval screen shows pending approvals

---

## Why 3-Tier Architecture?

### ✅ Benefits

1. **Separation of Concerns**
   - Frontend: User interface (React/Next.js)
   - Gateway: HTTP routing & middleware (Express)
   - Engine: AI logic & orchestration (Python/FastAPI)
   - Database: Persistence (SQLite/PostgreSQL)

2. **Scalability**
   - Frontend can be deployed to CDN/Vercel
   - Express gateway can run on Node.js clusters
   - Python engine can be scaled independently
   - Database can be optimized separately

3. **Technology Flexibility**
   - Frontend: Any JS framework (React, Vue, Svelte)
   - Gateway: Express, Fastify, or any Node.js framework
   - Engine: Python with FastAPI, can switch to Django/Flask
   - Database: SQLite (dev) → PostgreSQL (prod)

4. **Security & Control**
   - Express acts as API gateway
   - Can implement authentication, rate limiting
   - Python backend is internal only
   - Database is isolated

5. **Debugging & Monitoring**
   - Each layer can be tested independently
   - Request ID tracing across layers
   - Separate logging for each tier
   - Easy to debug issues

---

## Setup & Running

### 1. Frontend (Next.js) - Port 3000

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### 2. Express Gateway - Port 3001

```bash
cd server
npm install
npm run dev
# http://localhost:3001
# Calls: http://localhost:8000 (Python backend)
```

### 3. Python AI Engine - Port 8000

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
# http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Request Flow Example

```bash
# Frontend sends to Express
curl -X POST http://localhost:3001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "m-123",
    "transcript": "Build backend by Friday"
  }'

# Express forwards to Python
# EXPRESS (Port 3001) → PYTHON (Port 8000)

# Python processes with orchestrator
# 1. Classifier detects: task_creation
# 2. Planner creates task
# 3. Executor runs tools
# 4. Monitor checks results

# Response returned to Express
# Express returns to Frontend

# Frontend displays:
# - Dashboard with tasks
# - Trace View with audit trail
```

---

## Key Design Decisions

### 1. Express Middleware (Not direct Next.js → Python)

**Why not direct?**
```
❌ Frontend calls Python backend directly
   - CORS issues
   - No request tracing
   - No centralized logging
   - Can't modify requests/responses
```

**Better approach:**
```
✅ Frontend → Express → Python
   - Express handles CORS
   - Request ID for tracing
   - Consistent response format
   - Easy to add middleware (auth, rate limiting, etc)
```

### 2. AgentState as Unified State

**Why not separate databases per agent?**
```
❌ Each agent has its own state
   - Data duplication
   - Complex synchronization
   - Error-prone
```

**Better approach:**
```
✅ Single AgentState object
   - Passed between agents
   - Incrementally modified
   - Complete history preserved
   - Easy to debug
```

### 3. Audit Trail in Every Agent

**Why not add auditing later?**
```
❌ Audit as an afterthought
   - Missing early decisions
   - Incomplete trace
   - Hard to add retroactively
```

**Better approach:**
```
✅ Every agent logs decisions with REASONING
   - Complete decision history
   - Explainable AI
   - Preserved in database
   - Can be shown to users
```

### 4. Dynamic LLM-Based Agents (NOT Rule-Based)

**Why not hard-coded rules?**
```
❌ Rule-based (if/else)
   - Can't handle variations
   - Must modify code for new patterns
   - Britttle and fragile
```

**Better approach:**
```
✅ LLM-based with system prompts
   - Handles any meeting content
   - Dynamic reasoning
   - Explains decisions
   - Easy to modify behavior
```

---

## Classifier Agent: How It Works

The Classifier is **NOT rule-based**. It uses LLM reasoning:

```python
# NOT THIS (rule-based):
if "build" in transcript:
    workflows.append("task_creation")
if "approval" in transcript:
    workflows.append("approval_needed")

# BUT THIS (dynamic LLM):
system_prompt = """
You are an expert analyzing meetings.
Identify these workflow types:
1. task_creation - "Build API by Friday"
2. approval_needed - "Need budget approval"
3. scheduling - "Schedule meeting Tuesday"
4. issue_resolution - "Fix the crash"
"""

response = llm.generate_content(system_prompt + transcript)
workflows = parse_response(response)
```

**Why?**
- Understands context, not just keywords
- Handles variations in language
- Can explain its reasoning
- Works with any meeting content

---

## Complete Tech Stack

| Layer | Technology | Port | Purpose |
|-------|-----------|------|---------|
| **Frontend** | Next.js, React | 3000 | UI, Dashboard, Trace View |
| **Gateway** | Express.js | 3001 | HTTP routing, middleware |
| **Engine** | FastAPI, Python | 8000 | Orchestrator, agents, AI logic |
| **Agents** | LangGraph, Gemini/Groq | - | Dynamic LLM-based reasoning |
| **Database** | SQLite/PostgreSQL | - | Persistence, audit trail |

---

## Next Steps

1. ✅ **Architecture set up** (3-tier system ready)
2. ✅ **Classifier Agent built** (working, dynamic, fully implemented)
3. ✅ **Express Gateway** (HTTP routing ready)
4. ✅ **FastAPI Engine** (endpoints ready)
5. 🔨 **Build Planner Agent** (decompose tasks)
6. 🔨 **Build Executor Agent** (run tools)
7. 🔨 **Build Monitor Agent** (check results)
8. 🔨 **Build Recovery Agent** (error handling)
9. 🔨 **Connect Front-end** (display results)

---

## Testing the Setup

### Test Classifier Agent Directly

```bash
cd backend
python -c "
import asyncio
from agents.classifier import ClassifierAgent, MockClassifierLLM
from core import AgentState

async def test():
    classifier = ClassifierAgent(llm_client=MockClassifierLLM())
    state = AgentState(
        meeting_id='test-1',
        transcript='Build API by Friday. Need approval. Schedule demo.'
    )
    state = await classifier.execute(state)
    print(f'Workflows: {len(state.workflows)}')
    print(f'Audit entries: {len(state.audit_trail)}')

asyncio.run(test())
"
```

### Test Full Pipeline

```bash
# Terminal 1: Start Python Engine
cd backend
python -m uvicorn main:app --reload

# Terminal 2: Start Express Gateway
cd server
npm run dev

# Terminal 3: Test API
curl -X POST http://localhost:3001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_id": "test-123",
    "transcript": "Build the auth system by EOW. Need CFO approval for 5L. Demo Monday."
  }'
```

---

## Summary

You now have:
- ✅ **Express Gateway** (Node.js, port 3001)
- ✅ **FastAPI Engine** (Python, port 8000)
- ✅ **Fully implemented Classifier Agent** (dynamic, LLM-based, audit logging)
- ✅ **Agent Orchestrator** (routes agents, passes state, logs decisions)
- ✅ **Database persistence** (complete audit trail)
- ✅ **All endpoints** (ready for frontend integration)

Everything is **dynamic and LLM-powered**, NOT rule-based. 🚀
