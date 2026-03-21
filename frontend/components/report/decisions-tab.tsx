"use client";

import { User, Clock, Plus, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DECISIONS = [
  {
    id: 1,
    priority: "Critical",
    confidence: 94,
    text: "Adopt micro-services architecture for the new billing module to improve scalability and fault tolerance.",
    decidedBy: "Rahul, Priya",
    timestamp: "32:14",
    status: "pending"
  },
  {
    id: 2,
    priority: "High",
    confidence: 88,
    text: "Deprecate the legacy V1 API by the end of Q2 and transition all internal services to the GraphQL gateway.",
    decidedBy: "John Doe",
    timestamp: "14:05",
    status: "reviewed"
  },
  {
    id: 3,
    priority: "Normal",
    confidence: 92,
    text: "Implement a standardized logging format across all backend services using OpenTelemetry.",
    decidedBy: "Sarah, Mike",
    timestamp: "45:22",
    status: "pending"
  }
];

export function DecisionsTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted-text">
          <span className="font-bold text-[#0F172A]">{DECISIONS.length}</span> decisions extracted
        </p>
        <div className="flex items-center gap-1.5 p-1 bg-dash-bg rounded-full border border-border-dash">
          {["All", "Critical", "High", "Normal"].map((filter, i) => (
            <button
              key={filter}
              className={cn(
                "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all",
                i === 0 ? "bg-white shadow-sm text-blue border border-blue/10" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {DECISIONS.map((decision) => (
          <div 
            key={decision.id} 
            className={cn(
              "bg-white border rounded-[10px] p-5 relative overflow-hidden transition-all hover:shadow-md",
              decision.priority === "Critical" ? "border-l-[3px] border-l-error border-border-dash" : 
              decision.priority === "High" ? "border-l-[3px] border-l-warning border-border-dash" : 
              "border-l-[3px] border-l-blue border-border-dash"
            )}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <Badge 
                variant="outline" 
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                  decision.priority === "Critical" ? "bg-error-bg text-error border-error-border" :
                  decision.priority === "High" ? "bg-warning-bg text-warning border-warning-border" :
                  "bg-blue-light text-blue border-blue-mid"
                )}
              >
                {decision.priority}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{decision.confidence}% confidence</span>
                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success" 
                    style={{ width: `${decision.confidence}%` }} 
                  />
                </div>
              </div>
            </div>

            <p className="text-[14px] font-medium text-[#0F172A] leading-[1.6] mb-3">
              {decision.text}
            </p>

            <div className="flex items-center gap-5 text-[12px] text-muted-text mb-4">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Decided by: <span className="font-semibold text-slate-500">{decision.decidedBy}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>~{decision.timestamp} in transcript</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-[12px] font-bold text-blue hover:underline transition-all group">
                  <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                  Create Task from this
                </button>
                <button className={cn(
                  "flex items-center gap-1.5 text-[12px] font-bold transition-all group",
                  decision.status === "reviewed" ? "text-success" : "text-muted-text hover:text-success"
                )}>
                  <Check className={cn("w-3.5 h-3.5 transition-transform", decision.status === "reviewed" ? "" : "group-hover:scale-125")} />
                  {decision.status === "reviewed" ? "Reviewed" : "Mark as Reviewed"}
                </button>
              </div>
              <button className="p-1.5 text-slate-300 hover:text-blue hover:bg-blue-light rounded-md transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 pb-2 text-center">
        <button className="text-[13px] font-semibold text-blue hover:underline">
          View all decisions in transcript →
        </button>
      </div>
    </div>
  );
}
