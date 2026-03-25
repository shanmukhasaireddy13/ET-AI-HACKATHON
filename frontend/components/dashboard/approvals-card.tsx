import { ShieldAlert, Check, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

type ApprovalItem = {
  id: string;
  tool_name: string;
  source_agent: string;
  status: string;
  created_at: string;
  priority?: string; // Optional if not in DB yet
};

export function ApprovalsCard() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchApprovals() {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching approvals:", error);
      } else {
        setApprovals(data || []);
      }
      setLoading(false);
    }

    fetchApprovals();
  }, []);

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('approvals')
      .update({ status, decided_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(`Error updating approval ${id}:`, error);
    } else {
      setApprovals(prev => prev.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-border-dash rounded-xl p-8 flex justify-center items-center h-full shadow-sm">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Pending Approvals</h3>
        {approvals.length > 0 && (
          <span className="bg-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {approvals.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {approvals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bot className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[13px] text-slate-500">No pending approvals</p>
          </div>
        ) : (
          approvals.map((item) => (
            <div key={item.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="flex gap-2.5 mb-2">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  "bg-orange" // Mapping tool_name to priority or just using orange
                )} />
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A] leading-snug mb-1">
                    Execute <span className="text-blue font-bold">{item.tool_name}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Bot className="w-3 h-3" />
                    <span>{item.source_agent || 'System Agent'} · {formatDistanceToNow(new Date(item.created_at))} ago</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 ml-4.5">
                <Button 
                  onClick={() => handleDecision(item.id, 'approved')}
                  size="sm" 
                  className="h-7 px-3 bg-success-bg text-success border border-success-border hover:bg-success hover:text-white transition-all text-[11px] font-bold"
                >
                  <Check className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button 
                  onClick={() => handleDecision(item.id, 'rejected')}
                  size="sm" 
                  variant="outline" 
                  className="h-7 px-3 bg-error-bg text-error border border-error-border hover:bg-error hover:text-white transition-all text-[11px] font-bold"
                >
                  <X className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-dash-bg text-center">
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline">
          View all approvals →
        </Button>
      </div>
    </div>
  );
}
