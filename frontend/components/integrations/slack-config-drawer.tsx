"use client";

import { X, Check, Hash, MessageSquare, Bot, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface SlackConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlackConfigDrawer({ open, onOpenChange }: SlackConfigDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center p-1.5 bg-[#4A154B]/5">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#4A154B] fill-current"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52h-2.521zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.52 2.52h-2.522v-2.52zM17.688 8.834a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.167 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.167 18.958a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.522v-2.52h2.521zM15.167 17.688a2.527 2.527 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.167a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/></svg>
               </div>
               <SheetTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Slack Configuration</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          <div className="p-6 space-y-8 pb-12">
            {/* Section: Connection */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Connection</h3>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-full bg-green text-white flex items-center justify-center shadow-md shadow-green/10">
                        <Check className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-none">Connected to Acme HQ</p>
                        <p className="text-[12px] text-slate-500 mt-1">Authorized on Mar 12, 2026</p>
                     </div>
                  </div>
                  <button className="text-[12px] font-bold text-blue hover:underline decoration-blue/30 underline-offset-4 transition-all">Reconnect</button>
               </div>
            </div>

            {/* Section: Notification Rules */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Notification Rules</h3>
               <div className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[13px] font-bold text-slate-700 ml-1">Default Channel</label>
                     <Select defaultValue="eng-sync">
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-[13px] font-bold rounded-lg shadow-sm">
                           <div className="flex items-center gap-2">
                              <Hash className="w-3.5 h-3.5 text-slate-400" />
                              <SelectValue placeholder="Select channel" />
                           </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                           {["eng-sync", "product-updates", "standup-summaries", "ops-alerts"].map(ch => (
                             <SelectItem key={ch} value={ch} className="font-medium">#{ch}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-3 pt-2">
                     <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.05em] ml-1">Notify on events:</p>
                     <div className="space-y-3">
                        {[
                          { label: "New task assigned", checked: true },
                          { label: "Task becomes overdue", checked: true },
                          { label: "Approval required", checked: true },
                          { label: "Meeting analysis complete", checked: false },
                          { label: "Critical agent error", checked: true }
                        ].map((event, i) => (
                           <div key={i} className="flex items-center justify-between group cursor-pointer">
                              <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{event.label}</span>
                              <Switch defaultChecked={event.checked} className="data-[state=checked]:bg-blue" />
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="h-[1px] bg-slate-100" />

                  <div className="space-y-3">
                     {[
                       { label: "Mention assignees (@name)", desc: "Triggers Slack DM notifications for the user", checked: true },
                       { label: "Daily manager digest", desc: "Sent to your private DM at 8:00 AM", checked: false }
                     ].map((rule, i) => (
                        <div key={i} className="flex items-start justify-between gap-4">
                           <div className="space-y-0.5">
                              <p className="text-[13px] font-bold text-slate-900 tracking-tight">{rule.label}</p>
                              <p className="text-[12px] text-slate-500 leading-snug">{rule.desc}</p>
                           </div>
                           <Switch defaultChecked={rule.checked} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Section: Message Preview */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Message Preview</h3>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 shadow-inner">
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded bg-blue flex items-center justify-center shadow-lg shadow-blue/20">
                        <Bot className="w-5 h-5 text-white" />
                     </div>
                     <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                           <span className="text-[13px] font-bold text-slate-900">MeetingMind AI</span>
                           <Badge className="bg-slate-200 text-slate-500 text-[9px] font-bold px-1.5 py-0 h-4 border-0 rounded">APP</Badge>
                           <span className="text-[11px] text-slate-400 font-medium">10:47 AM</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[13px] text-slate-700">New high-priority task assigned to <span className="text-blue font-bold px-0.5 rounded bg-blue-light">@Rahul Sharma</span></p>
                           <div className="border-l-[3px] border-l-blue pl-3 py-1 bg-white rounded shadow-sm border border-slate-100">
                              <p className="text-[13px] font-bold text-slate-900">Implement OAuth2 validation flow in API v3</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">Source: Security Sync · Due: Today</p>
                           </div>
                           <div className="flex gap-2">
                              <div className="h-7 px-3 bg-white border border-slate-200 rounded flex items-center justify-center text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm">View Details</div>
                              <div className="h-7 px-3 bg-white border border-slate-200 rounded flex items-center justify-center text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm">Mark Complete</div>
                           </div>
                        </div>
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
