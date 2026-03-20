import { v4 as uuidv4 } from "uuid";
import { Meeting } from "../models/Meeting.js";
import { supabase } from "../config/db.js";
import { callPython } from "../utils/pythonClient.js";
import { buildOverview, buildSnapshotSummary } from "../utils/helpers.js";

export async function createMeeting(req, res) {
  try {
    const { meeting_id, transcript } = req.body;
    if (!transcript?.trim()) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const meetingId = meeting_id || `meeting-${uuidv4()}`;

    await new Meeting({
      id: meetingId,
      transcript,
      title: "New Meeting Analysis",
      date: new Date().toISOString(),
      status: "processing",
    }).save();

    callPython(req, "post", "/api/agent/process", {
      data: { meeting_id: meetingId, transcript },
    }).catch((err) => console.error("Agent Error:", err.message));

    res.json({ success: true, request_id: req.requestId, data: { meeting_id: meetingId, status: "processing" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process meeting" });
  }
}

export async function getDashboardMeetings(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const meetings = await Meeting.find().sort({ createdAt: -1 }).limit(limit).lean();

    const data = meetings.map((m) => ({
      id: m.id,
      status: m.status,
      current_stage: m.status,
      task_count: m.tasks?.length || 0,
      approval_count: 0,
      proposal_count: 0,
      error_count: m.error ? 1 : 0,
      updated_at: m.updatedAt || m.createdAt,
      transcript: m.transcript,
    }));

    res.json({ success: true, request_id: req.requestId, data, overview: buildOverview(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load meetings" });
  }
}

export async function getDashboardOverview(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const meetings = await Meeting.find().sort({ createdAt: -1 }).limit(limit).lean();

    const data = meetings.map((m) => ({
      status: m.status,
      task_count: m.tasks?.length || 0,
      approval_count: 0,
      proposal_count: 0,
      error_count: m.error ? 1 : 0,
    }));

    res.json({ success: true, request_id: req.requestId, data: buildOverview(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load overview" });
  }
}

export async function getMeetingSnapshot(req, res) {
  try {
    const m = await Meeting.findOne({ id: req.params.meetingId }).lean();
    if (!m) return res.status(404).json({ error: "Not found" });

    const { data: approvals } = await supabase.from("approvals").select("*").eq("meeting_id", m.id);

    const snapshot = {
      meeting: { id: m.id, transcript: m.transcript, summary: m.summary },
      agent_statuses: [],
      approvals: approvals || [],
      tasks: m.tasks || [],
      workflows: m.decisions || [],
      execution_proposals: [],
      errors: m.error ? [{ error: m.error }] : [],
    };

    res.json({ success: true, request_id: req.requestId, data: snapshot, summary: buildSnapshotSummary(snapshot) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load snapshot" });
  }
}
