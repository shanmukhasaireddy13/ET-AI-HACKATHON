"use client";

import { ShieldAlert, Check, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APPROVALS = [
  {
    id: "1",
    title: "Create 12 tickets in EPIC-39",
    agent: "Jira Agent",
    time: "2 min ago",
    priority: "critical"
  },
  {
    id: "2",
    title: "Update Project Status on Slack",
    agent: "Notification Agent",
    time: "15 min ago",
    priority: "high"
  },
  {
    id: "3",
    title: "Assign 4 tasks to Engineering",
    agent: "Assignment Agent",
    time: "45 min ago",
    priority: "medium"
  }
];

export function ApprovalsCard() {
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Pending Approvals</h3>
        <span className="bg-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
      </div>

      <div className="flex-1">
        {APPROVALS.map((item) => (
          <div key={item.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-2.5 mb-2">
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                item.priority === "critical" ? "bg-error" : item.priority === "high" ? "bg-warning" : "bg-blue"
              )} />
              <div>
                <p className="text-[13px] font-medium text-[#0F172A] leading-snug mb-1">{item.title}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Bot className="w-3 h-3" />
                  <span>{item.agent} · {item.time}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 ml-4.5">
              <Button size="sm" className="h-7 px-3 bg-success-bg text-success border border-success-border hover:bg-success hover:text-white transition-all text-[11px] font-bold">
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-3 bg-error-bg text-error border border-error-border hover:bg-error hover:text-white transition-all text-[11px] font-bold">
                <X className="w-3 h-3 mr-1" /> Reject
              </Button>
              <Button variant="link" className="text-blue text-[11px] h-7 p-0 ml-1">Details →</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-dash-bg text-center">
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline">
          View all approvals →
        </Button>
      </div>
    </div>
  );
}
