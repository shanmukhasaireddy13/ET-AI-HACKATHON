"use client";

import { useState } from "react";
import { AgentHeader } from "@/components/agents/agent-header";
import { AgentToolbar } from "@/components/agents/agent-toolbar";
import { AgentStatsStrip } from "@/components/agents/agent-stats-strip";
import { AgentCard, AgentType, AgentStatus } from "@/components/agents/agent-card";

const AGENTS_DATA = [
  {
    id: "agent_001",
    name: "Transcript Parser Agent",
    type: "Parser" as AgentType,
    status: "Active" as AgentStatus,
    action: "Monitoring incoming streams...",
    metrics: { tasksDone: 1450, avgTime: "1.2s", success: "99.9%" }
  },
  {
    id: "agent_002",
    name: "Decision Extractor Agent",
    type: "Extractor" as AgentType,
    status: "Active" as AgentStatus,
    action: "Idle — waiting for next meeting",
    metrics: { tasksDone: 842, avgTime: "0.8s", success: "98.5%" }
  },
  {
    id: "agent_003",
    name: "Task Generator Agent",
    type: "Generator" as AgentType,
    status: "Running" as AgentStatus,
    action: "Processing: Engineering Planning transcript...",
    metrics: { tasksDone: 1204, avgTime: "2.1s", success: "99.1%" }
  },
  {
    id: "agent_004",
    name: "Assignment Agent",
    type: "Assignment" as AgentType,
    status: "Active" as AgentStatus,
    action: "Standby — manual review requested for 2 tasks",
    metrics: { tasksDone: 512, avgTime: "1.5s", success: "94.2%" }
  },
  {
    id: "agent_005",
    name: "Jira Integration Agent",
    type: "Integration" as AgentType,
    status: "Active" as AgentStatus,
    action: "Syncing: PROJ-102 and PROJ-105",
    metrics: { tasksDone: 2108, avgTime: "0.5s", success: "100%" }
  },
  {
    id: "agent_006",
    name: "Notification Agent",
    type: "Notification" as AgentType,
    status: "Idle" as AgentStatus,
    action: "Idle — waiting for next meeting",
    metrics: { tasksDone: 4432, avgTime: "0.1s", success: "99.9%" }
  },
  {
    id: "agent_007",
    name: "Context & Memory Agent",
    type: "Context" as AgentType,
    status: "Active" as AgentStatus,
    action: "Indexing: Meeting v102 metadata...",
    metrics: { tasksDone: 89, avgTime: "4.5s", success: "97.2%" }
  }
];

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Header Section */}
        <AgentHeader systemHealth="operational" />

        {/* Toolbar Section */}
        <AgentToolbar />

        {/* Aggregate Stats */}
        <AgentStatsStrip />

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS_DATA.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>

        {/* Empty State Mockup (Commented out) */}
        {/* 
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white/50">
          <Bot className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">No agents configured</h3>
          <p className="text-[13px] text-slate-500 mt-1">Contact support to set up agents in your workspace</p>
        </div>
        */}
      </div>
    </div>
  );
}
