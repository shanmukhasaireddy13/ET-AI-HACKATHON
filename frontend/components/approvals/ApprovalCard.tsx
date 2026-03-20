"use client";

import { useState } from "react";

interface ApprovalData {
  id: string;
  meeting_id: string;
  tool: string;
  args: Record<string, any>;
  source_agent: string;
  status: string;
  reason: string;
  created_at: string;
}

interface ApprovalCardProps {
  approval: ApprovalData;
  onDecision: (id: string, decision: "approved" | "rejected") => Promise<void>;
}

const TOOL_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  create_jira_ticket: { icon: "🎫", color: "blue", label: "Jira Ticket" },
  send_slack_message: { icon: "💬", color: "purple", label: "Slack Message" },
  schedule_calendar_event: { icon: "📅", color: "green", label: "Calendar Event" },
};

export default function ApprovalCard({ approval, onDecision }: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [decidedAs, setDecidedAs] = useState<string | null>(null);

  const handleDecision = async (decision: "approved" | "rejected") => {
    setLoading(true);
    await onDecision(approval.id, decision);
    setDecidedAs(decision);
    setLoading(false);
  };

  const toolInfo = TOOL_ICONS[approval.tool] || { icon: "⚙️", color: "gray", label: approval.tool };
  const args = typeof approval.args === "string" ? JSON.parse(approval.args) : (approval.args || {});

  if (decidedAs) {
    return (
      <div className={`glass-card rounded-2xl p-6 border-2 ${decidedAs === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
        <div className="flex items-center gap-3 text-lg font-semibold">
          <span className="text-2xl">{decidedAs === "approved" ? "✅" : "❌"}</span>
          <span className={decidedAs === "approved" ? "text-emerald-400" : "text-destructive"}>
            {decidedAs === "approved" ? "Approved & Executed" : "Rejected"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{toolInfo.label} from {approval.source_agent}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group">
      {/* Header: Tool type + Agent source */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{toolInfo.icon}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-${toolInfo.color}-500/10 text-${toolInfo.color}-400 border border-${toolInfo.color}-500/20`}>
              {toolInfo.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            {approval.reason || `Execute ${toolInfo.label}`}
          </h3>
        </div>
        <div className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1.5 rounded-full font-bold border border-amber-500/20 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          ⏳ Awaiting
        </div>
      </div>

      {/* Tool Arguments Preview */}
      <div className="bg-black/40 rounded-xl p-4 mb-5 border border-white/5 shadow-inner">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Tool Arguments</p>
        <div className="space-y-1.5">
          {Object.entries(args).map(([key, val]) => (
            <div key={key} className="flex gap-2 text-sm">
              <span className="text-muted-foreground font-mono text-xs min-w-[80px]">{key}:</span>
              <span className="text-foreground/80 break-all text-xs">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Agent source + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs border border-primary/30">🤖</div>
          <span className="font-mono text-xs">{approval.source_agent || "Agent"}</span>
        </div>
        
        <div className="flex gap-3">
          <button 
            disabled={loading}
            onClick={() => handleDecision("rejected")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            Reject
          </button>
          <button 
            disabled={loading}
            onClick={() => handleDecision("approved")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            {loading && <svg className="animate-spin h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            Approve & Execute
          </button>
        </div>
      </div>
    </div>
  );
}
