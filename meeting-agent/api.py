from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Meeting Intelligence Agent API")

class Message(BaseModel):
    role: str
    content: str
    id: str | None = None
    
class ChatRequest(BaseModel):
    messages: list[Message]

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "meeting-agent"}

@app.get("/api/audit-logs/{meeting_id}")
def get_audit_logs(meeting_id: str):
    # Retrieve or generate mock audit logs for the given meeting
    return {
        "meetingId": meeting_id,
        "logs": [
            {"timestamp": "2026-03-20T10:00:00Z", "action": "Meeting Started", "user": "System"},
            {"timestamp": "2026-03-20T10:05:00Z", "action": "Transcription Started", "user": "System"},
            {"timestamp": "2026-03-20T10:45:00Z", "action": "Meeting Ended", "user": "System"}
        ]
    }

@app.get("/api/tasks/{meeting_id}")
def get_tasks(meeting_id: str):
    # Retrieve or generate tasks for the given meeting
    return {
        "meetingId": meeting_id,
        "tasks": [
            {
                "task_id": 1,
                "title": "Send follow-up email",
                "assignee": "User",
                "status": "pending",
                "priority": "high",
                "dueDate": "2026-03-22"
            }
        ]
    }

@app.get("/api/workflows/{meeting_id}")
def get_workflows(meeting_id: str):
    # Retrieve workflows for the given meeting
    return {
        "meetingId": meeting_id,
        "workflows": [
            {
                "workflow_id": "wf-123",
                "name": "Meeting Follow-up Automation",
                "status": "completed",
                "executedAt": "2026-03-20T11:00:00Z"
            }
        ]
    }

@app.get("/api/reasoning/{meeting_id}")
def get_reasoning(meeting_id: str):
    # Retrieve reasoning logic for the given meeting
    return {
        "meetingId": meeting_id,
        "reasoning": [
            {
                "step": 1,
                "description": "Analyzed transcript to extract action items.",
                "confidence": 0.95
            },
            {
                "step": 2,
                "description": "Identified a high priority task based on urgency keywords.",
                "confidence": 0.88
            }
        ]
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    async def generate():
        last_message = req.messages[-1].content if req.messages else ""
        
        # Helper to format Vercel AI SDK v1 stream
        def format_text(text: str):
            chunks = text.split(" ")
            for i, chunk in enumerate(chunks):
                space = " " if i < len(chunks) - 1 else ""
                yield f'0:"{chunk}{space}"\n'.encode('utf-8')
            yield f'0:"\\n"\n'.encode('utf-8')
        
        def format_tool_call(call_id: str, name: str, args: dict):
            payload = json.dumps([{"toolCallId": call_id, "toolName": name, "args": args}])
            yield f'9:{payload}\n'.encode('utf-8')

        def format_tool_result(call_id: str, result: str):
            payload = json.dumps([{"toolCallId": call_id, "result": result}])
            yield f'a:{payload}\n'.encode('utf-8')

        # Mock sequence
        for chunk in format_text("Context received. Engaging the **Strategy Orchestrator** to analyze the transcript..."):
            yield chunk
            await asyncio.sleep(0.05)
        
        for chunk in format_tool_call("call_strat_1", "Strategy Orchestrator", {"task": "Analyze meeting for actionable decisions"}):
            yield chunk
        await asyncio.sleep(1.0)
        
        for chunk in format_tool_result("call_strat_1", "Analysis complete. Detected 3 action items and 1 blocked decision."):
            yield chunk

        for chunk in format_text("\nDelegating the extracted tasks to the **Execution Specialist** to update external systems..."):
            yield chunk
            await asyncio.sleep(0.05)
            
        for chunk in format_tool_call("call_exec_1", "Execution Specialist", {"action": "Create Jira tickets", "count": 3}):
            yield chunk
        await asyncio.sleep(1.0)
        
        for chunk in format_tool_result("call_exec_1", "Successfully created EX-101, EX-102, EX-103 in Jira."):
            yield chunk
            
        for chunk in format_tool_call("call_verify_1", "Compliance Verifier", {"action": "Review Slack notification payload"}):
            yield chunk
        await asyncio.sleep(1.0)
        
        for chunk in format_tool_result("call_verify_1", "Payload approved. No sensitive data exposed."):
            yield chunk

        for chunk in format_text("\nThe workflow has successfully orchestrated. All systems are updated."):
            yield chunk
            await asyncio.sleep(0.05)

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8", headers={"x-vercel-ai-data-stream": "v1"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
