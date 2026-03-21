"use client";

import { Bot, AlertTriangle, ShieldCheck, Zap, Ghost, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

const thresholds = [
  { 
    id: "all", 
    label: "All actions", 
    description: "Agents must ask for approval before every single action, including data extraction.",
    icon: ShieldCheck,
    color: "slate"
  },
  { 
    id: "high", 
    label: "High + Critical", 
    description: "Agents auto-run Low and Medium tasks. Approvals required for any Jira/Email actions.",
    icon: Zap,
    color: "green",
    recommended: true
  },
  { 
    id: "critical", 
    label: "Critical only", 
    description: "Agents auto-run everything except actions marked as 'Critical' priority.",
    icon: Bot,
    color: "blue"
  },
  { 
    id: "never", 
    label: "Never", 
    description: "Agents run fully autonomously without any human-in-the-loop validation.",
    icon: EyeOff,
    color: "error",
    warning: "Agents will execute all actions including Jira and email without asking. Use with caution."
  },
];

export function AgentDefaultsPanel() {
  const [selected, setSelected] = useState("high");

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Agent Defaults</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Set global rules for how all AI agents behave across this workspace.</p>
      </div>

      <div className="px-6 pb-6 mt-6">
        {/* Approval Thresholds Section */}
        <div className="mb-8">
           <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[13px] font-bold text-slate-900">When should agents ask for approval?</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {thresholds.map((option) => {
                const isActive = selected === option.id;
                const Icon = option.icon;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelected(option.id)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left relative group",
                      isActive 
                        ? "bg-blue-light/5 border-blue ring-4 ring-blue/5" 
                        : "bg-white border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="flex justify-between items-start w-full mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        isActive ? "bg-blue text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-500"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {option.recommended && (
                        <Badge className="bg-green/10 text-green border-green/20 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">Recommended</Badge>
                      )}
                    </div>
                    
                    <span className={cn(
                      "text-[14px] font-bold",
                      isActive ? "text-blue" : "text-slate-900 group-hover:text-slate-900"
                    )}>
                      {option.label}
                    </span>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      {option.description}
                    </p>
                    
                    {isActive && option.warning && (
                      <div className="mt-3 flex items-start gap-2 bg-error-bg/30 p-2.5 rounded-lg border border-error/10">
                         <AlertTriangle className="w-4 h-4 text-error shrink-0" />
                         <span className="text-[11px] text-error font-medium leading-tight">{option.warning}</span>
                      </div>
                    )}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Timeout & Retry Section */}
        <div className="py-6 border-y border-slate-100">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-50">
              <div className="max-w-[400px]">
                <h4 className="text-[13px] font-semibold text-slate-900">Auto-reject approvals after</h4>
                <p className="text-[12px] text-slate-500 mt-1">Pending approvals that are not addressed within this window will be automatically rejected.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input type="number" defaultValue="48" className="h-10 w-[80px] border-slate-200 rounded-lg focus:ring-blue/10 font-bold text-center" />
                <span className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">Hours</span>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
              <div className="max-w-[400px]">
                <h4 className="text-[13px] font-semibold text-slate-900">Retry failed agent tasks</h4>
                <p className="text-[12px] text-slate-500 mt-1">Number of times an agent will attempt to retry a tool call (Jira API, etc.) if it fails.</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="3" className="h-10 w-[80px] border-slate-200 rounded-lg focus:ring-blue/10 font-bold text-center" />
                  <span className="text-[13px] text-slate-400 font-bold uppercase tracking-widest shrink-0">Times</span>
                </div>
                <div className="h-6 w-px bg-slate-100 hidden sm:block" />
                <Switch defaultChecked />
              </div>
           </div>
        </div>

        {/* Default Task Settings */}
        <div className="py-2">
           <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-[400px]">
                <h4 className="text-[13px] font-semibold text-slate-900">Default task priority when undetected</h4>
                <p className="text-[12px] text-slate-500 mt-1">Status assigned to action items when the AI cannot confidently determine priority from context.</p>
              </div>
              <Select defaultValue="medium">
                <SelectTrigger className="h-10 w-full sm:w-[240px] border-slate-200 rounded-lg">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (P3)</SelectItem>
                  <SelectItem value="medium">Medium (P2)</SelectItem>
                  <SelectItem value="high">High (P1)</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-[400px]">
                <h4 className="text-[13px] font-semibold text-slate-900">Default assignee fallback</h4>
                <p className="text-[12px] text-slate-500 mt-1">Who tasks should be assigned to if no clear owner is mentioned in the meeting.</p>
              </div>
              <Select defaultValue="manager">
                <SelectTrigger className="h-10 w-full sm:w-[240px] border-slate-200 rounded-lg">
                  <SelectValue placeholder="Select fallback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Workspace Manager (Current User)</SelectItem>
                  <SelectItem value="none">Leave Unassigned</SelectItem>
                  <SelectItem value="admin">Workspace Admin</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-[400px]">
                <h4 className="text-[13px] font-semibold text-slate-900">Auto-create Jira tickets</h4>
                <p className="text-[12px] text-slate-500 mt-1">If enabled, agents will automatically push extracted action items to Jira once an analysis is finished.</p>
              </div>
              <Switch />
           </div>
        </div>
      </div>
    </div>
  );
}
