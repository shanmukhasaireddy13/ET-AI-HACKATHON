"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { fetchMeetingSnapshot, fetchAuditLogs } from "@/lib/api";
import AuditLogViewer from "@/components/meetings/AuditLogViewer";

export default function MeetingDetailPage() {
  const { meetingId } = useParams() as { meetingId: string };
  const [snapshot, setSnapshot] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"reasoning" | "audit" | "approvals">("reasoning");

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [snap, auditLogs] = await Promise.all([
        fetchMeetingSnapshot(meetingId).catch(() => null),
        fetchAuditLogs(meetingId).catch(() => []),
      ]);
      if (snap) setSnapshot(snap);
      setLogs(auditLogs || []);
    } catch (err) {
      console.error("Failed to fetch meeting", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [meetingId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !snapshot) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-1/3 bg-white/5 rounded-xl" />
        <div className="h-64 bg-white/[0.02] rounded-2xl border border-white/5" />
      </div>
    );
  }

  const agentReasoning = snapshot?.agent_reasoning || [];
  const approvals = snapshot?.approvals || [];
  const pendingApprovals = approvals.filter((a: any) => a.status === "pending");
  const isRunning = snapshot?.status === "running";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Run <span className="text-violet-400">{meetingId.split("-")[0]}</span>
            {pendingApprovals.length > 0 && (
              <span className="px-3 py-1 text-xs font-bold bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20 animate-pulse">
                {pendingApprovals.length} Pending
              </span>
            )}
          </h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">{meetingId}</p>
        </div>
        <div className="flex gap-3">
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Processing
            </div>
          )}
          <button onClick={fetchData} disabled={isRefreshing} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
            <svg className={`w-5 h-5 text-neutral-400 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Orchestrator Reasoning */}
      {snapshot?.orchestrator_reasoning && (
        <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-start gap-3">
            <span className="text-xl">🧠</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">Orchestrator Strategy</p>
              <p className="text-sm text-neutral-300 leading-relaxed">{snapshot.orchestrator_reasoning}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Context & Actions */}
        <div className="space-y-6">
          {/* Transcript */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-3">Scenario Context</h2>
            <div className="bg-black/30 rounded-xl p-4 h-[200px] overflow-y-auto text-sm text-neutral-400 leading-relaxed border border-white/5">
              {snapshot?.meeting?.transcript || snapshot?.meeting_transcript || "No transcript."}
            </div>
          </div>

          {/* Tasks */}
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-bold mb-3">
              Generated Actions
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{snapshot?.tasks?.length || 0}</span>
            </h2>
            <div className="space-y-2">
              {snapshot?.tasks?.map((t: any, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
                  <p className="font-medium mb-1">{t.title}</p>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>@{t.owner}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.priority === "high" ? "bg-red-500/10 text-red-400" : t.priority === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                    }`}>{t.priority}</span>
                  </div>
                </div>
              ))}
              {(!snapshot?.tasks || snapshot.tasks.length === 0) && (
                <p className="py-6 text-center text-neutral-500 text-sm">No actions extracted yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Tabbed panels */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] min-h-[600px]">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { key: "reasoning", label: "Agent Reasoning", icon: "🧠", count: agentReasoning.length },
                { key: "audit", label: "Event Stream", icon: "⚡", count: logs.length },
                { key: "approvals", label: "Approvals", icon: "🛡️", count: approvals.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                      : "bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  {tab.icon} {tab.label}
                  <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Reasoning */}
            {activeTab === "reasoning" && (
              <div className="space-y-4">
                {agentReasoning.length === 0 ? (
                  <p className="py-12 text-center text-neutral-500">No agent reasoning captured yet.</p>
                ) : (
                  agentReasoning.map((ar: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-violet-500/20 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs">🤖</span>
                        <span className="font-bold text-sm">{ar.agent}</span>
                        <span className="text-xs text-neutral-500 font-mono ml-auto">{ar.created_at?.split("T")[1]?.slice(0, 8)}</span>
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed">{ar.reasoning}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Audit */}
            {activeTab === "audit" && <AuditLogViewer logs={logs} loading={loading} />}

            {/* Approvals */}
            {activeTab === "approvals" && (
              <div className="space-y-3">
                {approvals.length === 0 ? (
                  <p className="py-12 text-center text-neutral-500">No approval gates triggered.</p>
                ) : (
                  approvals.map((ap: any, i: number) => {
                    const args = typeof ap.args === "string" ? JSON.parse(ap.args) : (ap.args || {});
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${
                        ap.status === "approved" ? "bg-emerald-500/5 border-emerald-500/20" :
                        ap.status === "rejected" ? "bg-red-500/5 border-red-500/20" :
                        "bg-amber-500/5 border-amber-500/20"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{ap.status === "approved" ? "✅" : ap.status === "rejected" ? "❌" : "⏳"}</span>
                            <span className="font-medium text-sm">{ap.tool}</span>
                            <span className="text-xs text-neutral-500">from {ap.source_agent}</span>
                          </div>
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/5">{ap.status}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-500 space-y-0.5">
                          {Object.entries(args).map(([k, v]) => (
                            <div key={k}><span className="text-neutral-600">{k}:</span> {String(v)}</div>
                          ))}
                        </div>
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
