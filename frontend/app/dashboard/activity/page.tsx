"use client";

import { useState, useEffect } from "react";
import { Radio, Download, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActivityStats } from "@/components/activity/activity-stats";
import { ActivityFilters } from "@/components/activity/activity-filters";
import { ActivityTable } from "@/components/activity/activity-table";
import { ExportDropdown } from "@/components/activity/export-dropdown";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityLogPage() {
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-8 py-7">
        
        {/* Section 1: Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Activity Log</h1>
            <p className="text-[13px] text-slate-500 mt-1">Complete audit trail of all workspace actions</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Toggle Pill */}
            <button 
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
                isLive 
                  ? "bg-green-light/10 border-green-border text-green shadow-[0_0_10px_rgba(22,163,74,0.1)]" 
                  : "bg-slate-100 border-slate-200 text-slate-500"
              )}
            >
              <Radio className={cn("w-3.5 h-3.5 transition-transform", isLive && "scale-110")} />
              <span className="text-[13px] font-bold">Live</span>
              <div className="relative flex h-2 w-2">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                )}
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isLive ? "bg-green" : "bg-slate-400"
                )}></span>
              </div>
            </button>

            <ExportDropdown />
          </div>
        </div>

        {/* Section 2: Stats Strip */}
        <ActivityStats />

        <div className="h-6" />

        {/* Section 3: Filters & Toolbar */}
        <ActivityFilters />

        {/* Section 4: Activity Table */}
        <div className="relative">
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-blue animate-spin" />
              <p className="text-[13px] font-medium text-slate-400">Loading workspace history...</p>
            </div>
          ) : (
            <>
              <ActivityTable />
              
              {/* Live Listener Text */}
              {isLive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 mt-6 text-[12px] text-slate-400 italic"
                >
                  <div className="flex space-x-1">
                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  Listening for new workspace events...
                </motion.div>
              )}
            </>
          )}

          {/* Empty State Overlay Suggestion (Hidden by default) */}
          <div className="hidden mt-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900">No activity matches your filters</h3>
            <p className="text-[13px] text-slate-500 mt-1 max-w-[300px]">Try adjusting your search criteria or clear all filters to see more results.</p>
            <Button variant="link" className="text-blue mt-2 font-bold">Clear all filters</Button>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="max-w-[1280px] mx-auto px-8 pb-12 opacity-30 pointer-events-none">
        <div className="border-t border-slate-200 mt-12 pt-6 flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>MeetingMind Audit System v2.4</span>
          <span>Security & Compliance Verified</span>
        </div>
      </div>
    </div>
  );
}
