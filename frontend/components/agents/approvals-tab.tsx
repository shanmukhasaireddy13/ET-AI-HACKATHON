"use client";

import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";



export function ApprovalsTab({ agentName }: { agentName: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    async function fetchAgentApprovals() {
      const supabase = createClient();
      const { data: approvals, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('source_agent', agentName)
        .order('created_at', { ascending: false });

      if (!error && approvals) {
        const formatted = approvals.map((a: any) => ({
          id: a.id,
          date: format(new Date(a.created_at), 'MMM dd, HH:mm'),
          action: `Execute ${a.tool_name}`,
          priority: a.priority || "Medium",
          decision: a.status.charAt(0).toUpperCase() + a.status.slice(1),
          decider: "You",
          time: "12m"
        }));
        setData(formatted);
        setStats({
          total: approvals.length,
          approved: approvals.filter((a: any) => a.status === 'approved').length,
          rejected: approvals.filter((a: any) => a.status === 'rejected').length
        });
      }
      setLoading(false);
    }
    fetchAgentApprovals();
  }, [agentName]);

  if (loading) return <div className="py-10 text-center animate-pulse text-slate-400">Loading history...</div>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Reviewed", value: stats.total.toString(), icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-blue", bg: "bg-blue-light" },
          { label: "Approved", value: stats.approved.toString(), icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-success", bg: "bg-success-bg" },
          { label: "Rejected", value: stats.rejected.toString(), icon: <XCircle className="w-3.5 h-3.5" />, color: "text-error", bg: "bg-error-bg" }
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex items-center gap-3 shadow-sm">
             <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg, s.color)}>
               {s.icon}
             </div>
             <div>
               <span className="text-[18px] font-bold text-slate-900 font-mono tracking-tighter leading-none">{s.value}</span>
               <p className={cn("text-[11px] font-bold uppercase tracking-widest mt-0.5", s.color)}>{s.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 h-10">
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-5 w-40">Date</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action Requested</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-24">Priority</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-28">Decision</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-36">Decided By</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-6 text-right w-32">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((a) => (
              <tr key={a.id} className="h-12 border-b border-slate-50 hover:bg-slate-50/20 transition-colors group">
                <td className="pl-5 text-[12px] font-semibold text-slate-500">{a.date}</td>
                <td className="text-[13px] font-bold text-slate-800 pr-4">
                  <div className="flex items-center gap-2">
                    {a.action}
                    <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
                    a.priority === "Critical" ? "bg-error-bg text-error border-error-border" :
                    a.priority === "High" ? "bg-warning-bg text-warning border-warning-border" :
                    "bg-slate-50 text-slate-400 border-slate-200"
                  )}>{a.priority}</span>
                </td>
                <td>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold",
                    a.decision === "Approved" ? "bg-success-bg text-success" : 
                    a.decision === "Rejected" ? "bg-error-bg text-error" : "bg-warning-bg text-warning"
                  )}>
                    {a.decision}
                  </div>
                </td>
                <td className="text-[12px] font-bold text-slate-600">{a.decider}</td>
                <td className="text-right pr-6 text-[12px] font-mono text-slate-400">{a.time}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">No approval history available.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50/30 flex justify-center border-t border-slate-50">
           <button className="text-[12px] font-bold text-blue hover:underline tracking-tight">View Full History Report</button>
        </div>
      </div>
    </div>
  );
}
