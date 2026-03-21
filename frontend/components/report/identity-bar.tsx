"use client";

import { Calendar, Clock, Video, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IdentityBarProps {
  title: string;
  date: string;
  time: string;
  duration: string;
  source: string;
  status: "Complete" | "Analysing" | "Failed";
  stats: {
    tasks: number;
    decisions: number;
    assignees: number;
  };
}

export function IdentityBar({ 
  title, 
  date, 
  time, 
  duration, 
  source, 
  status, 
  stats 
}: IdentityBarProps) {
  return (
    <div className="bg-white border border-border-dash rounded-[10px] p-5 mb-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Title & Meta */}
        <div className="flex-1">
          <h1 className="text-[18px] font-bold text-[#0F172A] tracking-tight">{title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5">
            <div className="flex items-center gap-1.5 text-[13px] text-muted-text">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-text">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{time} ({duration})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-text">
              <Video className="w-3.5 h-3.5 text-slate-400" />
              <span>via {source}</span>
            </div>
          </div>
        </div>

        {/* Center: Participants */}
        <div className="shrink-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Participants</p>
          <div className="flex items-center -space-x-2">
            <TooltipProvider>
              {[
                { name: "John Doe", role: "Manager", initial: "JD" },
                { name: "Sarah Smith", role: "Designer", initial: "SS" },
                { name: "Rahul Kumar", role: "Developer", initial: "RK" },
                { name: "Elena Vogt", role: "Product", initial: "EV" },
                { name: "Mike Ross", role: "Legal", initial: "MR" },
              ].map((p, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger>
                    <div className="w-8 h-8 rounded-full bg-blue-light text-blue flex items-center justify-center font-bold text-[12px] ring-2 ring-white shadow-sm cursor-help transition-transform hover:scale-110 hover:z-10 relative">
                      {p.initial}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-border-dash shadow-lg p-2 rounded-lg">
                    <p className="text-[12px] font-semibold text-black">{p.name}</p>
                    <p className="text-[10px] text-muted-text">{p.role}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[11px] ring-2 ring-white shadow-sm">
                +3
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Right: Status & Quick Stats */}
        <div className="flex items-center gap-6 shrink-0 lg:ml-4">
          <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
            <StatusBadge status={status} />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[22px] font-bold text-[#0F172A] font-mono-data leading-none">{stats.tasks}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tasks</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[22px] font-bold text-[#0F172A] font-mono-data leading-none">{stats.decisions}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Decisions</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[22px] font-bold text-[#0F172A] font-mono-data leading-none">{stats.assignees}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assignees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Analysing":
      return (
        <Badge variant="outline" className="bg-warning-bg text-warning border-warning-border rounded-full px-3.5 py-1 text-[13px] font-bold gap-2 overflow-hidden ring-0">
          <Loader2 className="w-4 h-4 animate-spin" />
          {status}
        </Badge>
      );
    case "Complete":
      return (
        <Badge variant="outline" className="bg-success-bg text-success border-success-border rounded-full px-3.5 py-1 text-[13px] font-bold gap-2 ring-0">
          <CheckCircle2 className="w-4 h-4" />
          {status}
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="outline" className="bg-error-bg text-error border-error-border rounded-full px-3.5 py-1 text-[13px] font-bold gap-2 ring-0">
          <XCircle className="w-4 h-4" />
          {status}
        </Badge>
      );
    default:
      return null;
  }
}
