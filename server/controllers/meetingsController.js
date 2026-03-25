import { v4 as uuidv4 } from "uuid";
import { Meeting } from "../models/Meeting.js";
import { supabase } from "../config/db.js";
import { callPython } from "../utils/pythonClient.js";
import { buildOverview, buildSnapshotSummary } from "../utils/helpers.js";

export async function createMeeting(req, res) {
  console.log("POST /api/meetings received", req.body);
  try {
    let { meeting_id, transcript, content, title, platform, duration, participants, priority } = req.body;
    
    // Robustness: Accept 'content' as 'transcript'
    transcript = transcript || content;

    if (!transcript?.trim()) {
      console.log("Missing transcript/content");
      return res.status(400).json({ error: "Transcript is required" });
    }

    const meetingId = meeting_id || uuidv4();

    // 1. Sync to Supabase PostgreSQL (Primary for Dashboard)
    const { error: sbError } = await supabase.from('meetings').insert({
      id: meetingId,
      title: title || "New Meeting Analysis",
      transcript,
      status: "processing",
      source: platform || "zoom",
      duration: parseInt(duration) || 0,
      participants: participants || [],
      priority: priority || "Normal",
      created_at: new Date().toISOString()
    });

    if (sbError) {
      console.error("Supabase Insert Error:", sbError);
      return res.status(500).json({ error: `Supabase error: ${sbError.message}` });
    }

    // 2. Sync to MongoDB (Legacy/Fallback/Rich Agent Data)
    try {
      await new Meeting({
        id: meetingId,
        transcript,
        title: title || "New Meeting Analysis",
        status: "processing",
        date: new Date().toISOString(),
        duration: parseInt(duration) || 0,
        participants: participants || [],
        priority: priority || "Normal",
      }).save();
    } catch (mongoError) {
      console.error("MongoDB Save Error (non-fatal):", mongoError.message);
      // We don't crash if MongoDB fails as long as Supabase succeeded
    }

    // 3. Trigger Python Agent Engine
    callPython(req, "post", "/api/agent/process", {
      data: { 
        meeting_id: meetingId, 
        transcript,
        metadata: { title, platform, duration, participants, priority }
      },
    }).catch((err) => console.error("Agent Engine Error:", err.message));

    res.json({ success: true, request_id: req.requestId, data: { meeting_id: meetingId, status: "processing" } });
  } catch (err) {
    console.error("General Error in createMeeting:", err);
    res.status(500).json({ error: "Failed to process meeting" });
  }
}

export async function getDashboardMeetings(req, res) {
  try {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*, tasks:tasks(count)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const data = meetings.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      current_stage: m.status,
      task_count: m.tasks?.[0]?.count || 0,
      approval_count: 0,
      proposal_count: 0,
      error_count: m.status === 'failed' ? 1 : 0,
      updated_at: m.updated_at || m.created_at,
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
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('status, id, tasks:tasks(count)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const data = meetings.map((m) => ({
      status: m.status,
      task_count: m.tasks?.[0]?.count || 0,
      approval_count: 0,
      proposal_count: 0,
      error_count: m.status === 'failed' ? 1 : 0,
    }));

    res.json({ success: true, request_id: req.requestId, data: buildOverview(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load overview" });
  }
}

export async function syncMeetingResults(req, res) {
  const { meetingId } = req.params;
  const { summary, tasks, decisions, status, error } = req.body;

  console.log(`SYNC: Updating MongoDB for meeting ${meetingId}`);

  try {
    const meeting = await Meeting.findOneAndUpdate(
      { id: meetingId },
      { 
        summary, 
        tasks, 
        decisions, 
        status: status || 'completed',
        error: error || null,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: meeting });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Failed to sync to MongoDB" });
  }
}

export async function getMeetingSnapshot(req, res) {
  try {
    const m = await Meeting.findOne({ id: req.params.meetingId }).lean();
    if (!m) return res.status(404).json({ error: "Not found" });

    const { data: tasks } = await supabase.from("tasks").select("*").eq("meeting_id", m.id);
    const { data: decisions } = await supabase.from("decisions").select("*").eq("meeting_id", m.id);
    const { data: approvals } = await supabase.from("approvals").select("*").eq("meeting_id", m.id);

    const snapshot = {
      meeting: { id: m.id, transcript: m.transcript, summary: m.summary || "" },
      agent_statuses: [], // Can be populated from agent_reasoning if needed
      approvals: approvals || [],
      tasks: tasks || [],
      workflows: decisions || [],
      execution_proposals: [],
      errors: m.error ? [{ error: m.error }] : [],
    };

    res.json({ success: true, request_id: req.requestId, data: snapshot, summary: buildSnapshotSummary(snapshot) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load snapshot" });
  }
}
