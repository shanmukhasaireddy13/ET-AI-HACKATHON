"use client";

import { Search, Plus, Table as TableIcon, LayoutGrid, Tag, User, AlertCircle, Upload, Pencil, ExternalLink, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TASKS = [
  { id: "1", title: "Scale out API instances for pricing engine", assignee: "Rahul Sharma", priority: "High", due: "Mar 25", status: "In Progress", jira: "PROJ-102" },
  { id: "2", title: "Audit security protocols for cross-site sessions", assignee: "Priya Singh", priority: "High", due: "Mar 25", status: "To Do", jira: null },
  { id: "3", title: "Update README with new microservices map", assignee: "Unassigned", priority: "Normal", due: "Mar 28", status: "To Do", jira: null },
  { id: "4", title: "Review Q2 budget allocation draft", assignee: "John Doe", priority: "Medium", due: "Today", status: "Blocked", jira: "PROJ-105" },
  { id: "5", title: "Draft performance benchmark for v3 gateway", assignee: "Sarah Smith", priority: "Normal", due: "Mar 25", status: "Done", jira: "PROJ-110" },
];

export function TasksTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-8 h-[34px] bg-dash-bg border-border-dash text-[13px] focus-visible:ring-blue"
            />
          </div>
          <Button variant="outline" className="h-[34px] text-[12px] font-semibold gap-1.5 border-border-dash bg-white text-muted-text hover:border-blue px-3 transition-all">
            Priority <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>
          <Button variant="outline" className="h-[34px] text-[12px] font-semibold gap-1.5 border-border-dash bg-white text-muted-text hover:border-blue px-3 transition-all">
            Assignee <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-dash-bg border border-border-dash rounded-lg">
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-blue border border-blue/10">
              <TableIcon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button className="h-[34px] bg-blue hover:bg-blue-hover text-white text-[12px] font-bold gap-1.5 px-3.5 shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border-dash rounded-[10px] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-dash-bg/50 h-10">
            <TableRow className="hover:bg-transparent border-border-dash">
              <TableHead className="w-12 text-center">
                <Checkbox className="rounded-[3px] border-slate-300 w-3.5 h-3.5" />
              </TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">Task Title</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[130px]">Assignee</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[90px]">Priority</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[100px]">Due Date</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[110px]">Status</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[80px]">Jira</TableHead>
              <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[72px] text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TASKS.map((task) => (
              <TableRow key={task.id} className="h-13 group hover:bg-slate-50/50 border-slate-50 transition-colors cursor-pointer">
                <TableCell className="text-center">
                  <Checkbox className="rounded-[3px] border-slate-300 w-3.5 h-3.5 group-hover:border-blue transition-colors" />
                </TableCell>
                <TableCell className="pl-2">
                  <p className="text-[13.5px] font-semibold text-[#0F172A] leading-none mb-1.5">{task.title}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Tag className="w-2.5 h-2.5" />
                    <span>From: Engineering Planning</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-light text-blue flex items-center justify-center font-bold text-[9px] ring-1 ring-white">
                      {task.assignee === "Unassigned" ? "?" : task.assignee.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <span className={cn("text-[12.5px]", task.assignee === "Unassigned" ? "text-slate-400 italic" : "text-body font-medium")}>
                      {task.assignee === "Unassigned" ? "Unassigned" : task.assignee}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                    task.priority === "High" ? "bg-error-bg text-red-600 border-error-border" :
                    task.priority === "Medium" ? "bg-warning-bg text-warning border-warning-border" :
                    "bg-slate-50 text-slate-500 border-slate-200"
                  )}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className={cn(
                    "flex items-center gap-1 text-[12.5px] font-medium",
                    task.due === "Today" ? "text-warning" : "text-body"
                  )}>
                    {task.due === "Today" && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
                    {task.due}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                    task.status === "Done" ? "bg-success-bg text-success border-success-border" :
                    task.status === "In Progress" ? "bg-blue-light text-blue border-blue-mid" :
                    task.status === "Blocked" ? "bg-error-bg text-error border-error-border" :
                    "bg-slate-50 text-slate-500 border-slate-200"
                  )}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.jira ? (
                    <div className="flex items-center gap-1.5 text-blue hover:underline font-bold text-[11px]">
                      <span className="w-3.5 h-3.5 bg-blue/10 rounded flex items-center justify-center text-[8px]">J</span>
                      {task.jira}
                    </div>
                  ) : (
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue transition-colors font-bold text-[11px] group/push">
                      <Upload className="w-3 h-3 group-hover/push:-translate-y-0.5 transition-transform" />
                      Push
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-blue hover:bg-blue-light rounded-md transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-error hover:bg-error-bg rounded-md transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-[12px] text-muted-text bg-white">
          <span>Showing 5 of 14 tasks</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" disabled className="h-8 text-[12px] px-2 hover:bg-slate-100">Prev</Button>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded bg-blue text-white font-bold">1</button>
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 font-medium">2</button>
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 font-medium">3</button>
            </div>
            <Button variant="ghost" className="h-8 text-[12px] px-2 hover:bg-slate-100">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
