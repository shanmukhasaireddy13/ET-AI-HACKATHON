"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function QuickStatsMiniCharts() {
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">This Week</h3>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* Row 1: Tasks Completed */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-medium text-slate-400">Tasks Completed</span>
            <span className="text-[14px] font-bold text-[#0F172A] font-mono-data">34</span>
          </div>
          <Progress value={68} className="h-1.5 bg-slate-100" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>68% of goal</span>
            <span>34 of 50</span>
          </div>
        </div>

        {/* Row 2: Approval Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-medium text-slate-400">Approval Rate</span>
            <span className="text-[14px] font-bold text-success font-mono-data">91%</span>
          </div>
          <Progress value={91} className="h-1.5 bg-slate-100 indicator-success" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>31 approved</span>
            <span>3 rejected</span>
          </div>
        </div>

        {/* Row 3: Avg Analysis Time */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-medium text-slate-400">Avg Analysis Time</span>
            <span className="text-[14px] font-bold text-[#0F172A] font-mono-data">58s</span>
          </div>
          <Progress value={48} className="h-1.5 bg-slate-100" />
          <div className="flex justify-between text-[11px] text-success font-bold">
            <span>↓ 12s faster</span>
            <span className="text-slate-400 font-normal">vs last week</span>
          </div>
        </div>

        <div className="h-px bg-slate-50 my-2" />

        {/* Integration Health */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Integration Health</span>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[12px] font-medium text-body">Jira</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[12px] font-medium text-body">Slack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-[12px] font-medium text-body">Email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
