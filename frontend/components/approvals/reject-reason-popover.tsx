"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RejectReasonPopoverProps {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectReasonPopover({ onConfirm, onCancel }: RejectReasonPopoverProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xl w-[340px] animate-in zoom-in-95 fade-in duration-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
        <h3 className="text-[13px] font-bold text-slate-900 tracking-tight">Rejection Reason</h3>
        <button onClick={onCancel}>
          <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
        </button>
      </div>

      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Optional — explain why this action was rejected..."
        className="min-h-[120px] text-[13px] border-slate-200 focus-visible:ring-blue rounded-lg shadow-inner bg-slate-50/50 resize-none py-3"
      />

      <div className="flex items-center gap-2 mt-4">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="h-9 px-4 text-[12px] font-bold text-slate-400 hover:bg-slate-50 flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onConfirm(reason)}
          className="h-9 px-4 bg-error hover:bg-red-700 text-white font-bold text-[12px] rounded-lg shadow-md shadow-error/10 flex-1"
        >
          Confirm Reject
        </Button>
      </div>
    </div>
  );
}
