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
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ApprovalsPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCriticalDialogOpen, setIsCriticalDialogOpen] = useState(false);
  const [isRejectPopoverOpen, setIsRejectPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [stats, setStats] = useState({ approved: 0, rejected: 0, avgTime: "12m" });

  const supabase = createClient();

  const fetchApprovals = async () => {
    setIsFetching(true);
    
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      supabase.from('approvals').select('*, meetings(title)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('approvals').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('approvals').select('id', { count: 'exact', head: true }).eq('status', 'rejected')
    ]);

    setStats({
      approved: approvedRes.count || 0,
      rejected: rejectedRes.count || 0,
      avgTime: "12m"
    });

    if (pendingRes.error) {
      console.error("Error fetching approvals:", pendingRes.error);
    } else {
      const formatted = pendingRes.data.map((a: any) => ({
        id: a.id,
        priority: (a.priority || "Medium") as ApprovalPriority,
        agentName: a.source_agent || "System Agent",
        timestamp: formatDistanceToNow(new Date(a.created_at)) + " ago",
        expiresIn: "24h",
        title: `Execute ${a.tool_name}`,
        description: a.description || `Pending action from ${a.source_agent}`,
        context: {
          meeting: a.meetings?.title || "Direct Action",
          assignee: { name: "You" },
        },
        fullDescription: a.description || `The agent is requesting permission to execute the tool '${a.tool_name}' with the provided parameters.`,
        agent: a.source_agent,
        meetingDate: new Date(a.created_at).toLocaleDateString(),
        impact: "Modifies external system state",
        scope: Object.entries(a.tool_args || {}).map(([k, v]) => `${k}: ${v}`),
        assignees: [],
        riskLevel: a.priority || "Medium",
        riskReason: "Automated agent execution requires verification.",
        status: "pending"
      }));
      setPending(formatted);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const selectedApproval = pending.find(a => a.id === selectedId) || null;

  const handleApprove = (id: string) => {
    const item = pending.find(p => p.id === id);
    if (item?.priority === "Critical") {
      setIsCriticalDialogOpen(true);
      return;
    }
    executeApprove(id);
  };

  const executeApprove = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      setPending(prev => prev.filter(p => p.id !== id));
      setSelectedId(null);
      setIsCriticalDialogOpen(false);
      console.log("Action approved");
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve action.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = (id: string) => {
    setIsRejectPopoverOpen(true);
  };

  const executeReject = async (id: string, reason: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('approvals')
        .update({ 
          status: 'rejected', 
          reason: reason 
        })
        .eq('id', id);

      if (error) throw error;

      setPending(prev => prev.filter(p => p.id !== id));
      setSelectedId(null);
      setIsRejectPopoverOpen(false);
      console.log("Action rejected");
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject action.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7 pb-20">
        
        {/* Header Section */}
        <ApprovalHeader pendingCount={pending.length} />

        {/* Stats Strip */}
        <ApprovalStatsStrip 
          pendingCount={pending.length} 
          approvedCount={stats.approved} 
          rejectedCount={stats.rejected} 
          avgTime={stats.avgTime} 
        />

        {/* Alert Banner */}
        {!isFetching && pending.length > 0 && <ApprovalAlertBanner />}

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
            {isFetching ? (
               <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
               </div>
            ) : (
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
                          exit={{ opacity: 0, x: 20, transition: { duration: 0.3 } }}
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
                  <ApprovalDetailPanel 
                    approval={selectedApproval} 
                    onApprove={() => handleApprove(selectedId!)}
                    onReject={() => handleReject(selectedId!)}
                    isLoading={isLoading}
                  />

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
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-0 focus-visible:outline-none">
            <ApprovalHistoryTable status="approved" />
          </TabsContent>

          <TabsContent value="rejected" className="mt-0 focus-visible:outline-none">
             <ApprovalHistoryTable status="rejected" />
          </TabsContent>
        </Tabs>
      </div>

      <CriticalActionDialog 
        open={isCriticalDialogOpen}
        onOpenChange={setIsCriticalDialogOpen}
        actionTitle={selectedApproval?.title || ""}
        onConfirm={() => executeApprove(selectedId!)}
      />
    </div>
  );
}
