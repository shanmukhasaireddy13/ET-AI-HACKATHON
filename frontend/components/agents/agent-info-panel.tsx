"use client";

import { ShieldCheck, Info, Link as LinkIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  status?: "success" | "warning" | "error";
}

function DetailRow({ label, value, status }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 px-5">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        {status && (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "success" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-error"
          )} />
        )}
        <span className="text-[13px] font-bold text-slate-700">{value}</span>
      </div>
    </div>
  );
}

export function AgentInfoPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm sticky top-[92px]">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue" />
        <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">Agent Info</h2>
      </div>

      <div className="py-2">
        <DetailRow label="Status" value="Active" status="success" />
        <DetailRow label="Type" value="Task Generator" />
        <DetailRow label="Model" value="Claude 3.5 Sonnet" />
        <DetailRow label="Version" value="v2.1.4" />
        <DetailRow label="Created" value="Jan 14, 2026" />
        <DetailRow label="Tools" value="Jira API, Email" />
        <DetailRow label="Permissions" value="Read+Write" />
        <DetailRow label="Approval" value="High Priority+" />
      </div>

      <div className="px-5 py-5 border-t border-slate-100 bg-slate-50/30">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Connected To</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-blue-light flex items-center justify-center text-[10px] font-bold text-blue">J</div>
              <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue transition-colors">Jira Enterprise</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue transition-all" />
          </div>
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-error-bg flex items-center justify-center text-[10px] font-bold text-error">S</div>
              <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue transition-colors">Slack Workspace</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue transition-all" />
          </div>
        </div>
      </div>

      <div className="p-4 px-5 bg-blue-light/30 border-t border-blue-mid/20">
        <div className="flex items-center gap-2 text-blue">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[12px] font-bold tracking-tight">Security Hardened</span>
        </div>
      </div>
    </div>
  );
}
