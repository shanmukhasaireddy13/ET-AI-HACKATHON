"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function QuickStatsMiniCharts({ 
  stats = { tasksCompleted: 0, taskGoal: 50, approvalRate: 0, approved: 0, rejected: 0, analysisTime: "0s", timeTrend: "vs last week" } 
}: { stats?: any }) {
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
            <span className="text-[14px] font-bold text-[#0F172A] font-mono-data">{stats.tasksCompleted}</span>
          </div>
          <Progress value={(stats.tasksCompleted / stats.taskGoal) * 100} className="h-1.5 bg-slate-100" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{Math.round((stats.tasksCompleted / stats.taskGoal) * 100)}% of goal</span>
            <span>{stats.tasksCompleted} of {stats.taskGoal}</span>
          </div>
        </div>

        {/* Row 2: Approval Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-medium text-slate-400">Approval Rate</span>
            <span className="text-[14px] font-bold text-success font-mono-data">{stats.approvalRate}%</span>
          </div>
          <Progress value={stats.approvalRate} className="h-1.5 bg-slate-100 indicator-success" />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{stats.approved} approved</span>
            <span>{stats.rejected} rejected</span>
          </div>
        </div>

        {/* Row 3: Avg Analysis Time */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[12px] font-medium text-slate-400">Avg Analysis Time</span>
            <span className="text-[14px] font-bold text-[#0F172A] font-mono-data">{stats.analysisTime}</span>
          </div>
          <Progress value={48} className="h-1.5 bg-slate-100" />
          <div className="flex justify-between text-[11px] text-success font-bold">
            <span>{stats.timeTrend}</span>
          </div>
        </div>

        <div className="h-px bg-slate-50 my-2" />

        {/* Integration Health */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Integration Health</span>
          <div className="flex flex-wrap gap-4">
            {stats.integrations && stats.integrations.length > 0 ? stats.integrations.map((integration: any) => (
              <div key={integration.id} className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  integration.is_connected ? "bg-success" : "bg-slate-300"
                )} />
                <span className="text-[12px] font-medium text-body">{integration.name}</span>
              </div>
            )) : (
              <span className="text-[12px] text-slate-400">No integrations</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
