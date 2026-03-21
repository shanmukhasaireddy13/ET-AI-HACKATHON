"use client";

import { CheckCircle2, Settings, User, Bell, Download, Trash2, ShieldAlert, Bot, Mic, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  { name: "Jira", status: "14 tickets created", icon: "/jira-logo.png", complete: true },
  { name: "Slack", status: "Notified 5 members", icon: "/slack-logo.png", complete: true },
  { name: "Email", status: "Not configured", icon: null, complete: false },
];

const ASSIGNEES = [
  { name: "Rahul Sharma", tasks: 6, initial: "RS" },
  { name: "Priya Singh", tasks: 4, initial: "PS" },
  { name: "Sarah Smith", tasks: 2, initial: "SS" },
  { name: "John Doe", tasks: 1, initial: "JD" },
  { name: "Elena Vogt", tasks: 1, initial: "EV" },
];

export function RightSidePanel() {
  return (
    <div className="space-y-4 sticky top-[92px]">
      {/* Integrations Card */}
      <div className="bg-white border border-border-dash rounded-[10px] overflow-hidden shadow-sm">
        <div className="px-[18px] py-3.5 border-b border-slate-50">
          <h3 className="text-[14px] font-bold text-[#0F172A]">Integrations</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {INTEGRATIONS.map((app) => (
            <div key={app.name} className="p-[15px] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-border-dash flex items-center justify-center shrink-0">
                {app.name === "Jira" && <span className="text-blue font-bold text-[10px]">Ji</span>}
                {app.name === "Slack" && <span className="text-[#4A154B] font-bold text-[10px]">Sl</span>}
                {!app.icon && <span className="text-slate-300 font-bold text-[10px]">?</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-none mb-1">{app.name}</p>
                <p className={cn("text-[12px] leading-none", app.complete ? "text-success" : "text-muted-text italic")}>
                  {app.status}
                </p>
              </div>
              {app.complete ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-blue cursor-pointer transition-colors" />
              )}
            </div>
          ))}
        </div>
        <div className="p-[15px] bg-slate-50/50 flex justify-between items-center">
          <button className="text-[12px] font-medium text-blue hover:underline">Push all to Jira</button>
          <span className="text-[11px] text-slate-400">Synced 3m ago</span>
        </div>
      </div>

      {/* Assignee Summary Card */}
      <div className="bg-white border border-border-dash rounded-[10px] overflow-hidden shadow-sm">
        <div className="px-[18px] py-3.5 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-[14px] font-bold text-[#0F172A]">Task Assignees</h3>
          <span className="text-[12px] text-muted-text font-medium">5 people</span>
        </div>
        <div className="divide-y divide-slate-50">
          {ASSIGNEES.map((person) => (
            <div key={person.name} className="p-[12px_18px] flex items-center gap-3 hover:bg-slate-50/50 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-blue-light text-blue flex items-center justify-center font-bold text-[11px] ring-2 ring-white">
                {person.initial}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-tight">{person.name}</p>
                <p className="text-[12px] text-muted-text">{person.tasks} tasks assigned</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#0F172A] font-mono-data leading-none mb-1">{person.tasks}</p>
                <div className="w-10 h-[3px] bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue" style={{ width: `${(person.tasks / 10) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-[15px] bg-slate-50/50">
          <button className="flex items-center gap-2 text-[12px] font-medium text-blue hover:underline">
            <Bell className="w-3.5 h-3.5" /> Notify all assignees
          </button>
        </div>
      </div>

      {/* File Info Card */}
      <div className="bg-white border border-border-dash rounded-[10px] overflow-hidden shadow-sm">
        <div className="px-[18px] py-3.5 border-b border-slate-50 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400" />
          <h3 className="text-[14px] font-bold text-[#0F172A]">Meeting Details</h3>
        </div>
        <div className="p-1.5 space-y-0.5">
          {[
            { label: "Source File", value: "transcript_mar21.vtt" },
            { label: "File Size", value: "48 KB" },
            { label: "Word Count", value: "4,218 words" },
            { label: "Language", value: "English" },
            { label: "Analysed By", value: "5 agents" },
            { label: "Duration", value: "58.4s" },
            { label: "Created By", value: "You (Manager)" },
          ].map((row) => (
            <div key={row.label} className="p-[8px_14px] flex justify-between items-center rounded-md hover:bg-slate-50">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
              <span className="text-[12.5px] font-medium text-body truncate max-w-[160px]">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex gap-2">
          <Button variant="ghost" className="flex-1 h-8 text-[11px] font-bold gap-2 text-slate-500 hover:text-blue hover:bg-white border border-transparent hover:border-blue/20">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
          <div className="w-px h-8 bg-slate-200" />
          <Button variant="ghost" className="flex-1 h-8 text-[11px] font-bold gap-2 text-error hover:bg-error-bg border border-transparent hover:border-error/20">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
