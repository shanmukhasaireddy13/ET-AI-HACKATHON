import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  supabase_id: { type: String, index: true },
  user_id: { type: String, index: true },
  title: String,
  date: String,
  transcript: String,
  summary: String,
  duration: Number,
  participants: [String],
  priority: String,
  source: String,
  tasks: Array,
  decisions: Array,
  risk_level: String,
  overall_health: String,
  agent_reasoning: [{
    agent: String,
    reasoning: String,
    timestamp: Date
  }],
  audit_log: [{
    entry: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, default: "processing" },
  error: String
}, { timestamps: true });

export const Meeting = mongoose.model('Meeting', meetingSchema);
