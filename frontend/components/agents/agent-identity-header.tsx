"use client";

import { MessageSquare, Pause, MoreHorizontal, FileText, Brain, ListChecks, UserCheck, Link, Bell, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentType } from "./agent-card";

const TYPE_CONFIG = {
  Parser: { icon: FileText, color: "text-blue", bg: "bg-blue-light" },
  Extractor: { icon: Brain, color: "text-blue", bg: "bg-blue-light" },
  Generator: { icon: ListChecks, color: "text-success", bg: "bg-success-bg" },
  Assignment: { icon: UserCheck, color: "text-warning", bg: "bg-warning-bg" },
  Integration: { icon: Link, color: "text-blue", bg: "bg-blue-light" },
  Notification: { icon: Bell, color: "text-success", bg: "bg-success-bg" },
  Context: { icon: Database, color: "text-slate-500", bg: "bg-slate-50" },
};

interface AgentIdentityHeaderProps {
  name: string;
  type: AgentType;
  id: string;
  metrics: {
    total: string;
    successRate: string;
    avgTime: string;
    lastActive: string;
  };
}

export function AgentIdentityHeader({ name, type, id, metrics }: AgentIdentityHeaderProps) {
  const t = TYPE_CONFIG[type];
  const Icon = t.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 px-8 mb-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <div className={cn("w-[64px] h-[64px] rounded-2xl flex items-center justify-center", t.bg)}>
          <Icon className={cn("w-8 h-8", t.color)} />
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-bold px-2 py-0.5 text-[11px]">
              {type} Agent
            </Badge>
            <span className="text-[12px] text-slate-400 font-mono font-medium">ID: {id}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12">
        <div className="flex flex-col">
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tighter leading-none">{metrics.total}</span>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Tasks Done</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[22px] font-bold text-success font-mono tracking-tighter leading-none">{metrics.successRate}</span>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Success Rate</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[22px] font-bold text-slate-900 font-mono tracking-tighter leading-none">{metrics.avgTime}</span>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Avg Time</span>
        </div>
        <div className="flex flex-col border-l border-slate-100 pl-12">
          <span className="text-[13px] font-bold text-slate-700 leading-none">{metrics.lastActive}</span>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Last Active</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button className="h-10 bg-blue hover:bg-blue-hover text-white px-5 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95">
          <MessageSquare className="w-4 h-4" />
          Chat with Agent
        </Button>
        <Button variant="outline" className="h-10 border-slate-200 text-slate-600 hover:border-warning hover:text-warning gap-2 px-4 rounded-lg transition-all">
          <Pause className="w-4 h-4" />
          Pause Agent
        </Button>
        <Button variant="outline" className="h-10 w-10 border-slate-200 p-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
