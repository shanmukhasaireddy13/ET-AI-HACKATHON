"use client";

import { Check, X, ExternalLink, Bot, Calendar, User, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalPriority } from "./approval-card";

interface DetailSectionProps {
  label: string;
  children: React.ReactNode;
  border?: boolean;
}

function DetailSection({ label, children, border = true }: DetailSectionProps) {
  return (
    <div className={cn("px-5 py-4", border && "border-b border-slate-50")}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.06em] mb-2 block">{label}</label>
      {children}
    </div>
  );
}

interface ApprovalDetailPanelProps {
  approval: {
    id: string;
    priority: ApprovalPriority;
    title: string;
    fullDescription: string;
    agent: string;
    meeting: string;
    meetingDate: string;
    impact: string;
    scope: string[];
    assignees: { name: string; avatar?: string }[];
    riskLevel: string;
    riskReason: string;
    status: "pending" | "approved" | "rejected";
    decidedBy?: string;
    decidedAt?: string;
  } | null;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function ApprovalDetailPanel({ approval, onApprove, onReject, isLoading }: ApprovalDetailPanelProps) {
  if (!approval) {
    return (
      <div className="sticky top-[92px] w-[380px] bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Select an action</h3>
        <p className="text-[13px] text-slate-500 mt-2">Click on any approval card to view full context and metrics.</p>
      </div>
    );
  }

  const isPending = approval.status === "pending";

  return (
    <div className="sticky top-[92px] w-[380px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">Action Details</h2>
        <Badge variant="outline" className={cn(
          "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
          approval.priority === "Critical" ? "bg-error-bg text-error border-error-border" :
          approval.priority === "High" ? "bg-orange-light text-orange border-orange-200" :
          "bg-blue-light text-blue border-blue-mid"
        )}>
          {approval.priority}
        </Badge>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
        <DetailSection label="What will happen">
          <p className="text-[14px] font-bold text-slate-800 leading-relaxed tracking-tight">{approval.fullDescription}</p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 bg-blue-light/30 border border-blue-mid/40 rounded-lg text-[12px] font-bold text-blue tracking-tight">
            <Bot className="w-3.5 h-3.5" />
            Impact: {approval.impact}
          </div>
        </DetailSection>

        <DetailSection label="Source Context">
          <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-lg -mx-2 px-2 py-1 transition-colors">
            <div>
              <span className="text-[13px] font-bold text-blue tracking-tight flex items-center gap-1.5 underline decoration-blue/30 underline-offset-4">
                {approval.meeting}
                <ExternalLink className="w-3 h-3 text-blue/60" />
              </span>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{approval.meetingDate}</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-200" />
          </div>
        </DetailSection>

        <DetailSection label="Requested By">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 tracking-tight">{approval.agent}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest -mt-0.5">Automated Request</p>
            </div>
          </div>
        </DetailSection>

        {approval.scope.length > 0 && (
          <DetailSection label="Scope">
            <ul className="space-y-1.5">
              {approval.scope.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] font-medium text-slate-600 leading-snug">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {approval.assignees.length > 0 && (
          <DetailSection label="Assignees Affected">
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2 mr-2">
                  {approval.assignees.slice(0, 3).map((a, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm overflow-hidden">
                      {a.avatar ? <img src={a.avatar} alt={a.name} /> : a.name[0]}
                    </div>
                  ))}
                  {approval.assignees.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                      +{approval.assignees.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[13px] font-bold text-slate-700 tracking-tight">
                  {approval.assignees.map(a => a.name).join(", ").slice(0, 30)}...
                </span>
             </div>
          </DetailSection>
        )}

        <DetailSection label="Risk Level" border={false}>
          <div className="flex items-center h-7 gap-2.5 mb-2.5">
            <Badge className={cn(
              "px-3 py-1 font-bold rounded-lg text-[12px]",
              approval.riskLevel === "Critical" ? "bg-error text-white" :
              approval.riskLevel === "High" ? "bg-orange text-white" :
              approval.riskLevel === "Medium" ? "bg-blue text-white" : "bg-slate-400 text-white"
            )}>
              {approval.riskLevel} Risk
            </Badge>
          </div>
          <p className="text-[12.5px] font-medium text-slate-500 leading-relaxed italic pr-4">
            "{approval.riskReason}"
          </p>
        </DetailSection>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50">
        {isPending ? (
          <div className="flex flex-col gap-2.5">
            <Button 
               onClick={onApprove}
               disabled={isLoading}
               className="h-11 w-full bg-blue hover:bg-blue-hover text-white font-bold text-[14px] rounded-lg shadow-md shadow-blue/10 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              Approve & Execute
            </Button>
            <Button 
               variant="outline"
               onClick={onReject}
               className="h-11 w-full bg-white border-slate-200 text-error hover:bg-error-bg font-bold text-[14px] rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
              Reject Request
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Decision Log</p>
            <div className={cn(
              "p-3 rounded-xl border flex items-center gap-3",
              approval.status === "approved" ? "bg-success-bg/30 border-success-border/50" : "bg-error-bg/30 border-error-border/50"
            )}>
               <div className={cn(
                 "w-8 h-8 rounded-lg flex items-center justify-center",
                 approval.status === "approved" ? "bg-success text-white" : "bg-error text-white"
               )}>
                 {approval.status === "approved" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
               </div>
               <div>
                  <p className="text-[13px] font-bold text-slate-800 tracking-tight">Decided by {approval.decidedBy}</p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest -mt-0.5">{approval.decidedAt}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
