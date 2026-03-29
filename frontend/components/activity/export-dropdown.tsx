"use client";

import { Download, ChevronDown, FileText, Code, Copy } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ExportDropdown() {
  const handleExport = (type: string) => {
    // Mock export logic
    console.log(`Exporting as ${type}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-9 gap-2 text-[13px] font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[180px] p-1.5 rounded-xl shadow-lg border-slate-200">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="rounded-lg gap-2 text-[13px] font-medium py-2 px-3 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">
          <FileText className="w-4 h-4 text-slate-400" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="rounded-lg gap-2 text-[13px] font-medium py-2 px-3 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">
          <Code className="w-4 h-4 text-slate-400" />
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
        <DropdownMenuItem onClick={() => handleExport("copy")} className="rounded-lg gap-2 text-[13px] font-medium py-2 px-3 focus:bg-slate-50 focus:text-slate-900 cursor-pointer">
          <Copy className="w-4 h-4 text-slate-400" />
          Copy last 100 entries
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
