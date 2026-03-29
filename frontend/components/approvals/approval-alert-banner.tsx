"use client";

import { AlertTriangle } from "lucide-react";

export function ApprovalAlertBanner() {
  return (
    <div className="bg-orange-light border border-orange-200 rounded-xl p-3.5 px-5 flex items-center justify-between mb-5 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-[18px] h-[18px] text-orange" />
        <p className="text-[14px] font-medium text-amber-900 leading-none">
          <span className="font-bold">3 agent actions</span> are waiting for your approval. Agents are paused until you respond.
        </p>
      </div>
      <button className="text-[13px] font-bold text-orange hover:underline tracking-tight transition-all active:scale-95">
        Review Now ↓
      </button>
    </div>
  );
}
