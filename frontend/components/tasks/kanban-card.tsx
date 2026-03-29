"use client";

import { MoreHorizontal, Tag, UserPlus, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Priority = "High" | "Medium" | "Low";

interface KanbanCardProps {
  id: string;
  title: string;
  priority: Priority;
  source: string;
  assignee?: { name: string; avatar?: string };
  dueDate?: string;
  isOverdue?: boolean;
  isToday?: boolean;
  hasJira?: boolean;
  subtasks?: { completed: number; total: number };
  onClick?: () => void;
}

const PRIORITY_STYLES = {
  High: "bg-error-bg text-error border-error-border",
  Medium: "bg-orange-light text-orange border-orange-200",
  Low: "bg-slate-50 text-slate-500 border-slate-200",
};

export function KanbanCard({
  title,
  priority,
  source,
  assignee,
  dueDate,
  isOverdue,
  isToday,
  hasJira,
  subtasks,
  onClick
}: KanbanCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-mid transition-all duration-200 group select-none"
    >
      {/* Row 1: Priority + Options */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", PRIORITY_STYLES[priority])}>
          {priority}
        </Badge>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-50 rounded text-slate-400">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Row 2: Title */}
      <h3 className="text-[13px] font-bold text-slate-900 leading-snug mt-2 line-clamp-2 min-h-[36px]">
        {title}
      </h3>

      {/* Row 3: Subtasks Progress */}
      {subtasks && (
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
             <span>{subtasks.completed}/{subtasks.total} subtasks</span>
             <span>{Math.round((subtasks.completed / subtasks.total) * 100)}%</span>
          </div>
          <div className="h-[3px] w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue transition-all duration-500" 
              style={{ width: `${(subtasks.completed / subtasks.total) * 100}%` }} 
            />
          </div>
        </div>
      )}

      {/* Row 4: Source */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
        <Tag className="w-3 h-3 text-slate-300" />
        {source}
      </div>

      {/* Row 5: Footer */}
      <div className="mt-3.5 pt-3 border-t border-slate-50 flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="w-[22px] h-[22px] border border-white shadow-sm ring-1 ring-slate-100">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-[9px] font-bold bg-slate-100 text-slate-500">
                {assignee.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-[12px] font-bold text-slate-600 tracking-tight">{assignee.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 hover:text-blue cursor-pointer transition-colors group/assign">
            <div className="w-[22px] h-[22px] rounded-full border border-dashed border-slate-200 flex items-center justify-center group-hover/assign:border-blue transition-colors">
              <UserPlus className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-bold italic">Assign</span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {hasJira && (
            <div className="w-5 h-5 rounded-md bg-blue-light flex items-center justify-center">
              <ExternalLink className="w-3 h-3 text-blue" />
            </div>
          )}
          {dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold",
              isOverdue ? "text-error" : isToday ? "text-orange" : "text-slate-400"
            )}>
              <Calendar className="w-3 h-3" />
              {dueDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
