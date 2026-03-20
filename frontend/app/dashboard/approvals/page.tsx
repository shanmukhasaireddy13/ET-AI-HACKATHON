"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchApprovals, submitApprovalDecision } from "@/lib/api";
import ApprovalCard from "@/components/approvals/ApprovalCard";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadApprovals = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchApprovals();
      setApprovals(data.filter((a: any) => a.status === "pending") || []);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    try {
      await submitApprovalDecision(id, decision);
      setApprovals((current) => current.filter((a) => a.id !== id));
    } catch (err) {
      console.error(`Failed to ${decision} approval ${id}`, err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-neutral-400 mt-1">Review and authorize agent execution proposals.</p>
        </div>
        <div className="flex items-center gap-3">
          {approvals.length > 0 && (
            <span className="px-3 py-1 text-xs font-bold bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
              {approvals.length} Pending
            </span>
          )}
          <button
            onClick={loadApprovals}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <svg className={`w-5 h-5 text-neutral-400 ${isRefreshing ? "animate-spin text-violet-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {loading && approvals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-2">All caught up!</h3>
          <p className="text-neutral-400 max-w-md mx-auto">No pending approvals require your attention right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onDecision={handleDecision} />
          ))}
        </div>
      )}
    </div>
  );
}
