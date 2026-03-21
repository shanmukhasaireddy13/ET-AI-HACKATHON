"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  onAddTask?: () => void;
}

export function KanbanColumn({ title, count, color, children, onAddTask }: KanbanColumnProps) {
  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col group/col">
      {/* Header */}
      <div 
        className="bg-white border border-slate-200 rounded-t-xl p-3.5 flex items-center justify-between border-b-0"
        style={{ borderTopWidth: "3px", borderTopColor: color }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="text-[13px] font-bold text-slate-900 capitalize tracking-tight">{title}</h2>
          <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] flex items-center justify-center border border-slate-200/50">
            {count}
          </span>
        </div>
        <button 
          onClick={onAddTask}
          className="w-6 h-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Drop Zone */}
      <div className="bg-slate-50/50 border border-slate-200 border-t-0 rounded-b-xl p-2.5 min-h-[300px] flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar hover:bg-blue-light/20 transition-colors duration-300">
        {children}
        
        <button 
          onClick={onAddTask}
          className="w-full h-10 border border-dashed border-slate-200 rounded-lg flex items-center justify-center gap-2 text-[12px] font-bold text-slate-400 hover:border-blue hover:text-blue hover:bg-blue-light/50 transition-all opacity-0 group-hover/col:opacity-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card
        </button>
      </div>
    </div>
  );
}
