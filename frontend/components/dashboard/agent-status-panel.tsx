"use client";

import { Bot, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AGENTS = [
  { id: 1, name: "Transcript Parser", action: "Processing Meeting #47", status: "running" },
  { id: 2, name: "Decision Extractor", action: "Idle", status: "active" },
  { id: 3, name: "Task Generator", action: "Analysing Engineering Sync", status: "running" },
  { id: 4, name: "Assignment Agent", action: "Idle", status: "active" },
  { id: 5, name: "Jira Integration", action: "Syncing 12 tasks", status: "error" },
  { id: 6, name: "Notification Agent", action: "Disabled", status: "disabled" },
  { id: 7, name: "Context Agent", action: "Idle", status: "active" },
];

export function AgentStatusPanel() {
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Agent Status</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[12px] font-bold text-success uppercase">5 active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-dash-bg transition-colors h-10 group">
            <div className={cn(
              "w-2 h-2 rounded-full shrink-0",
              agent.status === "running" ? "bg-warning animate-pulse-soft" : 
              agent.status === "active" ? "bg-success" : 
              agent.status === "error" ? "bg-error" : "bg-slate-200"
            )} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#0F172A] truncate group-hover:text-blue transition-colors">{agent.name}</span>
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                  agent.status === "running" ? "bg-warning-bg text-warning" : 
                  agent.status === "active" ? "bg-slate-50 text-slate-400" : 
                  agent.status === "error" ? "bg-error-bg text-red-600" : "bg-slate-50 text-slate-300"
                )}>
                  {agent.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate -mt-0.5">{agent.action}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 bg-dash-bg text-center">
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline font-medium">
          Manage agents →
        </Button>
      </div>
    </div>
  );
}
