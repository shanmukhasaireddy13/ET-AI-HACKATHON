"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Decision = "Approved" | "Rejected";

interface HistoryItem {
  id: string;
  decision: Decision;
  timestamp: string;
  agent: string;
  action: string;
  decider: string;
}

const HISTORY_DATA: HistoryItem[] = [
  { id: "h1", decision: "Approved", timestamp: "Mar 21 · 10:45", agent: "Jira Agent", action: "Create 14 Jira tickets for Meeting v102", decider: "You" },
  { id: "h2", decision: "Rejected", timestamp: "Mar 20 · 16:30", agent: "Email Agent", action: "Send bulk invite to all 'Rahul' in directory", decider: "You" },
  { id: "h3", decision: "Approved", timestamp: "Mar 20 · 14:12", agent: "Parser Agent", action: "Archive obsolete engineering logs", decider: "Rahul Sharma" },
  { id: "h4", decision: "Approved", timestamp: "Mar 19 · 09:20", agent: "Jira Agent", action: "Sync Q3 roadmap to Confluence", decider: "You" },
];

export function ApprovalHistoryTable() {
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
          {HISTORY_DATA.map((item) => (
            <tr 
              key={item.id} 
              className={cn(
                "h-14 border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors relative pl-1",
                "group"
              )}
            >
              {/* Left decision accent bar */}
              <div className={cn(
                "absolute left-0 top-1 bottom-1 w-[3px] rounded-r",
                item.decision === "Approved" ? "bg-success" : "bg-error"
              )} />
              
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
