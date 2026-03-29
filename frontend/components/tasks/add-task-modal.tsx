"use client";

import { X, Calendar as CalendarIcon, Bot, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (task: any) => void;
}

export function AddTaskModal({ open, onOpenChange, onAdd }: AddTaskModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="px-6 py-4 border-b border-slate-50 flex-row items-center justify-between space-y-0 bg-slate-50/50">
          <DialogTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Add New Task</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:bg-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Task Title <span className="text-error">*</span></label>
            <Input 
              placeholder="e.g. Implement OAuth2 validation" 
              className="h-11 bg-white border-slate-200 focus-visible:ring-blue text-[14px] font-bold rounded-xl shadow-inner"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
            <Textarea 
              placeholder="Add details about this task..." 
              className="min-h-[100px] bg-white border-slate-200 focus-visible:ring-blue text-[14px] font-medium rounded-xl shadow-inner resize-none"
            />
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assignee</label>
              <Select>
                <SelectTrigger className="h-11 bg-white border-slate-200 text-[14px] font-bold rounded-xl shadow-sm">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="rahul">Rahul Sharma</SelectItem>
                  <SelectItem value="priya">Priya Singh</SelectItem>
                  <SelectItem value="david">David Wu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Priority</label>
              <Select defaultValue="medium">
                <SelectTrigger className="h-11 bg-white border-slate-200 text-[14px] font-bold rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Due Date</label>
              <div className="flex items-center gap-3 h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-bold text-slate-500 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                <CalendarIcon className="w-4 h-4 text-slate-300" />
                <span>Select Date</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status</label>
              <Select defaultValue="todo">
                <SelectTrigger className="h-11 bg-white border-slate-200 text-[14px] font-bold rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source Sync */}
          <div className="p-4 bg-blue-light/30 border border-blue-mid/40 rounded-xl space-y-3">
             <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue" />
                <span className="text-[12px] font-bold text-blue uppercase tracking-widest">Automation Settings</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-slate-600">Push to Jira automatically?</span>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                   <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
             </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="h-10 text-[14px] font-bold text-slate-400 hover:bg-white"
          >
            Cancel
          </Button>
          <Button className="h-10 bg-blue hover:bg-blue-hover text-white font-bold text-[14px] rounded-xl px-8 shadow-md shadow-blue/20 transition-all active:scale-95">
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
