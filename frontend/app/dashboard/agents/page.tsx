"use client";

import { useState, useEffect } from "react";
import { AgentHeader } from "@/components/agents/agent-header";
import { AgentToolbar } from "@/components/agents/agent-toolbar";
import { AgentStatsStrip } from "@/components/agents/agent-stats-strip";
import { AgentCard, AgentType, AgentStatus } from "@/components/agents/agent-card";
import { Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAgents() {
      // 1. Fetch latest reasoning to see what agents are "Running"
      const { data: reasoning } = await supabase
        .from('agent_reasoning')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Fetch integrations to see status
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*');

      // 3. Fetch Agents and their Metrics
      const { data: dbAgents } = await supabase
        .from('agents')
        .select('*, agent_metrics(*)');

      const runningAgents = new Set(reasoning?.map(r => r.agent_name || r.agent));
      const connectedIntegrations = new Set(integrations?.filter(i => i.status === 'connected').map(i => i.service_name || i.name));

      if (dbAgents) {
        const formatted = dbAgents.map(a => {
          const metrics = a.agent_metrics?.[0] || { tasks_done: 0, avg_response_time: 0, success_rate: 100 };
          const isRunning = runningAgents.has(a.name) || runningAgents.has(a.id);
          const isIntegration = a.type === "Integration";
          
          // Slack and Jira check
          const integrationKey = a.name.replace(" Agent", "");
          const isConnected = isIntegration ? connectedIntegrations.has(integrationKey) : true;

          return {
            id: a.id,
            name: a.name,
            type: a.type as AgentType,
            status: (isRunning ? "Running" : isConnected ? "Active" : "Idle") as AgentStatus,
            action: isRunning ? "Processing latest stream..." : isConnected ? "Idle — waiting for next meeting" : "Requires integration setup",
            metrics: {
              tasksDone: metrics.tasks_done,
              avgTime: `${metrics.avg_response_time}s`,
              success: `${metrics.success_rate}%`
            }
          };
        });
        setAgents(formatted);
      }
      setLoading(false);
    }

    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Header Section */}
        <AgentHeader systemHealth="operational" />

        {/* Toolbar Section */}
        <AgentToolbar />

        {/* Aggregate Stats */}
        <AgentStatsStrip stats={[
          { label: "Total Agents", value: agents.length.toString(), icon: <Bot className="w-4 h-4 text-blue" />, bg: "bg-blue-light" },
          { label: "Active", value: agents.filter(a => a.status === "Active").length.toString(), color: "text-success", dot: "bg-success" },
          { label: "Running", value: agents.filter(a => a.status === "Running").length.toString(), color: "text-warning", dot: "bg-warning", pulse: true },
          { label: "Idle", value: agents.filter(a => a.status === "Idle").length.toString(), color: "text-slate-500", dot: "bg-slate-300" },
        ]} />

        {/* Grid Section */}
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard key={agent.id} {...agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
