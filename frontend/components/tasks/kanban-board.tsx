"use client";

import { KanbanColumn } from "./kanban-column";
import { KanbanCard, Priority } from "./kanban-card";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: "todo" | "inprogress" | "review" | "done" | "blocked";
  source: string;
  assignee?: { name: string; avatar?: string };
  dueDate?: string;
  isOverdue?: boolean;
  subtasks?: { completed: number; total: number };
}

const SAMPLE_TASKS: Task[] = [
  { id: "1", title: "Implement OAuth2 validation flow in API v3", priority: "High", status: "inprogress", source: "Security Sync", assignee: { name: "David Wu" }, dueDate: "Mar 22", subtasks: { completed: 4, total: 6 } },
  { id: "2", title: "Rotate database credentials for staging", priority: "High", status: "inprogress", source: "Security Sync", assignee: { name: "David Wu" }, dueDate: "Today", isOverdue: false },
  { id: "3", title: "Update firewall rules for new VPC", priority: "Medium", status: "todo", source: "Security Sync", assignee: { name: "Sarah Connor" }, dueDate: "Mar 25" },
  { id: "4", title: "Finalize engineering roadmap labels", priority: "Low", status: "done", source: "Ops Sync", assignee: { name: "Rahul Sharma" } },
  { id: "5", title: "Fix memory leak in websocket handler", priority: "High", status: "blocked", source: "Service Health", assignee: { name: "Kyle Reese" }, isOverdue: true, dueDate: "Mar 19" },
  { id: "6", title: "Draft investor summary for Q2", priority: "Medium", status: "review", source: "Ops Sync", assignee: { name: "Priya Singh" }, dueDate: "Tomorrow" },
];

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#94A3B8" },
  { id: "inprogress", title: "In Progress", color: "#2563EB" },
  { id: "review", title: "In Review", color: "#EA580C" },
  { id: "done", title: "Done", color: "#16A34A" },
  { id: "blocked", title: "Blocked", color: "#DC2626" },
];

export function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-10 no-scrollbar items-start min-h-[calc(100vh-240px)]">
      {COLUMNS.map((col) => {
        const columnTasks = SAMPLE_TASKS.filter(t => t.status === col.id);
        
        return (
          <KanbanColumn 
            key={col.id}
            title={col.title}
            count={columnTasks.length}
            color={col.color}
          >
            {columnTasks.map((task) => (
              <KanbanCard key={task.id} {...task} />
            ))}
            
            {columnTasks.length === 0 && (
              <div className="h-24 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white/30 mb-2">
                 <span className="text-[11px] font-bold uppercase tracking-widest">Empty</span>
              </div>
            )}
          </KanbanColumn>
        );
      })}
    </div>
  );
}
