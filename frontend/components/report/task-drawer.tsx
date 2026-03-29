"use client";

import { X, Pencil, User, Calendar as CalendarIcon, Link as LinkIcon, Plus, Trash2, ShieldAlert, Bot, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any | null;
}

export function TaskDrawer({ open, onOpenChange, task }: TaskDrawerProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-border-dash shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto">
          <SheetHeader className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
            <SheetTitle className="text-[14px] font-bold text-slate-400 uppercase tracking-widest leading-none">Task Detail</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="group">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-[18px] font-bold text-[#0F172A] leading-tight flex-1">
                  {task.title}
                </h2>
                <button className="p-1.5 text-slate-300 hover:text-blue hover:bg-blue-light rounded-md opacity-0 group-hover:opacity-100 transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <Badge className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold cursor-pointer transition-all hover:ring-2 hover:ring-offset-1",
                  task.status === "Done" ? "bg-success-bg text-success border-success-border ring-success/20" :
                  task.status === "In Progress" ? "bg-blue-light text-blue border-blue-mid ring-blue/20" :
                  "bg-slate-50 text-slate-500 border-slate-200 ring-slate-200"
                )}>
                  {task.status}
                </Badge>
                <Badge className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold cursor-pointer transition-all hover:ring-2 hover:ring-offset-1",
                  task.priority === "High" ? "bg-error-bg text-error border-error-border ring-error/20" :
                  "bg-warning-bg text-warning border-warning-border ring-warning/20"
                )}>
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <Textarea 
                placeholder="Add a detailed description..." 
                className="min-height-[100px] bg-slate-50 border-border-dash text-[14px] focus-visible:ring-blue resize-none"
                defaultValue="Scale out pricing-engine-api to 3 instances in production. Ensure health checks are updated to reflect new v3 endpoints."
              />
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Assignee</label>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-border-dash cursor-pointer hover:bg-white transition-colors">
                  <div className="w-6 h-6 rounded-full bg-blue text-white flex items-center justify-center font-bold text-[10px]">RS</div>
                  <span className="text-[13px] font-medium text-body">{task.assignee}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-border-dash cursor-pointer hover:bg-white transition-colors">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] font-medium text-body">{task.due}</span>
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Source Meeting</label>
              <div className="flex items-center gap-2 text-[13px] text-blue font-semibold hover:underline cursor-pointer">
                Engineering Planning — Q2 Kickoff <LinkIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subtasks (2)</label>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                  <Checkbox className="rounded-sm border-slate-300" checked />
                  <span className="text-[13px] text-muted-text line-through">Check production limit quotas</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <Checkbox className="rounded-sm border-slate-300" />
                  <span className="text-[13px] text-body">Verify health-check endpoints in staging</span>
                </div>
                <button className="flex items-center gap-2 text-[12px] font-bold text-blue hover:underline py-2 pl-2">
                  <Plus className="w-3.5 h-3.5" /> Add subtask
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Comments</label>
               <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                 <div className="flex-1 space-y-2">
                   <Textarea placeholder="Post a comment..." className="min-h-[60px] text-[13px] border-border-dash focus-visible:ring-blue" />
                   <Button variant="outline" className="h-8 text-[11px] font-bold border-blue text-blue hover:bg-blue-light transition-all px-4">Post Comment</Button>
                 </div>
               </div>
            </div>

            {/* Activity timeline */}
            <div className="space-y-3 pt-4 border-t border-slate-100 pb-12">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Activity</label>
               <div className="space-y-3 relative pl-4">
                 <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-slate-100" />
                 <div className="relative">
                   <div className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300" />
                   <p className="text-[12px] text-muted-text">Task created by <span className="font-bold text-slate-500">Assignment Agent</span> · 10:47 AM</p>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue" />
                    <p className="text-[12px] text-muted-text"><span className="font-bold text-slate-500">You</span> updated status to <span className="font-bold text-blue">In Progress</span> · 11:02 AM</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <Button variant="ghost" className="h-[38px] text-[13px] text-error hover:bg-error-bg font-bold gap-2">
            <Trash2 className="w-4 h-4" /> Delete Task
          </Button>
          <Button className="h-[38px] bg-blue hover:bg-blue-hover text-white text-[13px] font-bold px-8 shadow-md transition-all active:scale-95">
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
