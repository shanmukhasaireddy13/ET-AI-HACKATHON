"use client";

import { Sparkles, RefreshCw, Gavel, ListChecks, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SummaryTab() {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* AI Summary Card */}
      <div className="bg-white border border-border-dash rounded-[10px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-[13px] font-bold uppercase tracking-wider">AI Summary</h3>
          </div>
          <Button variant="ghost" className="h-8 text-[12px] text-muted-text gap-2 hover:text-blue hover:bg-blue-light/50 transition-colors">
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </Button>
        </div>
        
        <p className="text-[15px] text-[#334155] leading-[1.7] DM-Sans">
          Today's session focused on finalizing the engineering roadmap for Q2. The team addressed critical bottlenecks in the API layer and reached a consensus on adopting a micro-services architecture for the new billing module. Key milestones were established for the next three sprints, with a specific focus on cross-team dependencies between frontend and platform teams.
        </p>

        {/* Outcome Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <OutcomeCard 
            title="Decisions Made"
            value="6 decisions"
            subValue="2 critical"
            icon={Gavel}
            iconBg="bg-blue-light"
            iconColor="text-blue"
          />
          <OutcomeCard 
            title="Action Items"
            value="14 tasks"
            subValue="3 overdue risk"
            icon={ListChecks}
            iconBg="bg-success-bg"
            iconColor="text-success"
          />
          <OutcomeCard 
            title="Follow-up Required"
            value="2 items"
            subValue="Assigned to you"
            icon={AlertTriangle}
            iconBg="bg-warning-bg"
            iconColor="text-warning"
          />
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ title, value, subValue, icon: Icon, iconBg, iconColor }: any) {
  return (
    <div className="bg-dash-bg/50 border border-border-dash rounded-lg p-4 transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 group">
      <div className="flex items-center gap-3">
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="mt-3">
        <p className="text-[16px] font-bold text-[#0F172A]">{value}</p>
        <p className="text-[12px] text-muted-text mt-0.5">{subValue}</p>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
