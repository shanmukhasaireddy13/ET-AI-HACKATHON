"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalHeader } from "@/components/approvals/approval-header";
import { ApprovalStatsStrip } from "@/components/approvals/approval-stats-strip";
import { ApprovalAlertBanner } from "@/components/approvals/approval-alert-banner";
import { ApprovalCard, ApprovalPriority } from "@/components/approvals/approval-card";
import { ApprovalHistoryTable } from "@/components/approvals/approval-history-table";
import { ApprovalDetailPanel } from "@/components/approvals/approval-detail-panel";
import { CriticalActionDialog } from "@/components/approvals/critical-action-dialog";
import { RejectReasonPopover } from "@/components/approvals/reject-reason-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const INITIAL_PENDING = [
  {
    id: "ap_001",
    priority: "Critical" as ApprovalPriority,
    agentName: "Jira Integration Agent",
    timestamp: "2 min ago",
    expiresIn: "8m",
    title: "Create Jira Epic 'Q4 Backend Overhaul'",
    description: "Create Jira Epic 'Q4 Backend Overhaul' and assign to Rahul Sharma with 14 subtasks",
    context: {
      meeting: "Engineering Planning Q2",
      assignee: { name: "Rahul Sharma" },
      scope: "EPIC-342, 14 Stories"
    },
    fullDescription: "The Jira Integration Agent requests permission to create a high-level Epic in the 'PROJ' board for the backend overhaul discussed in the Q2 planning meeting. This includes 14 pre-populated story tickets with descriptions, labels, and initial estimates based on the transcript.",
    agent: "Jira Integration Agent v2.1",
    meetingDate: "Mar 21, 2026",
    impact: "Creates 1 Jira Epic + 14 subtask tickets",
    scope: [
      "Epic Title: Q4 Backend Overhaul",
      "Project: Infrastructure (INFRA)",
      "Assignee: Rahul Sharma",
      "Sprint: Q2 2026 - Sprint 3",
      "Labels: backend, critical-path, api-v3"
    ],
    assignees: [{ name: "Rahul Sharma" }, { name: "Priya Singh" }],
    riskLevel: "Critical",
    riskReason: "Creates multiple public tickets and notifies stakeholders across the channel.",
    status: "pending" as const
  },
  {
    id: "ap_002",
    priority: "High" as ApprovalPriority,
    agentName: "Task Generator Agent",
    timestamp: "15 min ago",
    title: "Assign 8 tasks to Backend Team",
    description: "Bulk assignment of extracted tasks from 'Security Sync' to backend developers.",
    context: {
      meeting: "Security Sync",
      assignee: { name: "Backend Team" },
    },
    fullDescription: "Assign 8 technical debt and security hardening tasks to the backend team. These were identified during the Security Sync meeting as blockers for the API v3 launch.",
    agent: "Task Generator Agent v1.4",
    meetingDate: "Mar 21, 2026",
    impact: "Notifies 4 team members via Slack",
    scope: [
      "Task: Implement OAuth2 validation",
      "Task: Rotate database credentials",
      "Task: Update firewall rules",
      "Assignee: Lead Backend Eng"
    ],
    assignees: [{ name: "David Wu" }, { name: "Sarah Connor" }, { name: "Kyle Reese" }],
    riskLevel: "High",
    riskReason: "Batch reassignment can clutter developer notification streams if done incorrectly.",
    status: "pending" as const
  },
  {
    id: "ap_003",
    priority: "Medium" as ApprovalPriority,
    agentName: "Email Agent",
    timestamp: "1h ago",
    title: "Send Meeting Summary to Stakeholders",
    description: "Email the AI-generated summary of 'Weekly Ops' to 12 external stakeholders.",
    context: {
      meeting: "Weekly Ops",
      scope: "12 recipients"
    },
    fullDescription: "Send a formalized meeting summary email to the external steering committee and investors. Context extracted from 'Weekly Ops' highlights.",
    agent: "Email Agent v0.9",
    meetingDate: "Mar 20, 2026",
    impact: "Sends 12 external emails",
    scope: [
      "Recipient: Steering Committee",
      "Content: Ops Summary v1.2",
      "Attachment: Decisions_Log.pdf"
    ],
    assignees: [],
    riskLevel: "Medium",
    riskReason: "External communications require human verification of AI tone and accuracy.",
    status: "pending" as const
  }
];

export default function ApprovalsPage() {
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCriticalDialogOpen, setIsCriticalDialogOpen] = useState(false);
  const [isRejectPopoverOpen, setIsRejectPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedApproval = pending.find(a => a.id === selectedId) || null;

  const handleApprove = (id: string) => {
    const item = pending.find(p => p.id === id);
    if (item?.priority === "Critical") {
      setIsCriticalDialogOpen(true);
      return;
    }
    executeApprove(id);
  };

  const executeApprove = (id: string) => {
    setIsLoading(true);
    // Mock API delay
    setTimeout(() => {
      setPending(prev => prev.filter(p => p.id !== id));
      setSelectedId(null);
      setIsLoading(false);
      setIsCriticalDialogOpen(false);
      console.log("Action approved — agent is now executing");
    }, 800);
  };

  const handleReject = (id: string) => {
    setIsRejectPopoverOpen(true);
  };

  const executeReject = (id: string, reason: string) => {
    setIsLoading(true);
    setTimeout(() => {
       setPending(prev => prev.filter(p => p.id !== id));
       setSelectedId(null);
       setIsLoading(false);
       setIsRejectPopoverOpen(false);
       console.log("Action rejected", reason);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Header Section */}
        <ApprovalHeader pendingCount={pending.length} />

        {/* Stats Strip */}
        <ApprovalStatsStrip />

        {/* Alert Banner */}
        {pending.length > 0 && <ApprovalAlertBanner />}

        {/* Tabs Section */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border-dash rounded-none mb-5 gap-8">
            <TabsTrigger value="pending" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-blue data-[state=active]:border-blue data-[state=active]:font-bold transition-all hover:text-slate-700">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-success data-[state=active]:border-success data-[state=active]:font-bold transition-all hover:text-slate-700">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="h-11 px-0 text-[14px] font-medium text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-error data-[state=active]:border-error data-[state=active]:font-bold transition-all hover:text-slate-700">
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-[1fr_380px] gap-5 items-start">
              
              {/* Left Column: Pending List */}
              <div className="space-y-4 pr-1">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{pending.length} pending actions</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {pending.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ 
                          opacity: 0, 
                          x: 20,
                          transition: { duration: 0.3 } 
                        }}
                      >
                        <ApprovalCard 
                          {...item} 
                          isSelected={selectedId === item.id}
                          onClick={() => setSelectedId(item.id)}
                          onApprove={() => handleApprove(item.id)}
                          onReject={() => handleReject(item.id)}
                          isLoading={isLoading && selectedId === item.id}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                   {pending.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white/50 animate-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mb-4 shadow-sm border border-success-border/50">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                      </div>
                      <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">You're all caught up!</h3>
                      <p className="text-[13px] text-slate-500 mt-1">No pending agent actions require your review.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detail Panel */}
              <div className="relative h-full">
                <div 
                  onClick={(e) => {
                     // Check if button is reject
                     if ((e.target as HTMLElement).innerText?.includes("Reject")) {
                       handleReject(selectedId!);
                     }
                  }}
                >
                  <ApprovalDetailPanel 
                    approval={selectedApproval ? {
                      ...selectedApproval,
                      meeting: selectedApproval.context.meeting,
                      // Ensure other required fields exist
                    } : null} 
                    onApprove={() => handleApprove(selectedId!)}

                    onReject={() => handleReject(selectedId!)}
                    isLoading={isLoading}
                  />
                </div>

                {/* Reject Popover Logic - Simple overlay for demo */}
                {isRejectPopoverOpen && selectedId && (
                  <div className="absolute bottom-[20px] right-[20px] z-[70]">
                    <RejectReasonPopover 
                      onConfirm={(reason) => executeReject(selectedId, reason)}
                      onCancel={() => setIsRejectPopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-0 focus-visible:outline-none">
            <ApprovalHistoryTable />
          </TabsContent>

          <TabsContent value="rejected" className="mt-0 focus-visible:outline-none">
             <ApprovalHistoryTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Overlays */}
      <CriticalActionDialog 
        open={isCriticalDialogOpen}
        onOpenChange={setIsCriticalDialogOpen}
        actionTitle={selectedApproval?.title || ""}
        onConfirm={() => executeApprove(selectedId!)}
      />
    </div>
  );
}
