"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchDashboardOverview, fetchDashboardMeetings, submitTranscript } from "@/lib/api";
import MeetingList from "@/components/dashboard/MeetingList";

interface DashboardOverview {
  totalMeetings: number;
  runningMeetings: number;
  completedMeetings: number;
  reviewMeetings: number;
  totalTasks: number;
  totalApprovals: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [overviewData, meetingsData] = await Promise.all([
        fetchDashboardOverview().catch(() => null),
        fetchDashboardMeetings(10).catch(() => []),
      ]);
      if (overviewData) setOverview(overviewData);
      setMeetings(meetingsData || []);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!transcriptInput.trim()) return;
    setIsSubmitting(true);
    try {
      await submitTranscript(transcriptInput);
      setIsModalOpen(false);
      setTranscriptInput("");
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: "Active Runs", value: overview?.runningMeetings || 0, color: "from-blue-500 to-cyan-500" },
    { label: "Completed", value: overview?.completedMeetings || 0, color: "from-emerald-500 to-green-500" },
    { label: "Tasks Created", value: overview?.totalTasks || 0, color: "from-violet-500 to-purple-500" },
    { label: "Pending Approvals", value: overview?.totalApprovals || 0, color: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl p-8 rounded-2xl border border-white/10 bg-neutral-900/90 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-2">New Workflow</h2>
            <p className="text-neutral-400 text-sm mb-6">Paste a meeting transcript. The orchestrator will analyze it and spawn agents automatically.</p>
            <textarea
              value={transcriptInput}
              onChange={(e) => setTranscriptInput(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              className="w-full h-56 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all mb-6 resize-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !transcriptInput.trim()}
                className="px-6 py-2.5 rounded-xl text-sm bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" /> : "Start Agents"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-neutral-400 mt-1">Monitor and orchestrate your autonomous workflows.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <svg className={`w-5 h-5 text-neutral-400 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            New Workflow
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-sm text-neutral-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">
              {loading ? <span className="w-8 h-7 bg-white/5 rounded animate-pulse inline-block" /> : stat.value}
            </p>
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${stat.color} mt-3 opacity-60`} />
          </div>
        ))}
      </div>

      {/* Meetings List */}
      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Workflow Runs</h2>
          {overview?.runningMeetings ? (
            <span className="flex items-center gap-2 text-xs text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {overview.runningMeetings} running
            </span>
          ) : null}
        </div>
        <MeetingList meetings={meetings} loading={loading} />
      </div>
    </div>
  );
}
