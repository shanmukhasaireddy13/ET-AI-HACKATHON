"use client";

import { Search, X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ActivityFilters() {
  const [activeFilters, setActiveFilters] = useState([
    { id: "1", type: "Level", value: "Error" },
    { id: "2", type: "Actor", value: "Jira Agent" }
  ]);

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== id));
  };

  const clearAll = () => setActiveFilters([]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
      {/* Row 1: Primary Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search logs..." 
            className="pl-9 h-10 border-slate-200 focus:border-blue focus:ring-blue/10 rounded-lg transition-all"
          />
        </div>

        <Button variant="outline" className="h-10 border-slate-200 text-slate-600 gap-2 font-medium px-4">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>Mar 15 – Mar 21</span>
        </Button>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[140px] h-10 border-slate-200 rounded-lg">
            <SelectValue placeholder="Actor Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actors</SelectItem>
            <SelectItem value="agents">Agents only</SelectItem>
            <SelectItem value="managers">Manager only</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[160px] h-10 border-slate-200 rounded-lg">
            <SelectValue placeholder="Specific Actor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actors</SelectItem>
            <SelectItem value="jira">Jira Agent</SelectItem>
            <SelectItem value="slack">Slack Agent</SelectItem>
            <SelectItem value="you">You</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[150px] h-10 border-slate-200 rounded-lg">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="task">Task Created</SelectItem>
            <SelectItem value="approval">Approval</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[120px] h-10 border-slate-200 rounded-lg">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
            <Filter className="w-3.5 h-3.5" />
            Active:
          </div>
          {activeFilters.map((filter) => (
            <Badge 
              key={filter.id}
              variant="secondary"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-full px-3 py-1 gap-1.5 group transition-all"
            >
              <span className="opacity-50 font-medium">{filter.type}:</span>
              <span className="font-semibold">{filter.value}</span>
              <button 
                onClick={() => removeFilter(filter.id)}
                className="hover:text-slate-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button 
            onClick={clearAll}
            className="text-[12px] font-semibold text-error hover:text-error/80 transition-colors px-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Row 3: Result Summary */}
      <div className="flex items-center justify-between mt-4 text-[12px] font-medium text-slate-500">
        <div>
          Showing <span className="text-slate-900 font-bold">200</span> of <span className="text-slate-900 font-bold">1,204</span> events
        </div>
        <button className="text-blue hover:underline font-semibold flex items-center gap-1">
          Load more history
        </button>
      </div>
    </div>
  );
}
