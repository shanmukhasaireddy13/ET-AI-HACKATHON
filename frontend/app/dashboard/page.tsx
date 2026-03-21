"use client";

import { 
  Mic, 
  CheckSquare, 
  ShieldAlert, 
  Bot, 
  TrendingUp, 
  Plus, 
  Calendar, 
  ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import Link from "next/link";
import { MeetingsTable } from "@/components/dashboard/meetings-table";
import { ApprovalsCard } from "@/components/dashboard/approvals-card";
import { AgentStatusPanel } from "@/components/dashboard/agent-status-panel";
import { QuickStatsMiniCharts } from "@/components/dashboard/quick-stats-mini-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-text mt-0.5">Saturday, 21 March 2026</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 bg-white border-border-dash text-[13px] text-body gap-2 px-3.5 hover:border-blue transition-all shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last 7 days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </Button>
          <Link href="/dashboard/meetings?action=upload">
            <Button className="h-9 bg-blue hover:bg-blue-hover text-white text-[13px] font-semibold gap-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" />
              New Meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Meetings This Week" 
          value="12" 
          icon={Mic} 
          trend={{ value: "+3 from last week", type: "up" }}
        />
        <StatsCard 
          label="Tasks Created" 
          value="47" 
          icon={CheckSquare} 
          trend={{ value: "+12 from last week", type: "up" }}
        />
        <StatsCard 
          label="Pending Approvals" 
          value="3" 
          icon={ShieldAlert} 
          iconColor="text-orange"
          iconBg="bg-orange-light"
          description="Needs your attention"
          urgent
        />
        <StatsCard 
          label="Active Agents" 
          value="5 / 7" 
          icon={Bot} 
          iconColor="text-success"
          iconBg="bg-success-bg"
          description="5 agents running"
        />
      </div>

      {/* Main Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <MeetingsTable />
        </div>
        <div>
          <ApprovalsCard />
        </div>
      </div>

      {/* Triple Split Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-border-dash rounded-xl overflow-hidden flex flex-col h-[400px]">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-[14px] font-semibold text-[#0F172A]">Needs Attention</h3>
             <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400"><Plus className="w-4 h-4 rotate-45" /></Button>
          </div>
          <div className="flex-1 p-0 flex flex-col">
            {[
              { id: "1", title: "Review Q2 Budget Draft", assignee: "Sarah K.", priority: "high", due: "Today" },
              { id: "2", title: "Fix API connection issue", assignee: "Rahul S.", priority: "high", due: "Overdue" },
              { id: "3", title: "Assign owners to 12 Jira tasks", assignee: "Unassigned", priority: "medium", due: "Today" },
              { id: "4", title: "Follow up with Design team", assignee: "Me", priority: "low", due: "Tomorrow" },
            ].map((task) => (
              <div key={task.id} className="relative pl-4 pr-16 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  task.priority === "high" ? "bg-error" : task.priority === "medium" ? "bg-warning" : "bg-slate-300"
                )} />
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded border-2 border-slate-200 mt-0.5 group-hover:border-blue transition-colors" />
                  <div>
                    <p className="text-[13px] font-medium text-[#334155] truncate max-w-[180px]">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.assignee}</p>
                  </div>
                </div>
                <div className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold",
                  task.due === "Overdue" ? "text-error" : task.due === "Today" ? "text-warning" : "text-slate-400"
                )}>
                  {task.due}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-dash-bg text-center">
            <Button variant="link" className="text-blue text-[12px] h-auto p-0 hover:no-underline font-medium">
              View all 47 tasks →
            </Button>
          </div>
        </div>

        <AgentStatusPanel />
        <QuickStatsMiniCharts />
      </div>

      {/* Full Width Row */}
      <ActivityFeed />
    </div>
  );
}
