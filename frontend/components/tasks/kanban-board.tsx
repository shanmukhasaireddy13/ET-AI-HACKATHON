"use client";

import { KanbanColumn } from "./kanban-column";
import { KanbanCard, Priority } from "./kanban-card";

export interface Task {
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

const COLUMNS = [
  { id: "todo", title: "To Do", color: "#94A3B8" },
  { id: "inprogress", title: "In Progress", color: "#2563EB" },
  { id: "review", title: "In Review", color: "#EA580C" },
  { id: "done", title: "Done", color: "#16A34A" },
  { id: "blocked", title: "Blocked", color: "#DC2626" },
];

export function KanbanBoard({ tasks = [] }: { tasks?: Task[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-10 no-scrollbar items-start min-h-[calc(100vh-240px)]">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
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
