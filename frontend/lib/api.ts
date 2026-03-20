const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ─── Meetings ───
export async function fetchDashboardOverview() {
  const res = await fetch(`${API_BASE}/api/dashboard/overview`);
  if (!res.ok) throw new Error("Failed to fetch overview");
  return (await res.json()).data;
}

export async function fetchDashboardMeetings(limit = 10) {
  const res = await fetch(`${API_BASE}/api/dashboard/meetings?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return (await res.json()).data || [];
}

export async function submitTranscript(transcript: string) {
  const res = await fetch(`${API_BASE}/api/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) throw new Error("Failed to submit transcript");
  return res.json();
}

export async function fetchMeetingSnapshot(meetingId: string) {
  const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/snapshot`);
  if (!res.ok) throw new Error("Snapshot not found");
  return (await res.json()).data;
}

// ─── Approvals ───
export async function fetchApprovals(meetingId?: string) {
  const params = meetingId ? `?meeting_id=${meetingId}` : "";
  const res = await fetch(`${API_BASE}/api/approvals${params}`);
  if (!res.ok) throw new Error("Failed to fetch approvals");
  return (await res.json()).data;
}

export async function submitApprovalDecision(
  taskId: string,
  status: "approved" | "rejected",
  feedback = ""
) {
  const res = await fetch(`${API_BASE}/api/approvals/${taskId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, approved_by: "human", feedback }),
  });
  if (!res.ok) throw new Error("Failed to process approval");
  return res.json();
}

// ─── Integrations ───
export async function fetchIntegrations() {
  const res = await fetch(`${API_BASE}/api/integrations`);
  if (!res.ok) throw new Error("Failed to fetch integrations");
  return (await res.json()).data;
}

export async function initiateJiraOAuth() {
  const res = await fetch(`${API_BASE}/api/integrations/jira/initiate`);
  if (!res.ok) throw new Error("Failed to initiate OAuth");
  return (await res.json()).data;
}

export async function disconnectJira() {
  const res = await fetch(`${API_BASE}/api/integrations/jira`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to disconnect Jira");
  return res.json();
}

// ─── Agent Data ───
export async function fetchAuditLogs(meetingId: string) {
  const res = await fetch(`${API_BASE}/api/audit-logs/${meetingId}`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return (await res.json()).data;
}

export async function fetchTasks(meetingId: string) {
  const res = await fetch(`${API_BASE}/api/tasks/${meetingId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return (await res.json()).data;
}

export async function fetchReasoning(meetingId: string) {
  const res = await fetch(`${API_BASE}/api/reasoning/${meetingId}`);
  if (!res.ok) throw new Error("Failed to fetch reasoning");
  return (await res.json()).data;
}
