"use client";

import Link from "next/link";
import { ChevronRight, RefreshCw, Share2, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportHeaderProps {
  title: string;
  isSyncedWithJira?: boolean;
}

export function ReportHeader({ title, isSyncedWithJira = false }: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
      {/* Left: Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px]">
        <Link href="/dashboard/meetings" className="text-muted-text hover:text-blue hover:underline transition-all">
          Meetings
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-medium text-[#0F172A] truncate max-w-[240px] md:max-w-none">{title}</span>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" className="h-[34px] bg-white border-border-dash text-[13px] text-body gap-2 px-3.5 hover:border-blue hover:text-blue transition-all">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue" />
          <span>Re-analyse</span>
        </Button>
        <Button variant="outline" className="h-[34px] bg-white border-border-dash text-[13px] text-body gap-2 px-3.5 hover:border-blue hover:text-blue transition-all">
          <Share2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Share</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <div className="h-[34px] bg-white border border-border-dash rounded-md text-[13px] text-body flex items-center gap-2 px-3.5 hover:border-blue hover:text-blue transition-all cursor-pointer">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
              </div>
            }
          />
          <DropdownMenuContent align="end" className="w-[180px] rounded-lg border-border-dash shadow-lg p-1">
            <DropdownMenuItem className="gap-2 text-[13px] py-2 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-slate-400" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-[13px] py-2 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-slate-400" /> Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isSyncedWithJira ? (
          <div className="h-[34px] bg-success-bg border border-success-border text-success text-[13px] font-semibold flex items-center gap-2 px-4 rounded-md cursor-default shadow-sm">
             <CheckCircle2 className="w-3.5 h-3.5" />
             Synced with Jira
          </div>
        ) : (
          <Button className="h-[34px] bg-blue hover:bg-blue-hover text-white text-[13px] font-semibold gap-2 px-4 shadow-sm hover:-translate-y-0.5 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h3.69v3.74c0 2.4 1.95 4.35 4.35 4.35V2h-12.39zM1.92 11.51v10.41h10.41c-2.4 0-4.35-1.97-4.35-4.37v-3.67c0-2.4-1.97-4.35-4.35-4.35L1.92 11.51zM11.53 11.51v10.42h10.41v-3.69c0-2.4-1.95-4.35-4.35-4.35h-3.71c-2.4 0-4.35-1.95-4.35-4.37V11.51z"/>
            </svg>
            Push to Jira
          </Button>
        )}
      </div>
    </div>
  );
}
