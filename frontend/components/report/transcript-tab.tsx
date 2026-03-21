"use client";

import { Search, ChevronUp, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TRANSCRIPT = [
  {
    id: 1,
    speaker: "John Doe",
    time: "10:30 AM",
    initial: "JD",
    text: "Alright everyone, let's kick off the Q2 engineering planning. We have a lot to cover today, specifically focusing on the pricing engine scalability and the legacy API deprecation."
  },
  {
    id: 2,
    speaker: "Sarah Smith",
    time: "10:32 AM",
    initial: "SS",
    text: "I've been looking at the pricing engine logs. We're seeing some latency spikes when the load exceeds 400 requests per second. I think we need to scale out the API instances or optimize the caching layer."
  },
  {
    id: 3,
    speaker: "Rahul Sharma",
    time: "10:35 AM",
    initial: "RS",
    text: "I agree with Sarah. Let's make it a priority to scale out the pricing engine API instances by the end of this sprint. I'll take the lead on that with the DevOps team.",
    highlight: { type: "task", label: "Task extracted", content: "Scale out API instances for pricing engine" }
  },
  {
    id: 4,
    speaker: "Priya Singh",
    time: "10:40 AM",
    initial: "PS",
    text: "Regarding the billing module, I strongly suggest we adopt a micro-services architecture. Our current monolith is reaching its limits in terms of fault tolerance during deployment.",
    highlight: { type: "decision", label: "Decision extracted", content: "Adopt micro-services architecture for billing module" }
  },
  {
    id: 5,
    speaker: "John Doe",
    time: "10:45 AM",
    initial: "JD",
    text: "That settles it then. We will proceed with the micro-services approach for billing. Priya, can you draft the initial schema by Friday?"
  }
];

export function TranscriptTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Transcript Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-[320px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="Search transcript..." 
              className="pl-8 h-[36px] bg-white border-border-dash text-[13px] focus-visible:ring-blue"
            />
          </div>
          <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" className="w-[34px] h-[34px] border-border-dash text-slate-400 hover:text-blue">
               <ChevronUp className="w-4 h-4" />
             </Button>
             <Button variant="outline" size="icon" className="w-[34px] h-[34px] border-border-dash text-slate-400 hover:text-blue">
               <ChevronDown className="w-4 h-4" />
             </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-200" />
            <span className="text-[12px] font-medium text-slate-500">Decision</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-100 border border-green-200" />
            <span className="text-[12px] font-medium text-slate-500">Task</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-200" />
            <span className="text-[12px] font-medium text-slate-500">Action Item</span>
          </div>
        </div>
      </div>

      {/* Transcript Container */}
      <div className="bg-white border border-border-dash rounded-[10px] overflow-hidden shadow-sm">
        <div className="max-h-[640px] overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">
          <TooltipProvider>
            {TRANSCRIPT.map((item) => (
              <div key={item.id} className="group relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-light text-blue flex items-center justify-center font-bold text-[11px] ring-2 ring-white">
                    {item.initial}
                  </div>
                  <span className="text-[13px] font-bold text-[#0F172A]">{item.speaker}</span>
                  <span className="text-[11px] font-medium text-slate-400 ml-1">{item.time}</span>
                </div>
                
                <div className="pl-9 max-w-[760px]">
                  <p className="text-[14px] text-body leading-[1.7] text-slate-600">
                    {item.highlight ? (
                      <>
                        {item.text.split(item.highlight.content)[0]}
                        <Tooltip>
                          <TooltipTrigger>
                            <mark className={cn(
                              "px-0 py-0.5 rounded-sm cursor-help bg-transparent transition-all hover:ring-2",
                              item.highlight.type === "task" ? "bg-success-bg text-[#166534] border-b-2 border-success ring-success/20" : 
                              "bg-blue-light text-blue shadow-[0_1px_0_0_currentColor] ring-blue/20"
                            )}>
                              {item.highlight.content}
                            </mark>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-[#0F172A] text-white border-0 p-3 rounded-lg shadow-xl mb-2">
                            <p className="text-[12px] font-bold mb-1">{item.highlight.label}</p>
                            <p className="text-[11px] text-slate-300 mb-2">{item.highlight.content}</p>
                            <button className="text-[11px] font-bold text-blue hover:text-blue-mid flex items-center gap-1">
                              View extracted item <ChevronDown className="w-3 h-3 -rotate-90" />
                            </button>
                          </TooltipContent>
                        </Tooltip>
                        {item.text.split(item.highlight.content)[1]}
                      </>
                    ) : item.text}
                  </p>
                </div>

                <Button variant="ghost" size="icon" className="absolute -left-2 top-0 text-slate-200 opacity-0 group-hover:opacity-100 hover:bg-transparent hover:text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
