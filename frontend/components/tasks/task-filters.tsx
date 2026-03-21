"use client";

import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TaskView = "kanban" | "table" | "calendar";

interface TaskFiltersProps {
  activeView: TaskView;
  onViewChange: (view: TaskView) => void;
  filters: {
    search: string;
    assignee: string;
    priority: string;
    meeting: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function TaskFilters({
  activeView,
  onViewChange,
  filters,
  onFilterChange,
  onClearFilters
}: TaskFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        {/* View Tabs */}
        <div className="flex items-center gap-8">
          {(["kanban", "table", "calendar"] as TaskView[]).map((view) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={cn(
                "relative h-8 text-[14px] font-semibold transition-all capitalize",
                activeView === view ? "text-blue" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {view}
              {activeView === view && (
                <div className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-blue" />
              )}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue transition-colors" />
            <Input
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              placeholder="Search tasks..."
              className="h-8.5 w-[220px] pl-9 bg-white border-slate-200 focus-visible:ring-blue text-[13px] rounded-lg"
            />
          </div>

          <Select value={filters.assignee} onValueChange={(v) => onFilterChange("assignee", v || "")}>
            <SelectTrigger className="h-8.5 w-[140px] bg-white border-slate-200 text-[13px] rounded-lg">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rahul">Rahul Sharma</SelectItem>
              <SelectItem value="priya">Priya Singh</SelectItem>
              <SelectItem value="david">David Wu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(v) => onFilterChange("priority", v || "")}>
            <SelectTrigger className="h-8.5 w-[120px] bg-white border-slate-200 text-[13px] rounded-lg">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v || "")}>
            <SelectTrigger className="h-8.5 w-[120px] bg-white border-slate-200 text-[13px] rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="review">In Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 px-3 h-8.5 border border-slate-200 rounded-lg bg-white text-[13px] text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Date range</span>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-[12px] font-bold text-error hover:underline ml-2 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <Badge 
                key={key}
                variant="outline" 
                className="bg-blue-light border-blue-mid text-blue px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold"
              >
                <span className="opacity-60 capitalize">{key}:</span>
                {value}
                <X 
                  className="w-2.5 h-2.5 cursor-pointer hover:text-blue-hover" 
                  onClick={() => onFilterChange(key, "")}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
