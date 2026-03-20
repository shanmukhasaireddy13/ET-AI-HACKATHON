"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/ui/StatCard";
import MeetingList from "@/components/dashboard/MeetingList";

const API_BASE = "http://localhost:3001";

interface DashboardOverview {
  totalMeetings: number;
  runningMeetings: number;
  completedMeetings: number;
  reviewMeetings: number;
  totalTasks: number;
  totalApprovals: number;
  totalProposals: number;
  totalErrors: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal specific state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [overviewRes, meetingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/overview`).catch(() => null),
        fetch(`${API_BASE}/api/dashboard/meetings?limit=10`).catch(() => null)
      ]);

      if (overviewRes?.ok) {
        setOverview((await overviewRes.json()).data);
      }
      if (meetingsRes?.ok) {
        setMeetings((await meetingsRes.json()).data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitTranscript = async () => {
    if (!transcriptInput.trim()) return;
    setIsSubmitting(true);
    try {
       const res = await fetch(`${API_BASE}/api/meetings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptInput })
       });
       if (res.ok) {
          setIsModalOpen(false);
          setTranscriptInput("");
          fetchData();
       } else {
          console.error("Failed to submit transcript");
       }
    } catch (e) {
       console.error(e);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
      
      {/* Upload ModalOverlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="glass-card w-full max-w-2xl bg-background/80 p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform scale-100 animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold mb-2">Initialize New Workflow</h2>
              <p className="text-muted-foreground mb-6">Paste the raw meeting transcript below. The dynamic orchestrator will analyze it and spawn agents automatically.</p>
              
              <textarea 
                 value={transcriptInput}
                 onChange={(e) => setTranscriptInput(e.target.value)}
                 placeholder="e.g. Sales sync transcript... 'Alice, you take the Jira ticket. Bob, schedule the followup...'"
                 className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-foreground custom-scrollbar focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6"
              />

              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSubmitTranscript}
                   disabled={isSubmitting || !transcriptInput.trim()}
                   className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                   ) : "Start Autonomous Agents"}
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-8 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3 flex items-center gap-3">
            Dynamic Workflow
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary rounded-full border border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.5)]">Live</span>
          </h1>
          <p className="text-muted-foreground text-lg">Orchestrate and monitor fully autonomous LLM agents in real-time.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-3 rounded-2xl bg-white/5 text-foreground hover:bg-white/10 transition-all border border-white/10 group shadow-lg"
            title="Refresh Data"
          >
            <svg className={`w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors ${isRefreshing ? "animate-spin text-primary" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] transition-all hover:-translate-y-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Upload Transcript
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Dynamics" 
          value={loading ? "-" : overview?.runningMeetings || 0} 
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard 
          title="Total Processed" 
          value={loading ? "-" : overview?.completedMeetings || 0}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Generated Steps" 
          value={loading ? "-" : overview?.totalTasks || 0} 
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        />
        <StatCard 
          title="Required Actions" 
          value={loading ? "-" : overview?.totalApprovals || 0} 
          icon={<svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="mt-12 glass-panel p-6 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Recent Workflow Runs
            {overview?.runningMeetings ? <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse"></span> : null}
          </h2>
        </div>
        <MeetingList meetings={meetings} loading={loading} />
      </div>
    </div>
  );
}
