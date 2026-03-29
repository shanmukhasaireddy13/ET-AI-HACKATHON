"use client";

import { Search, LayoutGrid, List, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AgentToolbar() {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search agents..." 
            className="pl-9 h-9 bg-white border-slate-200 text-[13px] focus-visible:ring-blue transition-all"
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[130px] h-9 text-[13px] bg-white border-slate-200 focus:ring-blue">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] h-9 text-[13px] bg-white border-slate-200 focus:ring-blue">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="parser">Parser</SelectItem>
            <SelectItem value="extractor">Extractor</SelectItem>
            <SelectItem value="generator">Generator</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-md bg-white shadow-sm text-blue border border-blue/10">
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors">
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
