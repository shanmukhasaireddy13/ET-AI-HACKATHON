"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentIdentityHeader } from "@/components/agents/agent-identity-header";
import { AgentInfoPanel } from "@/components/agents/agent-info-panel";
import { ActivityLogTab } from "@/components/agents/activity-log-tab";
import { PerformanceTab } from "@/components/agents/performance-tab";
import { ConfigTab } from "@/components/agents/config-tab";
import { ApprovalsTab } from "@/components/agents/approvals-tab";
import { AgentChatPanel } from "@/components/agents/agent-chat-panel";
import { ChevronRight, Home } from "lucide-react";
import LinkNext from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

export default function AgentDetailPage() {
  const params = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchAgentData() {
      const id = params.id as string;
      setLoading(true);
      
      // 1. Fetch Agent Metadata and Metrics
      const { data: agent, error: aError } = await supabase
        .from('agents')
        .select('*, agent_metrics(*)')
        .eq('id', id)
        .single();

      if (aError || !agent) {
        setLoading(false);
        return;
      }

      // 2. Fetch real data (Logs, Tasks counts, etc)
      const [reasoningRes, approvalsRes] = await Promise.all([
        supabase.from('agent_reasoning')
          .select('*')
          .or(`agent_name.eq."${agent.name}",agent_name.eq."${agent.id}"`)
          .order('created_at', { ascending: false }),
        supabase.from('approvals')
          .select('*', { count: 'exact', head: true })
          .eq('source_agent', agent.name)
      ]);

      const reasoningData = reasoningRes.data || [];
      const metrics = agent.agent_metrics?.[0] || { tasks_done: 0, success_rate: 100, avg_response_time: 0 };

      const lastActive = reasoningData.length > 0 
        ? format(new Date(reasoningData[0].created_at), 'MMM dd · HH:mm')
        : metrics.last_active_at ? format(new Date(metrics.last_active_at), 'MMM dd · HH:mm') : "No activity";

      const formattedAgent = {
        id,
        name: agent.name,
        type: agent.type,
        metrics: {
          total: metrics.tasks_done.toString(),
          successRate: `${metrics.success_rate}%`,
          avgTime: `${metrics.avg_response_time}s`,
          lastActive,
          model: agent.model || "Unknown",
          version: agent.version || "v1.0.0",
          tools: agent.tools?.join(", ") || "None",
          created: format(new Date(agent.created_at), 'MMM dd, yyyy')
        }
      };

      setAgentData(formattedAgent);

      const formattedLogs = reasoningData.slice(0, 20).map((r: any) => ({
        id: r.id,
        level: r.status === "failed" ? "Error" : r.status === "running" ? "Warning" : "Success",
        timestamp: format(new Date(r.created_at), 'MMM dd · HH:mm:ss'),
        action: r.reasoning?.substring(0, 100) + (r.reasoning?.length > 100 ? '...' : ''),
        input: r.context_data ? JSON.stringify(r.context_data, null, 2) : "No context provided",
        output: r.reasoning,
        duration: "1.2s",
        status: r.status === "completed" ? "Complete" : r.status === "failed" ? "Failed" : "Active"
      }));
      setLogs(formattedLogs);
      setLoading(false);
    }
    
    if (params?.id) {
      fetchAgentData();
    }
  }, [params]);

  if (loading || !agentData) {
    return (
      <div className="flex justify-center py-20 bg-dash-bg min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Breadcrumb Row */}
        <div className="flex items-center gap-2 mb-6 text-[13px] font-medium">
          <LinkNext href="/dashboard/agents" className="text-slate-400 hover:text-blue transition-colors flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            Agents
          </LinkNext>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{agentData.name}</span>
        </div>

        {/* Identity Header */}
        <div onClick={(e) => {
          // Check if clicked button is chat
          if ((e.target as HTMLElement).innerText?.includes("Chat")) {
            setIsChatOpen(true);
          }
        }}>
          <AgentIdentityHeader {...agentData} />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-[260px_1fr] gap-6 items-start">
          
          {/* Left: Info Panel */}
          <AgentInfoPanel agent={agentData} />

          {/* Right: Tabs */}
          <div className="min-w-0">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border-dash rounded-none mb-6 gap-6">
                <TabsTrigger value="activity" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700">
                  Activity Log
                </TabsTrigger>
                <TabsTrigger value="performance" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="config" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700">
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="approvals" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700">
                  Approvals History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
                <ActivityLogTab logs={logs} />
              </TabsContent>
              <TabsContent value="performance" className="mt-0 focus-visible:outline-none">
                <PerformanceTab agentName={agentData.name} />
              </TabsContent>
              <TabsContent value="config" className="mt-0 focus-visible:outline-none">
                <ConfigTab agentName={agentData.name} />
              </TabsContent>
              <TabsContent value="approvals" className="mt-0 focus-visible:outline-none">
                <ApprovalsTab agentName={agentData.name} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Global Chat Panel */}
      <AgentChatPanel 
        open={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        agentName={agentData.name}
        agentType={agentData.type === "Generator" ? "Generator Agent" : "AI Agent"}
        status="active"
      />
    </div>
  );
}
