"use client";

import { Search, List, LayoutGrid, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MeetingsFiltersProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function MeetingsFilters({ view, onViewChange }: MeetingsFiltersProps) {
  return (
    <div className="flex items-center gap-[10px] mb-[16px]">
      {/* Left Group */}
      <div className="flex items-center gap-[10px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input 
            placeholder="Search meetings..." 
            className="w-[260px] h-[36px] pl-9 bg-white border-[#E2E8F0] rounded-md text-[13px] focus:ring-1 focus:ring-blue/10"
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-[130px] h-[36px] bg-white border-[#E2E8F0] rounded-md text-[13px] text-[#64748B]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="analysing">Analysing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="w-[180px] h-[36px] bg-white border-[#E2E8F0] rounded-md px-3 justify-between text-[13px] text-[#64748B] font-normal">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#94A3B8]" />
            <span>Select date range</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] h-[36px] bg-white border-[#E2E8F0] rounded-md text-[13px] text-[#64748B]">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="meet">Google Meet</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="manual">Manual upload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right Group */}
      <div className="ml-auto flex items-center gap-[8px]">
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
           <button 
            onClick={() => onViewChange("list")}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all",
              view === "list" ? "bg-white shadow-sm text-blue" : "text-slate-400 hover:text-slate-600"
            )}
           >
              <List className="w-4 h-4" />
           </button>
           <button 
            onClick={() => onViewChange("grid")}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-md transition-all",
              view === "grid" ? "bg-white shadow-sm text-blue" : "text-slate-400 hover:text-slate-600"
            )}
           >
              <LayoutGrid className="w-4 h-4" />
           </button>
        </div>

        <Select defaultValue="newest">
          <SelectTrigger className="w-[140px] h-[36px] bg-white border-[#E2E8F0] rounded-md text-[13px] text-[#64748B]">
            <SelectValue placeholder="Date (newest)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date (newest)</SelectItem>
            <SelectItem value="oldest">Date (oldest)</SelectItem>
            <SelectItem value="tasks">Tasks: most</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
