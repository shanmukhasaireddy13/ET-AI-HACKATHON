"use client";

import { MessageSquare, Pause, Play, FileText, Brain, ListChecks, UserCheck, Link, Bell, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import LinkNext from "next/link";

export type AgentType = "Parser" | "Extractor" | "Generator" | "Assignment" | "Integration" | "Notification" | "Context";
export type AgentStatus = "Active" | "Running" | "Idle" | "Error" | "Paused";

interface AgentCardProps {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  action: string;
  metrics: {
    tasksDone: number;
    avgTime: string;
    success: string;
  };
}

const TYPE_CONFIG = {
  Parser: { icon: FileText, color: "text-blue", bg: "bg-blue-light" },
  Extractor: { icon: Brain, color: "text-blue", bg: "bg-blue-light" },
  Generator: { icon: ListChecks, color: "text-success", bg: "bg-success-bg" },
  Assignment: { icon: UserCheck, color: "text-warning", bg: "bg-warning-bg" },
  Integration: { icon: Link, color: "text-blue", bg: "bg-blue-light" },
  Notification: { icon: Bell, color: "text-success", bg: "bg-success-bg" },
  Context: { icon: Database, color: "text-slate-500", bg: "bg-slate-50" },
};

const STATUS_CONFIG: Record<AgentStatus, { color: string; bg: string; border: string; accent: string; pulse?: boolean }> = {
  Active: { color: "text-success", bg: "bg-success-bg", border: "border-success-border", accent: "bg-success" },
  Idle: { color: "text-success", bg: "bg-success-bg", border: "border-success-border", accent: "bg-success" },
  Running: { color: "text-warning", bg: "bg-warning-bg", border: "border-warning-border", accent: "bg-warning", pulse: true },
  Error: { color: "text-error", bg: "bg-error-bg", border: "border-error-border", accent: "bg-error" },
  Paused: { color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", accent: "bg-slate-200" },
};


export function AgentCard({ id, name, type, status, action, metrics }: AgentCardProps) {
  const t = TYPE_CONFIG[type];
  const s = STATUS_CONFIG[status];
  const Icon = t.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue/30 transition-all duration-300 group">
      {/* Top Accent Bar */}
      <div className={cn("h-[3px] w-full", s.accent)} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("w-[42px] h-[42px] rounded-lg flex items-center justify-center", t.bg)}>
            <Icon className={cn("w-5 h-5", t.color)} />
          </div>

          <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold", s.bg, s.color, s.border)}>
            {s.pulse && <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", s.accent)} />}
            {status}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{name}</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">{type} Agent</p>
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="text-[12px] text-slate-400 font-medium">Now:</span>
          <p className={cn(
            "text-[12px] truncate flex-1",
            status === "Idle" ? "text-slate-400 italic" : "text-slate-600 font-medium",
            status === "Error" && "text-error"
          )}>
            {action}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-[16px] font-bold text-slate-900 font-mono tracking-tight">{metrics.tasksDone}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tasks Done</div>
          </div>
          <div>
            <div className="text-[16px] font-bold text-slate-900 font-mono tracking-tight">{metrics.avgTime}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Avg Time</div>
          </div>
          <div>
            <div className="text-[16px] font-bold text-slate-900 font-mono tracking-tight">{metrics.success}</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Success</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 flex gap-2">
        <LinkNext href={`/dashboard/agents/${id}`} className="flex-1">
          <button className="w-full h-9 bg-slate-50 border border-slate-200 rounded-md text-[12px] font-bold text-slate-600 hover:border-blue hover:text-blue transition-all">
            View Details
          </button>
        </LinkNext>
        <button className="flex-1 h-9 bg-blue-light border border-blue-mid rounded-md text-[12px] font-bold text-blue flex items-center justify-center gap-1.5 hover:bg-blue hover:text-white hover:border-blue transition-all">
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button className="w-9 h-9 border border-slate-200 rounded-md bg-white flex items-center justify-center hover:bg-slate-50 transition-all text-slate-500">
          {status === "Paused" ? <Play className="w-4 h-4 text-success" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
