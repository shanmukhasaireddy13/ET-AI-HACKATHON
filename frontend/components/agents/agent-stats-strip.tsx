"use client";

import { Bot } from "lucide-react";

export function AgentStatsStrip() {
  const stats = [
    { label: "Total Agents", value: "7", icon: <Bot className="w-4 h-4 text-blue" />, bg: "bg-blue-light" },
    { label: "Active", value: "5", color: "text-success", dot: "bg-success" },
    { label: "Running", value: "1", color: "text-warning", dot: "bg-warning", pulse: true },
    { label: "Idle", value: "1", color: "text-slate-500", dot: "bg-slate-300" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 px-4 flex items-center gap-3 shadow-sm hover:border-blue/20 transition-all cursor-default group">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg || "bg-slate-50"}`}>
            {stat.icon || (
              <div className="relative">
                {stat.pulse && <div className={`w-2.5 h-2.5 rounded-full absolute animate-ping opacity-75 ${stat.dot}`} />}
                <div className={`w-2.5 h-2.5 rounded-full relative ${stat.dot}`} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-slate-900 font-mono leading-none tracking-tight">{stat.value}</span>
              <span className={`text-[12px] font-semibold ${stat.color || "text-slate-500"}`}>{stat.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
