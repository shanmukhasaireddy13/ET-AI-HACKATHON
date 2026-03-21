"use client";

import { 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Video, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Monitor
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

const meetings = [
  { 
    id: "1", 
    title: "Q2 Engineering Planning", 
    project: "Backend Engine", 
    participants: 6, 
    date: "Mar 21, 2026", 
    time: "10:30 AM", 
    duration: 75, 
    source: "Zoom", 
    tasks: 12, 
    status: "Complete",
    agents: [
      { name: "Summarizer", avatar: "/avatars/agent-1.png" },
      { name: "Task Extractor", avatar: "/avatars/agent-2.png" },
      { name: "Decision Logger", avatar: "/avatars/agent-3.png" },
    ]
  },
  { 
    id: "2", 
    title: "Weekly Sync - Product", 
    project: "Mobile App", 
    participants: 4, 
    date: "Mar 21, 2026", 
    time: "09:00 AM", 
    duration: 30, 
    source: "Meet", 
    tasks: 5, 
    status: "Analysing",
    progress: 60,
    currentAgents: "3/5",
    agents: [
      { name: "Summarizer", avatar: "/avatars/agent-1.png" },
      { name: "Task Extractor", avatar: "/avatars/agent-2.png" },
    ]
  },
  { 
    id: "3", 
    title: "Project Alpha Kickoff", 
    participants: 12, 
    date: "Mar 20, 2026", 
    time: "02:00 PM", 
    duration: 60, 
    source: "Teams", 
    tasks: 0, 
    status: "Failed",
    reason: "Audio quality too low",
    agents: []
  },
  { 
    id: "4", 
    title: "Design Review - Website Redesign", 
    project: "Marketing", 
    participants: 3, 
    date: "Mar 20, 2026", 
    time: "11:00 AM", 
    duration: 45, 
    source: "Manual", 
    tasks: 0, 
    status: "Queued",
    agents: []
  },
];

const SourceIcon = ({ source }: { source: string }) => {
  switch (source) {
    case "Zoom": return <Video className="w-4 h-4 text-[#2D8CFF]" />;
    case "Meet": return <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#EA4335] via-[#FBBC04] to-[#34A853] opacity-80" />; 
    case "Teams": return <Monitor className="w-4 h-4 text-[#6264A7]" />;
    default: return <FileText className="w-4 h-4 text-[#94A3B8]" />;
  }
};

const StatusBadge = ({ status, progress, currentAgents }: { status: string, progress?: number, currentAgents?: string }) => {
  const baseClasses = "rounded-[20px] py-1 px-3 text-[12px] font-semibold border flex items-center gap-1.5 h-7";
  
  switch (status) {
    case "Complete":
      return (
        <div className={cn(baseClasses, "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]")}>
           <CheckCircle2 className="w-3 h-3" />
           Complete
        </div>
      );
    case "Analysing":
      return (
        <div className="flex flex-col gap-1.5">
           <div className={cn(baseClasses, "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]")}>
              <div className="w-1.5 h-1.5 bg-[#EA580C] rounded-full animate-pulse" />
              <Loader2 className="w-3 h-3 animate-spin" />
              Analysing
           </div>
           <div className="flex flex-col gap-1 px-1">
              <div className="h-[3px] w-[80px] bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-[#EA580C] rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-[#94A3B8] font-medium">{currentAgents} agents</span>
           </div>
        </div>
      );
    case "Queued":
      return (
        <div className={cn(baseClasses, "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]")}>
           <Clock className="w-3 h-3" />
           Queued
        </div>
      );
    case "Failed":
      return (
        <div className={cn(baseClasses, "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]")}>
           <XCircle className="w-3 h-3" />
           Failed
        </div>
      );
    case "Partial":
      return (
        <div className={cn(baseClasses, "border-[#BFDBFE] text-[#2563EB] bg-white")}>
           <AlertCircle className="w-3 h-3" />
           {status}
        </div>
      );
    default:
      return (
        <div className={cn(baseClasses, "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]")}>
           {status}
        </div>
      );
  }
};

export function MeetingsTable() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === meetings.length ? [] : meetings.map(m => m.id));
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden shadow-sm relative">
      {/* Table Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] h-[38px] flex items-center px-5 gap-0">
         <div className="w-[16px] mr-5">
            <Checkbox checked={selected.length === meetings.length} onCheckedChange={toggleAll} />
         </div>
         <div className="flex-1 min-w-[220px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Meeting Title</div>
         <div className="w-[140px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Date/Time</div>
         <div className="w-[90px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Source</div>
         <div className="w-[70px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Tasks</div>
         <div className="w-[80px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Agents</div>
         <div className="w-[120px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">Status</div>
         <div className="w-[90px] text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#F8FAFC]">
         {meetings.map((meeting) => {
           const isSelected = selected.includes(meeting.id);
           return (
             <div key={meeting.id} className={cn(
               "group h-[64px] flex items-center px-5 transition-all hover:bg-[#FAFAFA]",
               isSelected && "bg-[#EFF6FF] border-l-2 border-l-[#2563EB] -ml-[0px]"
             )}>
                <div className="w-[16px] mr-5">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(meeting.id)} />
                </div>
                
                {/* Title & Tags */}
                <div className="flex-1 min-w-[220px] flex flex-col justify-center">
                   <span className="text-[14px] font-medium text-[#0F172A] truncate">{meeting.title}</span>
                   <div className="flex items-center gap-[6px] mt-[3px]">
                      {meeting.project && (
                        <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[11px] font-medium py-0 h-[18px] px-[7px] rounded-[4px] flex items-center">
                           {meeting.project}
                        </div>
                      )}
                      <div className="flex items-center gap-[4px] text-[11px] text-[#94A3B8] font-medium">
                         <Users className="w-[11px] h-[11px]" />
                         {meeting.participants} participants
                      </div>
                   </div>
                </div>

                {/* Date / Time */}
                <div className="w-[140px] flex flex-col justify-center leading-tight">
                   <span className="text-[13px] text-[#334155]">{meeting.date}</span>
                   <span className="text-[11px] text-[#94A3B8]">{meeting.time} · {meeting.duration} min</span>
                </div>

                {/* Source */}
                <div className="w-[90px] flex items-center gap-2">
                   <SourceIcon source={meeting.source} />
                   <span className="text-[12px] text-[#64748B] font-medium">{meeting.source}</span>
                </div>

                {/* Tasks */}
                <div className="w-[70px] flex flex-col justify-center leading-tight">
                   {meeting.tasks > 0 ? (
                     <>
                       <span className="text-[14px] font-bold font-mono text-[#0F172A]">{meeting.tasks}</span>
                       <span className="text-[11px] text-[#94A3B8] font-medium">tasks</span>
                     </>
                   ) : (
                     <span className="text-[14px] text-[#E2E8F0]">—</span>
                   )}
                </div>

                {/* Agents Cluster */}
                <div className="w-[80px]">
                   <TooltipProvider>
                      <div className="flex -space-x-[4px]">
                         {meeting.agents.slice(0, 3).map((agent, i) => (
                           <Tooltip key={i}>
                              <TooltipTrigger nativeButton={false}>
                                 <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm cursor-help">
                                    <span className="text-[8px] font-bold text-[#94A3B8]">{agent.name[0]}</span>
                                 </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-[11px] font-bold">{agent.name}</TooltipContent>
                           </Tooltip>
                         ))}
                         {meeting.agents.length === 0 && meeting.status !== "Queued" && (
                            <div className="w-5 h-5 rounded-full border border-white bg-slate-50 flex items-center justify-center shrink-0">
                               <span className="text-[10px] text-slate-300">?</span>
                            </div>
                         )}
                         {meeting.agents.length > 3 && (
                            <div className="w-5 h-5 rounded-full border border-white bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-sm">
                               <span className="text-[8px] font-bold text-[#64748B]">+{meeting.agents.length - 3}</span>
                            </div>
                         )}
                      </div>
                   </TooltipProvider>
                </div>

                {/* Status */}
                <div className="w-[120px]">
                   <StatusBadge status={meeting.status} progress={meeting.progress} currentAgents={meeting.currentAgents} />
                </div>

                {/* Actions */}
                <div className="w-[90px] flex items-center justify-end gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                   <TooltipProvider>
                      <Tooltip>
                         <TooltipTrigger>
                            <Button variant="outline" className="w-7 h-7 p-0 border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] rounded-[5px] transition-all">
                               <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                         </TooltipTrigger>
                         <TooltipContent className="text-[11px] font-bold">View Report</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                         <TooltipTrigger>
                            <Button variant="outline" className="w-7 h-7 p-0 border-[#E2E8F0] text-[#64748B] hover:border-[#FED7AA] hover:text-[#EA580C] hover:bg-[#FFF7ED] rounded-[5px] transition-all">
                               <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                         </TooltipTrigger>
                         <TooltipContent className="text-[11px] font-bold">Re-run Analysis</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                         <TooltipTrigger>
                            <Button variant="outline" className="w-7 h-7 p-0 border-[#E2E8F0] text-[#64748B] hover:border-[#FECACA] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-[5px] transition-all">
                               <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                         </TooltipTrigger>
                         <TooltipContent className="text-[11px] font-bold">Delete Meeting</TooltipContent>
                      </Tooltip>
                   </TooltipProvider>
                </div>
             </div>
           );
         })}
      </div>

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#0F172A] rounded-b-[10px] h-[48px] px-5 flex items-center justify-between z-20 animate-in slide-in-from-bottom-2 duration-200">
           <span className="text-[13px] font-medium text-white">{selected.length} meetings selected</span>
           <div className="flex items-center gap-3">
              <Button variant="ghost" className="h-8 text-white hover:bg-white/10 text-[12px] font-bold px-3">Re-analyse</Button>
              <Button variant="ghost" className="h-8 text-white hover:bg-white/10 text-[12px] font-bold px-3">Export</Button>
              <Button variant="ghost" className="h-8 text-[#FCA5A5] hover:bg-[#DC2626]/20 text-[12px] font-bold px-3">Delete</Button>
           </div>
        </div>
      )}

      {/* Table Footer */}
      <div className="bg-white border-t border-[#F1F5F9] h-[52px] px-5 flex items-center justify-between">
         <span className="text-[12px] text-[#64748B] font-medium">Showing <span className="font-bold text-[#0F172A]">20</span> of 47 meetings</span>
         <div className="flex items-center gap-[6px]">
            <Button variant="outline" className="w-8 h-8 p-0 border-[#E2E8F0] rounded-md disabled:opacity-30" disabled>
               <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
               <Button className="w-8 h-8 p-0 bg-[#2563EB] text-white rounded-md text-[12px] font-bold">1</Button>
               <Button variant="ghost" className="w-8 h-8 p-0 text-[#64748B] rounded-md text-[12px] font-bold hover:bg-slate-100">2</Button>
               <Button variant="ghost" className="w-8 h-8 p-0 text-[#64748B] rounded-md text-[12px] font-bold hover:bg-slate-100">3</Button>
            </div>
            <Button variant="outline" className="w-8 h-8 p-0 border-[#E2E8F0] rounded-md hover:border-[#2563EB] hover:text-[#2563EB]">
               <ChevronRight className="w-4 h-4" />
            </Button>
         </div>
      </div>
    </div>
  );
}
