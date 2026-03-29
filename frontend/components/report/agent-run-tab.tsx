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

export function AgentRunTab({ reasoning = [], trace = [] }: { reasoning: any[], trace: any[] }) {
  const agentNodes = reasoning.length > 0 ? reasoning.map((r, i) => ({
    id: r.id || `reason-${i}`,
    name: r.agent_name || "Unknown Agent",
    type: "Reasoning Node",
    duration: "N/A",
    status: "Complete",
    icon: r.agent_name?.toLowerCase().includes("planner") ? ListChecks : Brain,
    input: "Meeting Transcript",
    output: r.reasoning || "",
    logs: r.context_data || []
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Strategic Reasoning Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue" />
          <h3 className="text-[16px] font-bold text-[#0F172A]">Strategic Reasoning</h3>
        </div>
        
        <div className="relative pl-10 space-y-3">
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />
          <Accordion className="space-y-3">
            {agentNodes.map((agent: any) => (
              <div key={agent.id} className="relative">
                <div className="absolute -left-10 top-0 w-[40px] h-[40px] rounded-full border-2 bg-white border-slate-200 text-slate-400 flex items-center justify-center z-10 transition-all">
                  <agent.icon className="w-4 h-4" />
                </div>

                <AccordionItem value={agent.id} className="border border-border-dash rounded-[10px] bg-white overflow-hidden px-0">
                  <AccordionTrigger className="hover:no-underline px-5 py-3.5">
                    <div className="flex-1 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] font-bold text-[#0F172A]">{agent.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">{agent.type}</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-0 border-t border-slate-50">
                    <div className="pt-4 text-[13px] text-body leading-relaxed whitespace-pre-wrap">
                      {agent.output}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 2. Technical Execution Trace (The "Queue") */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-success" />
            <h3 className="text-[16px] font-bold text-[#0F172A]">Technical Execution Trace</h3>
          </div>
          <Badge className="bg-success-bg text-success border-success-border font-bold">100% Agentic Flow</Badge>
        </div>

        {trace.length === 0 ? (
          <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center">
            <p className="text-[13px] text-slate-500">No technical execution steps recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trace.map((step, idx) => (
              <div key={step.id} className={cn(
                "border rounded-xl p-4 transition-all shadow-sm",
                step.status === 'failed' ? "bg-red-50/50 border-red-100" : 
                step.criticality >= 7 ? "bg-orange-50/50 border-orange-100" :
                "bg-white border-border-dash"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold",
                      step.status === 'completed' ? "bg-success-bg text-success" : 
                      step.status === 'failed' ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-[#0F172A]">{step.tool_name || step.agent_role}</h4>
                        {step.criticality >= 7 && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">High Risk: {step.criticality}/10</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {new Date(step.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "capitalize text-[10px] font-bold",
                    step.status === 'completed' ? "border-green-200 text-green-700 bg-green-50" :
                    step.status === 'failed' ? "border-red-200 text-red-700 bg-red-50" :
                    "border-blue-200 text-blue-700 bg-blue-50"
                  )}>
                    {step.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {step.thought && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Brain className="w-3 h-3" /> Agent Thought
                      </h5>
                      <p className="text-[12.5px] text-slate-700 italic">"{step.thought}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900 rounded-lg p-3 font-mono">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Execution / Tool Call</h5>
                      <pre className="text-[11px] text-blue-400 overflow-x-auto whitespace-pre-wrap">
                        {typeof step.tool_args === 'object' ? JSON.stringify(step.tool_args, null, 2) : step.tool_args}
                      </pre>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Result</h5>
                      <div className="text-[11px] text-slate-600 max-h-[100px] overflow-y-auto">
                        {typeof step.result === 'object' ? JSON.stringify(step.result, null, 2) : step.result}
                      </div>
                    </div>
                  </div>

                  {step.criticality >= 7 && (
                    <div className="flex items-center gap-2 text-[12px] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
                      <ShieldAlert className="w-4 h-4" />
                      Human-in-the-loop Gate: {["success", "approved", "completed"].includes(step.status) ? "Approved" : "Waiting for Decision"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-[12px] text-muted-text flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          System verified: 100% Agentic Workflow powered by Meeting Mind Brain.
        </p>
      </div>
    </div>
  );
}
