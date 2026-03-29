"use client";

import { X, Zap, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface JiraConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JiraConfigDrawer({ open, onOpenChange }: JiraConfigDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center p-1.5 bg-blue-light/20">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-blue fill-current"><path d="M11.53 2c0 2.399 1.944 4.343 4.342 4.343h4.343V2h-8.685zm0 10.114c0 2.4 1.944 4.343 4.342 4.343h4.343v-4.343h-8.685zm-1.416-5.057c0 2.4-1.943 4.343-4.342 4.343H1.43V7.057h8.685zm0 10.114c0 2.4-1.943 4.343-4.342 4.343H1.43v-4.343h8.685z"/></svg>
               </div>
               <SheetTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Jira Configuration</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          <div className="p-6 space-y-8 pb-12">
            {/* Section: Connection */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Connection</h3>
               <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Workspace URL</label>
                    <Input defaultValue="acme-hq.atlassian.net" className="h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue text-[13px] rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">API Token</label>
                    <div className="relative">
                      <Input type="password" value="••••••••••••••••" readOnly className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg pr-24" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-blue hover:underline decoration-blue/30 underline-offset-4">Regenerate</button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Default Project Key</label>
                    <Input defaultValue="ENG-2026" className="h-10 bg-slate-50 border-slate-200 focus-visible:ring-blue text-[13px] rounded-lg" />
                  </div>
                  <Button variant="outline" className="h-9 w-full bg-white border-slate-200 text-slate-600 font-bold text-[12px] rounded-lg gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]">
                    <Zap className="w-3.5 h-3.5" /> Test Connection
                  </Button>
               </div>
            </div>

            {/* Section: Task Mapping */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Task Mapping</h3>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                  {/* Priority Mapping */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">MeetingMind Priority → Jira Priority</p>
                    <div className="space-y-2">
                       {["High", "Medium", "Low"].map((p) => (
                         <div key={p} className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 text-[11px] font-bold px-3 h-7">{p}</Badge>
                            <span className="text-slate-300">→</span>
                            <Select defaultValue={p === "High" ? "highest" : p === "Medium" ? "medium" : "low"}>
                               <SelectTrigger className="h-8 w-[140px] bg-white border-slate-200 text-[12px] font-bold rounded-lg shadow-sm">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="highest">Highest</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-200/60" />

                  {/* Status Mapping */}
                  <div className="space-y-3">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Task Status → Jira Status</p>
                     <div className="space-y-2">
                       {["To Do", "In Progress", "Done"].map((s) => (
                         <div key={s} className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-600 ml-1">{s}</span>
                            <span className="text-slate-300">→</span>
                            <Select defaultValue={s.toLowerCase().replace(" ", "")}>
                               <SelectTrigger className="h-8 w-[140px] bg-white border-slate-200 text-[12px] font-bold rounded-lg shadow-sm">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="todo">To Do</SelectItem>
                                  <SelectItem value="inprogress">In Progress</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                  <SelectItem value="blocked">Blocked</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                       ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Section: Sync Rules */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sync Rules</h3>
               <div className="space-y-5">
                  {[
                    { label: "Auto-push tasks after analysis", desc: "Instantly create Jira tickets when AI extracts tasks" },
                    { label: "Require approval for Epics", desc: "Hold Epic creation until manager approves" },
                    { label: "Sync status back to MeetingMind", desc: "Updates in Jira reflect on your Kanban board" }
                  ].map((rule, i) => (
                    <div key={i} className="flex items-start justify-between gap-4">
                       <div className="space-y-0.5">
                          <p className="text-[13px] font-bold text-slate-900">{rule.label}</p>
                          <p className="text-[12px] text-slate-500 leading-snug">{rule.desc}</p>
                       </div>
                       <Switch defaultChecked={i === 0} />
                    </div>
                  ))}
               </div>
            </div>

            {/* Section: Webhooks */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Webhooks</h3>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="space-y-1.5">
                     <label className="text-[12px] font-bold text-slate-500 ml-1">Webhook URL</label>
                     <div className="flex gap-2">
                        <Input readOnly value="https://api.meetingmind.ai/hooks/jira_442" className="h-9 bg-white border-slate-200 text-[12px] font-mono text-slate-500 rounded-lg" />
                        <Button variant="outline" className="h-9 w-9 p-0 border-slate-200"><Copy className="w-3.5 h-3.5" /></Button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[12px] font-bold text-slate-500 ml-1">Subscribed Events</label>
                     <div className="grid grid-cols-2 gap-2">
                        {["Issue Created", "Issue Updated", "Sprint Changed", "Status Change"].map((e) => (
                          <div key={e} className="flex items-center gap-2 group cursor-pointer">
                             <div className="w-4 h-4 rounded border border-slate-200 flex items-center justify-center bg-white group-hover:border-blue transition-colors">
                                <CheckCircle2 className="w-3 h-3 text-blue" />
                             </div>
                             <span className="text-[12px] font-medium text-slate-600">{e}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-[40px] text-[13px] text-slate-400 hover:text-slate-600 font-bold">
            Cancel
          </Button>
          <Button className="h-[40px] bg-blue hover:bg-blue-hover text-white text-[13px] font-bold px-8 shadow-md transition-all active:scale-95">
            Save Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
