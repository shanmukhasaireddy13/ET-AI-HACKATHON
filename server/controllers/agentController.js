import { callPython } from "../utils/pythonClient.js";

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
