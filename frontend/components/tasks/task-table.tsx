"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  ArrowUpDown,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GroupBy = "none" | "assignee" | "priority" | "status" | "meeting";

interface Task {
  id: string;
  title: string;
  assignee: { name: string };
  priority: string;
  status: string;
  source: string;
  dueDate: string;
  isOverdue?: boolean;
}

export function TaskTable({ tasks = [] }: { tasks?: Task[] }) {
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const groupData = () => {
    if (groupBy === "none") return { "All Tasks": tasks };
    return tasks.reduce((acc, task) => {
      const key = groupBy === "assignee" ? task.assignee.name : 
                 groupBy === "priority" ? task.priority :
                 groupBy === "status" ? task.status : task.source;
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const groups = groupData();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">{tasks.length} total tasks</span>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">Group by:</span>
            <Select value={groupBy} onValueChange={(v: GroupBy | null) => setGroupBy(v || "none")}>
              <SelectTrigger className="h-8 w-[140px] bg-white border-slate-200 text-[12px] font-bold rounded-lg px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="assignee">Assignee</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="meeting">Source Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-white hover:bg-white border-b border-slate-100">
          <TableRow className="hover:bg-transparent h-10">
            <TableHead className="w-12 pl-6"></TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Task Title</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Assignee</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Priority</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Source Meeting</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Due Date</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(Object.entries(groups) as [string, Task[]][]).map(([groupName, groupTasks]) => (
            <React.Fragment key={groupName}>
              {groupBy !== "none" && (
                <TableRow 
                  className="bg-slate-50/50 hover:bg-slate-50 cursor-pointer h-9 group/header border-b border-slate-100"
                  onClick={() => toggleGroup(groupName)}
                >
                  <TableCell colSpan={7} className="py-0 px-6">
                    <div className="flex items-center gap-2">
                      {collapsedGroups.includes(groupName) ? 
                        <ChevronRight className="w-4 h-4 text-slate-400" /> : 
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.1em]">{groupName}</span>
                      <Badge className="bg-slate-200/50 text-slate-500 text-[10px] font-bold border-0 px-1.5 h-4.5 rounded-full">
                        {groupTasks.length}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {!collapsedGroups.includes(groupName) && groupTasks.map((task) => (
                <TableRow key={task.id} className="h-16 group hover:bg-slate-50/50 transition-colors border-b border-slate-50 transition-all">
                  <TableCell className="pl-6 w-12">
                    <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-blue transition-colors cursor-pointer" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue transition-colors cursor-pointer line-clamp-1">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-slate-600 cursor-pointer">
                            <MessageSquare className="w-3 h-3" /> 4 comments
                         </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-slate-100 shadow-sm">
                        <AvatarFallback className="text-[10px] bg-blue-light text-blue font-bold">{task.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] font-bold text-slate-700 tracking-tight">{task.assignee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                      task.priority === "High" ? "bg-error-bg text-error border-error-border" :
                      task.priority === "Medium" ? "bg-orange-light text-orange border-orange-200" :
                      "bg-blue-light text-blue border-blue-mid"
                    )}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-blue hover:underline cursor-pointer tracking-tight decoration-blue/30 underline-offset-4">
                      {task.source}
                      <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[12px] font-bold",
                      task.dueDate === "Today" ? "text-orange" : 
                      task.dueDate.startsWith("Mar 19") ? "text-error" : "text-slate-500"
                    )}>
                      {task.dueDate}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

