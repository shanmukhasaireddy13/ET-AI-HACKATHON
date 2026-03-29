"use client";

import { Activity } from "lucide-react";

interface AgentHeaderProps {
  systemHealth: "operational" | "warning" | "error";
  errorCount?: number;
}

export function AgentHeader({ systemHealth, errorCount }: AgentHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-medium text-slate-400">Agents</span>
        </div>
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Agents</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">Monitor and manage all AI agents in your workspace</p>
      </div>

      <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-sm transition-all duration-500 ${
        systemHealth === "operational" 
          ? "bg-success-bg border-success-border text-success" 
          : "bg-warning-bg border-warning-border text-warning"
      }`}>
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full absolute animate-ping opacity-75 ${
            systemHealth === "operational" ? "bg-success" : "bg-warning"
          }`} />
          <div className={`w-2 h-2 rounded-full relative ${
            systemHealth === "operational" ? "bg-success" : "bg-warning"
          }`} />
        </div>
        <span className="text-[12px] font-bold tracking-tight">
          {systemHealth === "operational" 
            ? "All systems operational" 
            : `${errorCount || 1} agent needs attention`}
        </span>
      </div>
    </div>
  );
}
