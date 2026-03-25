"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  User, 
  Settings, 
  ChevronRight, 
  Copy, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  MessageSquare,
  Plug,
  Mic,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface ActivityLogEntry {
  id: string;
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "SYSTEM";
  timestamp: Date;
  actor: {
    name: string;
    type: "agent" | "manager" | "system";
    avatar?: string;
    icon?: React.ReactNode;
    color?: string;
  };
  eventType: string;
  description: string;
  status: "Completed" | "Failed" | "Retrying" | "Skipped" | "Pending";
  details: {
    input: string;
    output: string;
    metadata: Record<string, string>;
    error?: string;
  };
}

export function ActivityTable() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      const [mRes, tRes, aRes, rRes] = await Promise.all([
        supabase.from('meetings').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('approvals').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('agent_reasoning').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      const unified: ActivityLogEntry[] = [];

      mRes.data?.forEach(m => unified.push({
        id: `mtg-${m.id}`,
        level: "INFO",
        timestamp: new Date(m.created_at),
        actor: { name: "Parser Agent", type: "agent", icon: <Mic className="w-3 h-3" />, color: "bg-blue-600" },
        eventType: "Meeting Processed",
        description: `analysed transcript for '${m.title}'`,
        status: m.status === 'completed' ? "Completed" : "Pending",
        details: { input: m.transcript || "No transcript provided", output: "Full analysis saved to DB.", metadata: { "ID": m.id } }
      }));

      tRes.data?.forEach(t => unified.push({
        id: `tsk-${t.id}`,
        level: "SUCCESS",
        timestamp: new Date(t.created_at),
        actor: { name: "Task Agent", type: "agent", icon: <Zap className="w-3 h-3" />, color: "bg-green-600" },
        eventType: "Task Created",
        description: `extracted action item: ${t.title}`,
        status: "Completed",
        details: { input: "Agent pipeline result", output: t.title, metadata: { "Priority": t.priority || "Medium", "Assignee": t.assignee || "None" } }
      }));

      aRes.data?.forEach(a => unified.push({
        id: `app-${a.id}`,
        level: a.status === 'pending' ? "WARNING" : "SUCCESS",
        timestamp: new Date(a.created_at),
        actor: { name: a.source_agent || "Agent", type: "agent", icon: <ShieldAlert className="w-3 h-3" />, color: "bg-orange-600" },
        eventType: "Agent Approval",
        description: `${a.status === 'pending' ? 'requested permission' : 'executed'} tool: ${a.tool_name}`,
        status: a.status === 'pending' ? "Pending" : "Completed",
        details: { input: JSON.stringify(a.tool_args), output: a.reason || "Action confirmed by manager.", metadata: { "Integration": "Jira" } }
      }));

      rRes.data?.forEach(r => unified.push({
        id: `rea-${r.id}`,
        level: r.status === 'failed' ? "ERROR" : "INFO",
        timestamp: new Date(r.created_at),
        actor: { name: r.agent_name || "Agent", type: "agent", icon: <Bot className="w-3 h-3" />, color: "bg-slate-700" },
        eventType: "Agent Reasoning",
        description: r.reasoning?.substring(0, 100) + "...",
        status: r.status === 'completed' ? "Completed" : r.status === 'failed' ? "Failed" : "Pending",
        details: { input: "Context observation", output: r.reasoning, metadata: { "Agent": r.agent_name } }
      }));

      unified.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setLogs(unified.slice(0, 20));
      setLoading(false);
    }

    fetchActivities();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "INFO": return "bg-blue-light/10 text-blue border-transparent";
      case "SUCCESS": return "bg-green-light/10 text-green border-transparent";
      case "WARNING": return "bg-orange-light/10 text-orange border-transparent";
      case "ERROR": return "bg-error-bg/10 text-error border-transparent";
      default: return "bg-slate-50 text-slate-500 border-transparent";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green text-white";
      case "Failed": return "bg-error text-white";
      case "Retrying": return "bg-orange text-white";
      case "Pending": return "bg-blue text-white";
      default: return "bg-slate-400 text-white";
    }
  };

  const getTypeStyles = (type: string) => {
    if (type.includes("Task")) return "text-blue border-blue-200 bg-blue-50/50";
    if (type.includes("Approval")) return "text-orange border-orange-200 bg-orange-50/50";
    if (type.includes("Meeting")) return "text-green border-green-200 bg-green-50/50";
    return "text-slate-500 border-slate-200 bg-slate-50/50";
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 h-[38px] border-bottom border-slate-200">
              <th className="w-[56px] text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-5 text-left">Level</th>
              <th className="w-[160px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Timestamp</th>
              <th className="w-[160px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Actor</th>
              <th className="w-[140px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Event Type</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Description</th>
              <th className="w-[100px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Status</th>
              <th className="w-[70px] text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-5 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isError = log.level === "ERROR";
              
              return (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => toggleRow(log.id)}
                    className={cn(
                      "h-[54px] border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors group relative",
                      isError && "bg-error-bg/[0.02] hover:bg-error-bg/[0.04]",
                      isExpanded && "bg-slate-50 hover:bg-slate-50"
                    )}
                  >
                    <td className="pl-5 relative">
                      {(log.level === "ERROR" || log.level === "WARNING") && (
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px]",
                          log.level === "ERROR" ? "bg-error" : "bg-orange"
                        )} />
                      )}
                      <Badge className={cn("text-[10px] font-bold rounded-md px-1.5 py-0", getLevelStyles(log.level))}>
                        {log.level}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex flex-col leading-tight">
                        <span className="font-mono text-[12px] text-slate-700 font-medium">
                          {format(log.timestamp, "MMM dd, yyyy")}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {format(log.timestamp, "HH:mm:ss a")}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        {log.actor.type === "agent" ? (
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", log.actor.color)}>
                            {log.actor.icon}
                          </div>
                        ) : (
                          <Avatar className="w-6 h-6 border border-slate-100">
                             <AvatarFallback className="bg-blue-light/10 text-blue text-[10px] font-bold">ME</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-[13px] font-semibold text-slate-700">{log.actor.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant="outline" className={cn("text-[11px] font-bold rounded-lg px-2 py-0 border", getTypeStyles(log.eventType))}>
                        {log.eventType}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-[14px] text-slate-600 truncate pr-4">
                        <span className="font-bold text-slate-900">{log.actor.name}</span>
                        {" "}
                        <span className={isError ? "text-error" : ""}>{log.description}</span>
                      </div>
                    </td>
                    <td>
                      <Badge className={cn("text-[10px] font-bold rounded-full px-2 py-0.5", getStatusColor(log.status))}>
                        {log.status}
                      </Badge>
                    </td>
                    <td className="pr-5 text-right">
                      <button className="text-blue text-[12px] font-bold hover:underline">
                        {isExpanded ? "Close" : "View →"}
                      </button>
                    </td>
                  </tr>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 border-none">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-slate-50/80 border-t border-slate-100 overflow-hidden"
                          >
                            <div className="pt-4 pb-6 pl-[74px] pr-8">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center justify-between">
                                    Context Input
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap min-h-[80px]">
                                    {log.details.input}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center justify-between">
                                    Result / Output
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap min-h-[80px]">
                                    {log.details.output}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Metadata</div>
                                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    {Object.entries(log.details.metadata).map(([key, value], i) => (
                                      <div key={key} className={cn(
                                        "flex items-center justify-between p-2.5 text-[11px]",
                                        i !== 0 && "border-t border-slate-50"
                                      )}>
                                        <span className="text-slate-400 font-bold uppercase tracking-tighter">{key}:</span>
                                        <span className="font-semibold text-slate-700">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
