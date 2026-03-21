"use client";

import { X, Send, Zap, MessageSquare, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AgentChatPanelProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  agentType: string;
  status: "active" | "running" | "idle" | "error";
}

const INITIAL_MESSAGES = [
  { id: "m1", role: "agent", text: "Hello! I'm the Task Generator Agent. I've just finished processing the Engineering Planning transcript. I found 14 tasks that require your review.", time: "10:45 AM" },
  { id: "m2", role: "manager", text: "Great. Can you summarize the high-priority ones first?", time: "10:46 AM" },
  { id: "m3", role: "system", text: "Agent filtered task list for 'Priority: High'", type: "tool" },
  { id: "m4", role: "agent", text: "There are 4 high-priority tasks. Most concern the API scaling and security audit. Would you like me to push them to Jira now?", time: "10:47 AM" },
];

export function AgentChatPanel({ open, onClose, agentName, agentType, status }: AgentChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[55] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={cn(
        "fixed top-16 right-0 bottom-0 w-[420px] bg-white border-l border-slate-200 z-[60] shadow-2xl transition-transform duration-300 ease-out flex flex-col",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-light flex items-center justify-center text-blue shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">{agentName}</h3>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  status === "active" ? "bg-success" : status === "running" ? "bg-warning animate-pulse" : "bg-slate-300"
                )} />
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{agentType}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions */}
        <div className="px-5 py-3 border-b border-slate-50 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            "Summarise current tasks",
            "Pause and wait",
            "Show recent errors",
            "Reassign pending"
          ].map((s, i) => (
            <button 
              key={i}
              className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-500 whitespace-nowrap hover:border-blue hover:text-blue hover:bg-blue-light/50 transition-all shadow-sm active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30">
          {INITIAL_MESSAGES.map((m) => (
            <div key={m.id} className={cn(
              "flex flex-col gap-1.5",
              m.role === "manager" ? "items-end" : m.role === "system" ? "items-center" : "items-start"
            )}>
              {m.role === "system" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Zap className="w-3 h-3 text-slate-400" />
                  <span className="text-[11px] font-medium italic text-slate-500">{m.text}</span>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "max-w-[85%] p-3.5 px-4 text-[13.5px] leading-relaxed shadow-sm",
                    m.role === "manager" 
                      ? "bg-blue text-white rounded-[18px_4px_18px_18px] font-medium" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-[4px_18px_18px_18px] font-medium"
                  )}>
                    {m.text}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 px-1">{m.time}</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 px-5 border-t border-slate-100 bg-white">
          <div className="relative group">
            <Textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent a question..."
              className="w-full min-h-[44px] max-h-[120px] rounded-xl border-slate-200 focus-visible:ring-blue pr-12 text-[14px] leading-snug py-3 shadow-inner bg-slate-50/50 group-hover:bg-white transition-all"
            />
            <button 
              disabled={!input.trim()}
              className={cn(
                "absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90",
                input.trim() ? "bg-blue text-white shadow-md shadow-blue/20" : "bg-slate-100 text-slate-300"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
             <span className="text-slate-400 font-medium">Shift + Enter for new line</span>
             <div className="flex items-center gap-1.5">
               <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
               <span className="text-success font-bold uppercase tracking-widest">Agent Online</span>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
