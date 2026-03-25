"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function MeetingReportPage() {
  const params = useParams();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [keyTopics, setKeyTopics] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [reasoning, setReasoning] = useState<any[]>([]);
  const [trace, setTrace] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!meetingId) return;
      
      try {
        setLoading(true);
        
        // Fetch Meeting
        const { data: meetingData } = await supabase
          .from("meetings")
          .select("*")
          .eq("id", meetingId)
          .single();
        
        if (meetingData) setMeeting(meetingData);

        // Fetch Related Data
        const [tasksRes, approvalsRes, reasoningRes, traceRes, decisionsRes, topicsRes, followupsRes] = await Promise.all([
          supabase.from("tasks").select("*").eq("meeting_id", meetingId),
          supabase.from("approvals").select("*").eq("meeting_id", meetingId),
          supabase.from("agent_reasoning").select("*").eq("meeting_id", meetingId),
          supabase.from("agent_execution_steps").select("*").eq("meeting_id", meetingId).order("step_index", { ascending: true }),
          supabase.from("decisions").select("*").eq("meeting_id", meetingId),
          supabase.from("key_topics").select("*").eq("meeting_id", meetingId),
          supabase.from("followups").select("*").eq("meeting_id", meetingId)
        ]);

        if (tasksRes.data) setTasks(tasksRes.data);
        if (approvalsRes.data) setApprovals(approvalsRes.data);
        if (reasoningRes.data) setReasoning(reasoningRes.data);
        if (traceRes.data) setTrace(traceRes.data);
        if (decisionsRes.data) setDecisions(decisionsRes.data);
        if (topicsRes.data) setKeyTopics(topicsRes.data);
        if (followupsRes.data) setFollowups(followupsRes.data);

      } catch (error) {
        console.error("Error fetching meeting details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dash-bg flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-blue animate-spin" />
        <p className="text-[14px] font-medium text-slate-500">Loading meeting report...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-dash-bg flex flex-col items-center justify-center gap-4">
        <p className="text-[14px] font-medium text-slate-500">Meeting report not found.</p>
      </div>
    );
  }

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "decisions", label: "Decisions", count: decisions.length },
    { id: "tasks", label: "Tasks", count: tasks.length },
    { id: "agent-run", label: "Agent Run" },
    { id: "transcript", label: "Transcript" },
  ];

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const formattedDate = new Date(meeting.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedTime = new Date(meeting.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Breadcrumb + Header Actions */}
        <ReportHeader title={meeting.title} isSyncedWithJira={false} />

        {/* Identity Bar */}
        <IdentityBar 
          title={meeting.title}
          date={formattedDate}
          time={`${formattedTime} — ${meeting.duration || 'N/A'}`}
          duration={meeting.duration || 'N/A'}
          source={meeting.source || "Unknown"}
          status={meeting.status || "Complete"}
          stats={{ tasks: tasks.length, decisions: decisions.length, assignees: 1 }}
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
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1.5 text-[11px] font-bold text-slate-400">
                        ({tab.count})
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="summary" className="mt-0 focus-visible:outline-none">
                <SummaryTab summary={meeting.summary} stats={{ tasks: tasks.length, decisions: decisions.length, followups: followups.length }} keyTopics={keyTopics} />
              </TabsContent>
              
              <TabsContent value="decisions" className="mt-0 focus-visible:outline-none">
                <DecisionsTab decisions={decisions} />
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
                <div onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('tr')) {
                    // Logic to find the clicked task from the rows could be added here if needed
                  }
                }}>
                  <TasksTab tasks={tasks} />
                </div>
              </TabsContent>
              
              <TabsContent value="agent-run" className="mt-0 focus-visible:outline-none">
                <AgentRunTab reasoning={reasoning} trace={trace} />
              </TabsContent>
              
              <TabsContent value="transcript" className="mt-0 focus-visible:outline-none">
                <TranscriptTab transcript={meeting.transcript} />
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
