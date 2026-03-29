"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export type Decision = "Approved" | "Rejected";

interface HistoryItem {
  id: string;
  decision: Decision;
  timestamp: string;
  agent: string;
  action: string;
  decider: string;
}

export function ApprovalHistoryTable({ status }: { status: "approved" | "rejected" }) {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data: rawData, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching approval history:", error);
      } else {
        const formatted: HistoryItem[] = (rawData || []).map((a: any) => ({
          id: a.id,
          decision: (a.status.charAt(0).toUpperCase() + a.status.slice(1)) as Decision,
          timestamp: a.created_at ? format(new Date(a.created_at), 'MMM dd · HH:mm') : "TBD",
          agent: a.source_agent || "Agent",
          action: `Execute ${a.tool_name}`,
          decider: "You"
        }));
        setData(formatted);
      }
      setLoading(false);
    }

    fetchHistory();
  }, [status]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white border border-slate-200 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-20 text-center shadow-sm">
        <p className="text-[13px] text-slate-500 font-medium">No history found for {status} actions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/80 border-b border-slate-200 h-10">
          <tr>
            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-5 w-24">Decision</th>
            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-36">Date/Time</th>
            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-40">Agent</th>
            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
            <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-5 text-right w-32">Decided By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.id} 
              className={cn(
                "h-14 border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors relative pl-1 group"
              )}
            >
              <td className="pl-5">
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
                  item.decision === "Approved" ? "bg-success-bg text-success border-success-border" : "bg-error-bg text-error border-error-border"
                )}>
                  {item.decision === "Approved" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {item.decision}
                </div>
              </td>
              <td className="text-[12px] font-mono text-slate-500 font-medium pl-1">{item.timestamp}</td>
              <td className="text-[13px] font-bold text-slate-700">{item.agent}</td>
              <td className="text-[13px] font-bold text-slate-900 group-hover:text-blue transition-colors truncate max-w-[300px]">
                {item.action}
              </td>
              <td className="text-[12px] font-bold text-slate-500 text-right pr-5">{item.decider}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex justify-center">
        <button className="text-[12px] font-bold text-blue hover:underline tracking-tight">View Full History Report</button>
      </div>
    </div>
  );
}
