import { supabase } from "../config/db.js";
import { callPython } from "../utils/pythonClient.js";

export async function getApprovals(req, res) {
  try {
    const { meeting_id, status } = req.query;
    let query = supabase.from("approvals").select("*");
    if (meeting_id) query = query.eq("meeting_id", meeting_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((r) => ({
      ...r,
      payload: r.payload ? (typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload) : {},
    }));

    res.json({ success: true, request_id: req.requestId, data: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
}

export async function processDecision(req, res) {
  try {
    const { status, approved_by, feedback } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }

    const { error } = await supabase
      .from("approvals")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.params.taskId);

    if (error) throw error;

    callPython(req, "post", `/api/approvals/${req.params.taskId}/decision`, {
      data: { status, approved_by, feedback },
    }).catch((err) => console.error("Agent resume error:", err.message));

    res.json({ success: true, request_id: req.requestId, data: { status: "success" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process approval" });
  }
}
