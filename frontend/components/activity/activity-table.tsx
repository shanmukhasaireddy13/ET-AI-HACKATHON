"use client";

import React from "react";

import { useState } from "react";
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
  Plug
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

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

const mockLogs: ActivityLogEntry[] = [
  {
    id: "1",
    level: "SUCCESS",
    timestamp: new Date("2026-03-21T10:47:32"),
    actor: { name: "Task Generator Agent", type: "agent", icon: <Zap className="w-3 h-3" />, color: "bg-blue-600" },
    eventType: "Task Created",
    description: "created 14 tasks from Engineering Planning",
    status: "Completed",
    details: {
      input: "Meeting transcript: 'We need to fix the login bug...'",
      output: "Generated 14 JSON task objects with priority and assignment.",
      metadata: { "Duration": "2.14s", "Agent ID": "agent_003", "Session ID": "sess_abc123" }
    }
  },
  {
    id: "2",
    level: "INFO",
    timestamp: new Date("2026-03-21T10:45:10"),
    actor: { name: "You", type: "manager" },
    eventType: "Approval",
    description: "approved Jira epic creation — PROJ-204",
    status: "Completed",
    details: {
      input: "Approval Request for Epic: 'Mobile App Refresh'",
      output: "Decision: APPROVED. Comments: 'Proceed with high priority.'",
      metadata: { "Action": "Approve", "Priority": "High", "IP Address": "192.168.1.1" }
    }
  },
  {
    id: "3",
    level: "ERROR",
    timestamp: new Date("2026-03-21T10:42:05"),
    actor: { name: "Jira Integration Agent", type: "agent", icon: <Plug className="w-3 h-3" />, color: "bg-slate-600" },
    eventType: "Integration",
    description: "pushed 14 tickets to Jira project BACKEND",
    status: "Failed",
    details: {
      input: "14 task items for project BACKEND",
      output: "None. Connection aborted.",
      metadata: { "Project": "BACKEND", "Retries": "3", "Error Code": "JIRA_AUTH_401" },
      error: "Error: Unauthorized. The Jira API token provided is invalid or has expired. \n   at JiraClient.push (jira_client.ts:142)\n   at Agent.execute (agent.ts:56)"
    }
  },
  {
    id: "4",
    level: "WARNING",
    timestamp: new Date("2026-03-21T10:40:00"),
    actor: { name: "System", type: "system" },
    eventType: "Config Change",
    description: "detected Jira API timeout — retrying (attempt 2/3)",
    status: "Retrying",
    details: {
      input: "Network Request: POST /api/v2/issue",
      output: "Timeout after 5000ms",
      metadata: { "Component": "NetworkAdapter", "Attempt": "2/3" }
    }
  }
];

export function ActivityTable() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    if (type.includes("Integration")) return "text-green border-green-200 bg-green-50/50";
    if (type.includes("Error")) return "text-error border-error-200 bg-error-50/50";
    return "text-slate-500 border-slate-200 bg-slate-50/50";
  };

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
            {mockLogs.map((log) => {
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
                      {/* Level Border Indicator */}
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
                        <span className="font-mono text-[12px] text-slate-700 font-medium">Mar 21, 2026</span>
                        <span className="font-mono text-[11px] text-slate-400">10:47:32 AM</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        {log.actor.type === "agent" ? (
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", log.actor.color)}>
                            {log.actor.icon}
                          </div>
                        ) : log.actor.type === "manager" ? (
                          <Avatar className="w-6 h-6 border border-slate-100">
                            <AvatarFallback className="bg-blue-light/10 text-blue text-[10px] font-bold">ME</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Settings className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-[13px] font-semibold text-slate-700">{log.actor.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant="outline" className={cn("text-[11px] font-bold rounded-lg px-2 px-1 border", getTypeStyles(log.eventType))}>
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
                        View →
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Detail View */}
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
                                {/* Input */}
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center justify-between">
                                    Input
                                    <button className="text-blue hover:underline normal-case font-semibold">Copy</button>
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[12px] leading-relaxed text-slate-600 whitespace-pre-wrap min-h-[100px]">
                                    {log.details.input}
                                  </div>
                                </div>

                                {/* Output */}
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center justify-between">
                                    Output
                                    <button className="text-blue hover:underline normal-case font-semibold">Copy</button>
                                  </div>
                                  <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[12px] leading-relaxed text-slate-600 whitespace-pre-wrap min-h-[100px]">
                                    {log.details.output}
                                  </div>
                                </div>

                                {/* Metadata */}
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Metadata</div>
                                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    {Object.entries(log.details.metadata).map(([key, value], i) => (
                                      <div key={key} className={cn(
                                        "flex items-center justify-between p-2.5 text-[12px]",
                                        i !== 0 && "border-t border-slate-50"
                                      )}>
                                        <span className="text-slate-400">{key}:</span>
                                        <span className="font-semibold text-slate-700">{value}</span>
                                      </div>
                                    ))}
                                    <div className="flex items-center justify-between p-2.5 text-[12px] border-t border-slate-50">
                                      <span className="text-slate-400">Meeting ID:</span>
                                      <button className="text-blue hover:underline font-semibold flex items-center gap-1">
                                        mtg_xyz789 <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Error Stack Trace */}
                              {log.details.error && (
                                <div className="mt-6">
                                  <div className="text-[10px] font-bold text-error uppercase tracking-widest mb-2.5">Error Detail & Stack Trace</div>
                                  <div className="bg-error-bg/20 border border-error/10 rounded-lg p-3 font-mono text-[11px] leading-relaxed text-error-dark whitespace-pre-wrap overflow-x-auto">
                                    {log.details.error}
                                  </div>
                                </div>
                              )}
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
