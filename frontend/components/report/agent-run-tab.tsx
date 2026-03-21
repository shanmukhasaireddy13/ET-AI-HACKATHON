"use client";

import { FileText, Brain, ListChecks, UserCheck, Link, CheckCircle2, Loader2, ChevronDown, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AGENT_NODES = [
  { id: "1", name: "Transcript Parser Agent", type: "Parser", duration: "12.3s", status: "Complete", icon: FileText, input: "4,200 word transcript from Engineering Planning meeting", output: "Parsed 4 main speakers, 76 speech segments." },
  { id: "2", name: "Decision Extractor Agent", type: "Analyzer", duration: "15.8s", status: "Complete", icon: Brain, input: "76 speech segments", output: "Extracted 6 decisions with >85% confidence." },
  { id: "3", name: "Task Generator Agent", type: "Generator", duration: "10.1s", status: "Complete", icon: ListChecks, input: "6 extracted decisions and 42 identified action phrases", output: "Created 14 tasks with priority labels." },
  { id: "4", name: "Assignment Agent", type: "Logic", duration: "8.4s", status: "Complete", icon: UserCheck, input: "14 tasks and meeting participant context", output: "Assigned 11 tasks based on speaker expertise.", needsApproval: true, approvedBy: "John Doe" },
  { id: "5", name: "Jira Integration Agent", type: "Connector", duration: "11.8s", status: "Running", icon: Link, input: "14 tasks with assignments", output: "Syncing status: 8 of 14 tickets created..." },
];

export function AgentRunTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-text">
          This meeting was processed by <span className="font-bold text-[#0F172A]">5 agents</span> in <span className="font-bold text-[#0F172A]">58 seconds</span> total.
        </p>
      </div>

      <div className="relative pl-10 space-y-3">
        {/* Central vertical line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
        <div className="absolute left-[19px] top-4 h-[75%] w-0.5 bg-blue" />

        <Accordion className="space-y-3">
          {AGENT_NODES.map((agent, i) => (
            <div key={agent.id} className="relative">
              {/* Timeline Dot */}
              <div className={cn(
                "absolute -left-10 top-0 w-[40px] h-[40px] rounded-full border-2 flex items-center justify-center z-10 transition-all",
                agent.status === "Complete" ? "bg-success-bg border-success-border text-success" :
                agent.status === "Running" ? "bg-warning-bg border-warning-border text-warning ring-4 ring-warning/5" :
                "bg-slate-50 border-slate-200 text-slate-400"
              )}>
                <agent.icon className={cn("w-4 h-4", agent.status === "Running" && "animate-pulse")} />
              </div>

              <AccordionItem value={agent.id} className="border border-border-dash rounded-[10px] bg-white overflow-hidden data-[state=open]:shadow-md transition-all px-0">
                <AccordionTrigger className="hover:no-underline px-5 py-3.5 group">
                  <div className="flex-1 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-[#0F172A]">{agent.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">{agent.type}</span>
                    </div>
                    <div className="flex items-center gap-6 mr-4">
                      <span className="text-[12px] font-mono text-slate-400 font-medium">{agent.duration}</span>
                      <Badge variant="outline" className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                        agent.status === "Complete" ? "bg-success-bg text-success border-success-border" :
                        "bg-warning-bg text-warning border-warning-border"
                      )}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 pt-0 border-t border-slate-50">
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Input</h4>
                        <p className="text-[12.5px] text-body bg-dash-bg/50 p-2.5 rounded-lg border border-slate-100">{agent.input}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Output</h4>
                        <p className="text-[12.5px] text-body bg-dash-bg/50 p-2.5 rounded-lg border border-slate-100">{agent.output}</p>
                      </div>
                    </div>

                    {agent.needsApproval && (
                      <div className="bg-warning-bg/50 border border-warning-border p-3 rounded-lg flex items-start gap-3">
                        <ShieldAlert className="w-4 h-4 text-warning mt-0.5" />
                        <div>
                          <p className="text-[13px] font-bold text-warning">Required your approval</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">Approved by <span className="font-semibold text-slate-600">{agent.approvedBy}</span> · 10:47 AM, Mar 21</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Agent Logs</h4>
                      <div className="bg-[#0F172A] text-slate-300 p-4 rounded-lg font-mono text-[11px] leading-relaxed shadow-inner">
                        <p className="text-slate-500">[{new Date().toLocaleTimeString()}] Initializing {agent.name}...</p>
                        <p className="text-blue-400">[{new Date().toLocaleTimeString()}] Fetching context from vector store...</p>
                        <p className="text-success">[{new Date().toLocaleTimeString()}] Processing 4,218 words.</p>
                        <p className="text-white">[{new Date().toLocaleTimeString()}] {agent.output}</p>
                      </div>
                      <button className="text-[11px] font-bold text-blue hover:underline mt-2">View full log →</button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>

      <div className="pt-6 border-t border-slate-100 pl-10">
        <p className="text-[12px] text-muted-text">
          Total analysis time: <span className="font-mono font-bold text-slate-600">58.4s</span>
          <span className="mx-2 text-slate-300">•</span>
          Completed at: <span className="font-semibold text-slate-600">10:47 AM, Sat 21 Mar 2026</span>
        </p>
      </div>
    </div>
  );
}
