import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  date: String,
  transcript: String,
  summary: String,
  tasks: Array,
  decisions: Array,
  risk_level: String,
  overall_health: String,
  status: { type: String, default: "processing" },
  error: String
}, { timestamps: true });

export const Meeting = mongoose.model('Meeting', meetingSchema);
