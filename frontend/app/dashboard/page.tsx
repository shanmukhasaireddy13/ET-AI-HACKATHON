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
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    meetingsThisWeek: 0,
    tasksTotal: 0,
    pendingApprovals: 0,
    activeAgentsLabel: "0 / 0"
  });
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [performance, setPerformance] = useState({
    tasksCompleted: 0,
    taskGoal: 50,
    approvalRate: 0,
    approved: 0,
    rejected: 0,
    analysisTime: "45s",
    timeTrend: "↑ on track",
    integrations: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const results = await Promise.all([
        supabase.from('meetings').select('*', { count: 'exact', head: true }).gte('created_at', lastWeek.toISOString()),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('integrations').select('*'),
        supabase.from('tasks').select('*').or('priority.eq.high,status.eq.Todo').limit(4),
        supabase.from('agent_reasoning').select('*').order('created_at', { ascending: false }).limit(7),
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('agent_metrics').select('avg_time, success_rate')
      ]);

      const [meetingsRes, tasksRes, approvalsRes, integrationsRes, attentionTasksRes, reasoningRes, approvedRes, rejectedRes, metricsRes] = results as any;

      const activeIntegrations = integrationsRes.data?.filter((i: any) => i.is_connected) || [];
      const totalIntegrations = integrationsRes.data?.length || 0;

      setStats({
        meetingsThisWeek: meetingsRes.count || 0,
        tasksTotal: tasksRes.count || 0,
        pendingApprovals: approvalsRes.count || 0,
        activeAgentsLabel: `${activeIntegrations.length} / ${totalIntegrations}`
      });

      setNeedsAttention(attentionTasksRes.data || []);

      // Derive agent status
      const derivedAgents = reasoningRes.data?.map((r: any) => ({
        id: r.id,
        name: r.agent_name || "Meeting Agent",
        action: r.reasoning?.substring(0, 30) + "..." || "Idle",
        status: r.status === 'completed' ? 'active' : 'running'
      })) || [];
      setAgents(derivedAgents);

      // Performance metrics
      const metricsArr = metricsRes?.data || [];
      const avgT = metricsArr.length > 0 
        ? metricsArr.reduce((acc: number, curr: any) => acc + (curr.avg_time || 0), 0) / metricsArr.length 
        : 0;

      const approvedCount = approvedRes.count || 0;
      const rejectedCount = rejectedRes.count || 0;
      
      setPerformance(prev => ({
        ...prev,
        tasksCompleted: tasksRes.count || 0,
        approved: approvedCount,
        rejected: rejectedCount,
        approvalRate: Math.round((approvedCount / (approvedCount + rejectedCount || 1)) * 100),
        analysisTime: `${avgT.toFixed(1)}s`,
        timeTrend: avgT < 2 ? "↑ on track" : "↓ optimization needed",
        integrations: integrationsRes.data || []
      }));

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-text mt-0.5">{formattedDate}</p>
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
          value={stats.meetingsThisWeek.toString()} 
          icon={Mic} 
          trend={{ value: "Live", type: "up" }}
        />
        <StatsCard 
          label="Tasks Created" 
          value={stats.tasksTotal.toString()} 
          icon={CheckSquare} 
          trend={{ value: "Live", type: "up" }}
        />
        <StatsCard 
          label="Pending Approvals" 
          value={stats.pendingApprovals.toString()} 
          icon={ShieldAlert} 
          iconColor="text-orange"
          iconBg="bg-orange-light"
          description="Needs your attention"
          urgent={stats.pendingApprovals > 0}
        />
        <StatsCard 
          label="Active Agents" 
          value={stats.activeAgentsLabel} 
          icon={Bot} 
          iconColor="text-success"
          iconBg="bg-success-bg"
          description="System operational"
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
          <div className="flex-1 p-0 flex flex-col overflow-y-auto">
            {needsAttention.length > 0 ? needsAttention.map((task) => (
              <div key={task.id} className="relative pl-4 pr-16 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  task.priority === "high" ? "bg-error" : task.priority === "medium" ? "bg-warning" : "bg-slate-300"
                )} />
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded border-2 border-slate-200 mt-0.5 group-hover:border-blue transition-colors" />
                  <div>
                    <p className="text-[13px] font-medium text-[#334155] truncate max-w-[180px]">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.assignee || "Unassigned"}</p>
                  </div>
                </div>
                <div className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold",
                  task.priority === "high" ? "text-error" : "text-slate-400"
                )}>
                  {task.priority === "high" ? "Urgent" : "Active"}
                </div>
              </div>
            )) : (
              <div className="flex-1 flex flex-center items-center justify-center p-8 text-center text-slate-400 text-[12px]">
                No urgent tasks found.
              </div>
            )}
          </div>
          <div className="px-5 py-3 bg-dash-bg text-center">
            <Link href="/dashboard/tasks">
              <Button variant="link" className="text-blue text-[12px] h-auto p-0 hover:no-underline font-medium">
                View all tasks →
              </Button>
            </Link>
          </div>
        </div>

        <AgentStatusPanel agents={agents} />
        <QuickStatsMiniCharts stats={performance} />
      </div>

      {/* Full Width Row */}
      <ActivityFeed />
    </div>
  );
}
