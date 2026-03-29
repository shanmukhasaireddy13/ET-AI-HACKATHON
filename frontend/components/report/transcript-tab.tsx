"use client";

import { User, Clock, CheckCircle2 } from "lucide-react";

export function TranscriptTab({ transcript }: { transcript?: string }) {
  const segments = transcript ? [
    { id: 1, speaker: "Meeting Content", time: "Original", text: transcript, avatar: "M" }
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted-text">
          Showing <span className="font-bold text-[#0F172A]">{segments.length} segments</span> from the meeting
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {segments.map((segment) => (
          <div key={segment.id} className="flex gap-4 group">
            <div className="flex-shrink-0">
               <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[13px] border border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue/20 transition-all">
                 {segment.avatar}
               </div>
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-bold text-[#0F172A]">{segment.speaker}</span>
                  <span className="text-[11px] font-medium text-slate-400">{segment.time}</span>
               </div>
               <div className="bg-white border border-border-dash rounded-r-[12px] rounded-bl-[12px] p-4 shadow-sm group-hover:shadow-md transition-all">
                  <p className="text-[14.5px] text-[#334155] leading-[1.6] whitespace-pre-wrap">{segment.text}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-10 text-slate-400">
           <p>No transcript available for this session.</p>
        </div>
      )}
    </div>
  );
}
