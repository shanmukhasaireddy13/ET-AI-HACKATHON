"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportHeader } from "@/components/report/report-header";
import { IdentityBar } from "@/components/report/identity-bar";
import { SummaryTab } from "@/components/report/summary-tab";
import { DecisionsTab } from "@/components/report/decisions-tab";
import { TasksTab } from "@/components/report/tasks-tab";
import { AgentRunTab } from "@/components/report/agent-run-tab";
import { TranscriptTab } from "@/components/report/transcript-tab";
import { RightSidePanel } from "@/components/report/right-side-panel";
import { TaskDrawer } from "@/components/report/task-drawer";
import { cn } from "@/lib/utils";

export default function MeetingReportPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const meetingTitle = "Engineering Planning — Q2 Kickoff";

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "decisions", label: "Decisions", count: 6 },
    { id: "tasks", label: "Tasks", count: 14 },
    { id: "agent-run", label: "Agent Run" },
    { id: "transcript", label: "Transcript" },
  ];

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Breadcrumb + Header Actions */}
        <ReportHeader title={meetingTitle} isSyncedWithJira={false} />

        {/* Identity Bar */}
        <IdentityBar 
          title={meetingTitle}
          date="Saturday, 21 March 2026"
          time="10:30 AM — 11:45 AM"
          duration="75 min"
          source="Google Meet"
          status="Complete"
          stats={{ tasks: 14, decisions: 6, assignees: 5 }}
        />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          
          {/* Left Area: Tabs */}
          <div className="min-w-0">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border-dash rounded-none mb-6 gap-6">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700"
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-1.5 text-[11px] font-bold text-slate-400">
                        ({tab.count})
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="summary" className="mt-0 focus-visible:outline-none">
                <SummaryTab />
              </TabsContent>
              
              <TabsContent value="decisions" className="mt-0 focus-visible:outline-none">
                <DecisionsTab />
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
                <div onClick={(e) => {
                  // Simulate task click logic for demo
                  const target = e.target as HTMLElement;
                  if (target.closest('tr')) {
                    handleTaskClick({
                      id: "1",
                      title: "Scale out API instances for pricing engine",
                      status: "In Progress",
                      priority: "High",
                      assignee: "Rahul Sharma",
                      due: "Mar 25"
                    });
                  }
                }}>
                  <TasksTab />
                </div>
              </TabsContent>
              
              <TabsContent value="agent-run" className="mt-0 focus-visible:outline-none">
                <AgentRunTab />
              </TabsContent>
              
              <TabsContent value="transcript" className="mt-0 focus-visible:outline-none">
                <TranscriptTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side Panel */}
          <div className="hidden lg:block">
            <RightSidePanel />
          </div>
        </div>
      </div>

      {/* Slide-out Task Detail Drawer */}
      <TaskDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        task={selectedTask} 
      />
    </div>
  );
}
