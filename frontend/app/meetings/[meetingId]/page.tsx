"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AuditLogViewer from "@/components/meetings/AuditLogViewer";

const API_BASE = "http://localhost:3001";

export default function MeetingPage() {
  const { meetingId } = useParams() as { meetingId: string };
  const [snapshot, setSnapshot] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"reasoning" | "audit" | "approvals">("reasoning");

  const fetchMeetingData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [snapRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/meetings/${meetingId}/snapshot`).catch(() => null),
        fetch(`${API_BASE}/api/audit-logs/${meetingId}`).catch(() => null)
      ]);

      if (snapRes?.ok) {
        setSnapshot((await snapRes.json()).data);
      }
      if (logsRes?.ok) {
        setLogs((await logsRes.json()).data || []);
      }
    } catch (err) {
      console.error("Failed to fetch meeting", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeetingData();
  }, [fetchMeetingData]);

  if (loading && !snapshot) {
     return <div className="animate-pulse space-y-8">
       <div className="h-10 w-1/3 bg-white/10 rounded"></div>
       <div className="h-64 glass-panel rounded-[2rem]"></div>
     </div>;
  }

  const isRunning = snapshot?.status === "running";
  const needsReview = snapshot?.status === "needs_review";
  const agentReasoning = snapshot?.agent_reasoning || [];
  const approvals = snapshot?.approvals || [];
  const pendingApprovals = approvals.filter((a: any) => a.status === "pending");

  const statusConfig = isRunning 
    ? { color: "blue", label: "Processing", glow: "rgba(59,130,246,0.3)" }
    : needsReview 
    ? { color: "amber", label: "Needs Review", glow: "rgba(245,158,11,0.3)" }
    : { color: "emerald", label: "Completed", glow: "rgba(16,185,129,0.3)" };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-card p-6 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
               Run <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{meetingId.split("-")[0]}</span>
            </h1>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border shadow-lg bg-${statusConfig.color}-500/20 text-${statusConfig.color}-300 border-${statusConfig.color}-500/30`}
                  style={{ boxShadow: `0 0 15px ${statusConfig.glow}` }}>
              {statusConfig.label}
            </span>
            {pendingApprovals.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                {pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-muted-foreground font-mono text-sm opacity-60">ID: {meetingId}</p>
        </div>
        
        <div className="flex gap-4">
           {isRunning && (
              <div className="flex items-center gap-3 text-sm font-semibold text-blue-300 bg-blue-500/10 px-5 py-3 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                 Orchestrator Operating
              </div>
           )}
           <button 
             onClick={fetchMeetingData}
             disabled={isRefreshing}
             className="p-3 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all border border-white/10 shadow hover:shadow-lg disabled:opacity-50 group"
             title="Sync Workflow"
           >
             <svg className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ${isRefreshing ? "animate-spin text-primary" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        </div>
      </div>

      {/* Orchestrator Reasoning Banner */}
      {snapshot?.orchestrator_reasoning && (
        <div className="glass-card p-5 rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 mt-0.5">
              <span className="text-lg">🧠</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Orchestrator Strategy</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{snapshot.orchestrator_reasoning}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left sidebar */}
         <div className="lg:col-span-1 space-y-6">
            {/* Transcript */}
            <div className="glass-panel p-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:bg-primary/5 transition-colors duration-500"></div>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                   <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                 </div>
                 Scenario Context
               </h2>
               <div className="bg-black/40 rounded-xl p-5 h-[250px] overflow-y-auto text-sm text-muted-foreground leading-relaxed custom-scrollbar border border-white/5 shadow-inner">
                  {snapshot?.meeting_transcript || "No transcript available."}
               </div>
            </div>

            {/* Generated Actions */}
            <div className="glass-panel p-6 shadow-xl">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                   <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                 </div>
                 Generated Actions
                 <span className="ml-auto bg-primary/20 text-primary border border-primary/30 text-xs px-2.5 py-1 rounded-full font-bold">{snapshot?.tasks?.length || 0}</span>
               </h2>
               <div className="space-y-3">
                 {snapshot?.tasks?.map((t: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 text-sm hover:border-white/20 transition-colors">
                       <div className="font-semibold text-foreground mb-2 leading-tight">{t.title}</div>
                       <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                         <span className="opacity-80">@{t.owner}</span>
                         <div className="flex gap-2">
                           <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${
                             t.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                             t.priority === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                             "bg-blue-500/10 text-blue-400 border-blue-500/20"
                           }`}>{t.priority}</span>
                           <span className="bg-black/30 px-2 py-0.5 rounded shadow-inner border border-white/5 uppercase tracking-wider text-[10px]">{t.status}</span>
                         </div>
                       </div>
                    </div>
                 ))}
                 {(!snapshot?.tasks || snapshot.tasks.length === 0) && (
                    <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                      <p className="text-sm text-muted-foreground italic">No actions extracted yet.</p>
                    </div>
                 )}
               </div>
            </div>
         </div>

         {/* Right: Tabbed panels */}
         <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 min-h-[700px] shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
               
               {/* Tab Switcher */}
               <div className="flex gap-2 mb-8">
                 {[
                   { key: "reasoning", label: "Agent Reasoning", icon: "🧠", count: agentReasoning.length },
                   { key: "audit", label: "Event Stream", icon: "⚡", count: logs.length },
                   { key: "approvals", label: "Approval Gates", icon: "🛡️", count: approvals.length }
                 ].map(tab => (
                   <button
                     key={tab.key}
                     onClick={() => setActiveTab(tab.key as typeof activeTab)}
                     className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                       activeTab === tab.key
                         ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                         : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                     }`}
                   >
                     <span>{tab.icon}</span>
                     {tab.label}
                     <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                   </button>
                 ))}
               </div>

               {/* Agent Reasoning Tab */}
               {activeTab === "reasoning" && (
                 <div className="space-y-4">
                   <h2 className="text-xl font-bold mb-4 text-foreground">Why Each Agent Made Its Decisions</h2>
                   {agentReasoning.length === 0 ? (
                     <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                       <p className="text-muted-foreground">No agent reasoning captured yet.</p>
                     </div>
                   ) : (
                     agentReasoning.map((ar: any, idx: number) => (
                       <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-xl p-5 hover:border-primary/20 transition-colors">
                         <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm border border-primary/30">🤖</div>
                           <span className="font-bold text-foreground">{ar.agent}</span>
                           <span className="text-xs text-muted-foreground font-mono ml-auto">{ar.created_at?.split("T")[1]?.slice(0, 8)}</span>
                         </div>
                         <p className="text-sm text-foreground/80 leading-relaxed mb-3">{ar.reasoning}</p>
                         {ar.outputs && (
                           <div className="flex flex-wrap gap-2">
                             {(typeof ar.outputs === "string" ? JSON.parse(ar.outputs) : ar.outputs).map((o: string, i: number) => (
                               <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                 {o}
                               </span>
                             ))}
                           </div>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               )}

               {/* Audit Log Tab */}
               {activeTab === "audit" && (
                 <div>
                   <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                       <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     Dynamic Event Stream
                   </h2>
                   <AuditLogViewer logs={logs} loading={loading} />
                 </div>
               )}

               {/* Approvals Tab */}
               {activeTab === "approvals" && (
                 <div className="space-y-4">
                   <h2 className="text-xl font-bold mb-4 text-foreground">Human-in-the-Loop Decisions</h2>
                   {approvals.length === 0 ? (
                     <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                       <p className="text-muted-foreground">No approval gates were triggered for this run.</p>
                     </div>
                   ) : (
                     approvals.map((ap: any, idx: number) => {
                       const args = typeof ap.args === "string" ? JSON.parse(ap.args) : (ap.args || {});
                       const isApproved = ap.status === "approved";
                       const isRejected = ap.status === "rejected";
                       const isPending = ap.status === "pending";
                       
                       return (
                         <div key={idx} className={`border rounded-xl p-5 transition-colors ${
                           isApproved ? "bg-emerald-500/5 border-emerald-500/20" :
                           isRejected ? "bg-destructive/5 border-destructive/20" :
                           "bg-amber-500/5 border-amber-500/20 animate-pulse"
                         }`}>
                           <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-3">
                               <span className="text-xl">{isApproved ? "✅" : isRejected ? "❌" : "⏳"}</span>
                               <span className="font-bold text-foreground">{ap.tool}</span>
                               <span className="text-xs text-muted-foreground">from {ap.source_agent}</span>
                             </div>
                             <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                               isApproved ? "bg-emerald-500/20 text-emerald-400" :
                               isRejected ? "bg-destructive/20 text-destructive" :
                               "bg-amber-500/20 text-amber-400"
                             }`}>{ap.status}</span>
                           </div>
                           <div className="text-xs font-mono text-muted-foreground space-y-1">
                             {Object.entries(args).map(([k, v]) => (
                               <div key={k}><span className="text-foreground/50">{k}:</span> {String(v)}</div>
                             ))}
                           </div>
                           {ap.decided_at && (
                             <p className="text-xs text-muted-foreground mt-2 italic">Decided at {ap.decided_at}</p>
                           )}
                         </div>
                       );
                     })
                   )}
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
