"use client";

import { useState } from "react";
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

export default function AgentDetailPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const agentData = {
    id: "agent_003",
    name: "Task Generator Agent",
    type: "Generator" as const,
    metrics: {
      total: "1,204",
      successRate: "99.1%",
      avgTime: "2.1s",
      lastActive: "Mar 21, 10:47"
    }
  };

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
          <AgentInfoPanel />

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
                <ActivityLogTab />
              </TabsContent>
              <TabsContent value="performance" className="mt-0 focus-visible:outline-none">
                <PerformanceTab />
              </TabsContent>
              <TabsContent value="config" className="mt-0 focus-visible:outline-none">
                <ConfigTab />
              </TabsContent>
              <TabsContent value="approvals" className="mt-0 focus-visible:outline-none">
                <ApprovalsTab />
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
