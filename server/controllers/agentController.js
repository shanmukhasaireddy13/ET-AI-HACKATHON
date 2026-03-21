import { callPython, pythonClient } from "../utils/pythonClient.js";

export async function getAuditLogs(req, res) {
  try {
    const data = await callPython(req, "get", `/api/audit-logs/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: "Failed to fetch audit logs" });
  }
}

export async function getTasks(req, res) {
  try {
    const data = await callPython(req, "get", `/api/tasks/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: "Failed to fetch tasks" });
  }
}

export async function getWorkflows(req, res) {
  try {
    const data = await callPython(req, "get", `/api/workflows/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: "Failed to fetch workflows" });
  }
}

export async function getReasoning(req, res) {
  try {
    const data = await callPython(req, "get", `/api/reasoning/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: "Failed to fetch reasoning" });
  }
}

export async function getRunSnapshot(req, res) {
  try {
    const data = await callPython(req, "get", `/api/runs/${req.params.runId}/snapshot`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: "Failed to load run snapshot" });
  }
}

export async function healthCheck(req, res) {
  try {
    const backend = await callPython(req, "get", "/health");
    res.json({ status: "ok", service: "sidd-gateway", backend });
  } catch {
    res.json({ status: "ok", service: "sidd-gateway", backend: "unreachable" });
  }
}

export async function chat(req, res) {
  try {
    const pythonUrl = `${process.env.PYTHON_API_URL || "http://localhost:8000"}/api/chat`;
    
    const response = await fetch(pythonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: "Python backend error" });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    
    // Pipe the readable stream from Python to the Express response
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
      }
    };
    
    await pump();
  } catch (err) {
    console.error("Chat proxy error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat" });
    }
  }
}

