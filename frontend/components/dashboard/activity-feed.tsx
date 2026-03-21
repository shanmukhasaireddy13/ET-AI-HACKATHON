"use client";

import { Bot, CheckSquare, ShieldAlert, Mic, AlertCircle, Plug, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACTIVITIES = [
  {
    id: 1,
    type: "agent",
    actor: "Task Generator Agent",
    description: "created 12 tasks from Engineering Planning meeting",
    time: "2 min ago",
    icon: Bot,
    bg: "bg-blue-light",
    color: "text-blue"
  },
  {
    id: 2,
    type: "user",
    actor: "You",
    description: "approved Jira epic creation — PROJ-204",
    time: "15 min ago",
    icon: ShieldAlert,
    bg: "bg-orange-light",
    color: "text-orange"
  },
  {
    id: 3,
    type: "agent",
    actor: "Assignment Agent",
    description: "assigned 4 tasks to Rahul Sharma",
    time: "45 min ago",
    icon: CheckSquare,
    bg: "bg-success-bg",
    color: "text-success"
  },
  {
    id: 4,
    type: "meeting",
    actor: "System",
    description: "successfully parsed 'Design Sync' transcript",
    time: "1 hour ago",
    icon: Mic,
    bg: "bg-blue-light",
    color: "text-blue"
  },
  {
    id: 5,
    type: "error",
    actor: "Jira Agent",
    description: "failed to sync tickets — Authentication error",
    time: "2 hours ago",
    icon: AlertCircle,
    bg: "bg-red-light",
    color: "text-error"
  },
  {
    id: 6,
    type: "integration",
    actor: "Slack",
    description: "connected successfully to #engineering-updates",
    time: "3 hours ago",
    icon: Plug,
    bg: "bg-success-bg",
    color: "text-success"
  }
];

export function ActivityFeed() {
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Activity Feed</h3>
        <div className="flex bg-dash-bg p-0.5 rounded-lg border border-border-dash">
          {["All", "Agents", "Tasks", "Approvals"].map((tab, i) => (
            <button 
              key={tab}
              className={cn(
                "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                i === 0 ? "bg-white shadow-sm text-blue" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="link" className="text-blue text-[12px] h-auto p-0 hover:no-underline font-medium">
          Mark all read
        </Button>
      </div>

      <div className="divide-y divide-slate-50">
        {ACTIVITIES.map((item) => (
          <div key={item.id} className="px-6 py-3.5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group relative overflow-hidden">
            {item.id === 1 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue" />}
            
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.bg)}>
              <item.icon className={cn("w-4 h-4", item.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[#334155] leading-snug">
                <span className="font-bold text-[#0F172A]">{item.actor}</span>{" "}
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] text-slate-400">{item.time}</span>
                {item.type === "agent" && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
              </div>
            </div>

            <Button variant="ghost" size="icon" className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 bg-dash-bg text-center">
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline font-medium">
          View full activity log →
        </Button>
      </div>
    </div>
  );
}
