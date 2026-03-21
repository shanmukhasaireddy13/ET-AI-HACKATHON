"use client";

import { Check, X, Timer, Calendar, User, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ApprovalPriority = "Critical" | "High" | "Medium" | "Low";

interface ApprovalCardProps {
  id: string;
  priority: ApprovalPriority;
  agentName: string;
  timestamp: string;
  expiresIn?: string;
  title: string;
  description: string;
  context: {
    meeting: string;
    assignee?: { name: string; avatar?: string };
    scope?: string;
  };
  isSelected?: boolean;
  onClick?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

const PRIORITY_CONFIG = {
  Critical: { bar: "bg-error", badge: "bg-error-bg text-error border-error-border" },
  High: { bar: "bg-orange", badge: "bg-orange-light text-orange border-orange-200" },
  Medium: { bar: "bg-blue", badge: "bg-blue-light text-blue border-blue-mid" },
  Low: { bar: "bg-slate-400", badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

export function ApprovalCard({
  priority,
  agentName,
  timestamp,
  expiresIn,
  title,
  description,
  context,
  isSelected,
  onClick,
  onApprove,
  onReject,
  isLoading
}: ApprovalCardProps) {
  const p = PRIORITY_CONFIG[priority];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group shadow-sm pl-[18px]",
        isSelected ? "border-blue ring-4 ring-blue-light/50 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      )}
    >
      {/* Accent Bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[4px]", p.bar)} />

      {/* Header Row */}
      <div className="pt-3.5 pr-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", p.badge)}>
            {priority}
          </Badge>
          <span className="text-[12.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
            {agentName}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {expiresIn && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-error-bg rounded-md border border-error-border animate-pulse">
              <Timer className="w-3 h-3 text-error" />
              <span className="text-[11px] font-bold text-error">Expires in {expiresIn}</span>
            </div>
          )}
          <span className="text-[12px] text-slate-400 font-medium font-mono tracking-tight">{timestamp}</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mt-2.5 pr-6">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug pr-4">{title}</h3>
        <p className="text-[13px] text-slate-500 mt-1 line-clamp-1 pr-10 font-medium">{description}</p>
      </div>

      {/* Context Chips */}
      <div className="mt-3 flex gap-2 flex-wrap pr-6">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 transition-colors hover:bg-white hover:border-blue/30 group-hover:text-slate-900 shadow-sm">
          <Calendar className="w-3 h-3 text-slate-300" />
          {context.meeting}
        </div>
        {context.assignee && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-white transition-colors shadow-sm">
            <User className="w-3 h-3 text-slate-300" />
            {context.assignee.name}
          </div>
        )}
        {context.scope && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 shadow-sm">
            {context.scope}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 p-3.5 px-4 bg-slate-50/10 border-t border-slate-50 flex items-center justify-between group-hover:bg-white transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Button 
            onClick={(e) => { e.stopPropagation(); onApprove?.(); }}
            disabled={isLoading}
            className="h-8.5 px-4 bg-success-bg border border-success-border text-success hover:bg-success hover:text-white font-bold text-[13px] rounded-lg shadow-sm transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Approve
          </Button>
          <Button 
             onClick={(e) => { e.stopPropagation(); onReject?.(); }}
             variant="outline"
             className="h-8.5 px-4 bg-error-bg border border-error-border text-error hover:bg-error hover:text-white font-bold text-[13px] rounded-lg shadow-sm transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </Button>
        </div>

        <button className="text-[12px] font-bold text-blue hover:underline tracking-tight opacity-100 group-hover:opacity-100 transition-all flex items-center gap-1">
          View Details →
        </button>
      </div>
    </div>
  );
}
