"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  total: number;
  inProgress: number;
  overdue: number;
  onAddTask: () => void;
}

export function TaskHeader({ total, inProgress, overdue, onAddTask }: TaskHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Tasks</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          {total} total · {inProgress} in progress · <span className="text-error font-semibold">{overdue} overdue</span>
        </p>
      </div>

      <Button 
        onClick={onAddTask}
        className="h-9 px-4 bg-blue hover:bg-blue-hover text-white font-bold text-[13px] rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </Button>
    </div>
  );
}
