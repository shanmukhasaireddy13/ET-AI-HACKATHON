"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ApprovalHeaderProps {
  pendingCount: number;
}

export function ApprovalHeader({ pendingCount }: ApprovalHeaderProps) {
  const hasLowRisk = pendingCount > 0; // Simplified logic for mockup

  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Approvals</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">Review and action agent requests before they execute</p>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>

            <Button
              variant="outline"
              disabled={!hasLowRisk}
              className={cn(
                "h-9 px-4 rounded-lg flex items-center gap-2 font-bold text-[13px] transition-all",
                hasLowRisk
                  ? "bg-success-bg border-success-border text-success hover:bg-success hover:text-white"
                  : "opacity-40 cursor-not-allowed"
              )}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Approve All Low-Risk
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white border-0 text-[11px] px-3 py-1.5 font-medium">
            Approves all Medium and Low priority pending items
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
