import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, _res, next) => {
  req.requestId = uuidv4();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.requestId}`);
  next();
});

const pythonClient = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 30000,
});

async function callPython(req, method, path, options = {}) {
  const response = await pythonClient.request({
    method,
    url: path,
    data: options.data,
    params: options.params,
    headers: {
      "X-Request-ID": req.requestId,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return response.data;
}

function buildGatewayError(error) {
  const status = error.response?.status || 500;
  const detail = error.response?.data?.detail || error.message;
  return { status, detail };
}

function buildOverview(meetings) {
  const summary = {
    totalMeetings: meetings.length,
    runningMeetings: 0,
    completedMeetings: 0,
    reviewMeetings: 0,
    totalTasks: 0,
    totalApprovals: 0,
    totalProposals: 0,
    totalErrors: 0,
  };

  for (const meeting of meetings) {
    if (meeting.status === "running") summary.runningMeetings += 1;
    if (meeting.status === "completed") summary.completedMeetings += 1;
    if (meeting.status === "needs_review") summary.reviewMeetings += 1;
    summary.totalTasks += meeting.task_count || 0;
    summary.totalApprovals += meeting.approval_count || 0;
    summary.totalProposals += meeting.proposal_count || 0;
    summary.totalErrors += meeting.error_count || 0;
  }

  return summary;
}

function buildSnapshotSummary(snapshot) {
  const completedAgents = snapshot.agent_statuses.filter((agent) => agent.status === "completed").length;
  const failedAgents = snapshot.agent_statuses.filter((agent) => agent.status === "failed").length;
  const pendingApprovals = snapshot.approvals.filter((approval) => approval.status === "pending").length;

  return {
    completedAgents,
    failedAgents,
    pendingApprovals,
    taskCount: snapshot.tasks.length,
    workflowCount: snapshot.workflows.length,
    proposalCount: snapshot.execution_proposals.length,
    errorCount: snapshot.errors.length,
  };
}

app.get("/health", async (req, res) => {
  try {
    const backendHealth = await callPython(req, "get", "/health");
    res.json({
      status: "ok",
      service: "autoexec-gateway",
      timestamp: new Date().toISOString(),
      backend: backendHealth,
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Gateway health check failed",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.post("/api/meetings", async (req, res) => {
  try {
    const { meeting_id, transcript } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        error: "Transcript is required",
        request_id: req.requestId,
      });
    }

    const meetingId = meeting_id || `meeting-${uuidv4()}`;
    const data = await callPython(req, "post", "/api/meetings/process", {
      data: { meeting_id: meetingId, transcript },
    });

    res.json({
      success: true,
      request_id: req.requestId,
      data,
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to process meeting",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/dashboard/meetings", async (req, res) => {
  try {
    const data = await callPython(req, "get", "/api/dashboard/meetings", {
      params: { limit: req.query.limit || 20 },
    });
    res.json({
      success: true,
      request_id: req.requestId,
      data,
      overview: buildOverview(data),
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to load dashboard meetings",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/dashboard/overview", async (req, res) => {
  try {
    const meetings = await callPython(req, "get", "/api/dashboard/meetings", {
      params: { limit: req.query.limit || 20 },
    });
    res.json({
      success: true,
      request_id: req.requestId,
      data: buildOverview(meetings),
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to load dashboard overview",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/meetings/:meetingId/snapshot", async (req, res) => {
  try {
    const snapshot = await callPython(req, "get", `/api/meetings/${req.params.meetingId}/snapshot`);
    res.json({
      success: true,
      request_id: req.requestId,
      data: snapshot,
      summary: buildSnapshotSummary(snapshot),
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to load meeting snapshot",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/runs/:runId/snapshot", async (req, res) => {
  try {
    const snapshot = await callPython(req, "get", `/api/runs/${req.params.runId}/snapshot`);
    res.json({
      success: true,
      request_id: req.requestId,
      data: snapshot,
      summary: buildSnapshotSummary(snapshot),
    });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to load run snapshot",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/audit-logs/:meetingId", async (req, res) => {
  try {
    const data = await callPython(req, "get", `/api/audit-logs/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to fetch audit logs",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/tasks/:meetingId", async (req, res) => {
  try {
    const data = await callPython(req, "get", `/api/tasks/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to fetch tasks",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/workflows/:meetingId", async (req, res) => {
  try {
    const data = await callPython(req, "get", `/api/workflows/${req.params.meetingId}`);
    res.json({ success: true, request_id: req.requestId, data });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to fetch workflows",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.get("/api/approvals", async (req, res) => {
  try {
    const data = await callPython(req, "get", "/api/approvals", {
      params: {
        meeting_id: req.query.meeting_id,
        status: req.query.status,
      },
    });
    res.json({ success: true, request_id: req.requestId, data });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to fetch approvals",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.post("/api/approvals/:taskId/decision", async (req, res) => {
  try {
    const { status, approved_by, feedback } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Status must be approved or rejected",
        request_id: req.requestId,
      });
    }

    const data = await callPython(req, "post", `/api/approvals/${req.params.taskId}/decision`, {
      data: { status, approved_by, feedback },
    });
    res.json({ success: true, request_id: req.requestId, data });
  } catch (error) {
    const gatewayError = buildGatewayError(error);
    res.status(gatewayError.status).json({
      error: "Failed to process approval",
      detail: gatewayError.detail,
      request_id: req.requestId,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    request_id: req.requestId,
  });
});

app.use((error, req, res, _next) => {
  console.error(`[${req.requestId}]`, error);
  res.status(500).json({
    error: "Internal server error",
    detail: error.message,
    request_id: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`Gateway listening on http://localhost:${PORT}`);
});

export default app;
