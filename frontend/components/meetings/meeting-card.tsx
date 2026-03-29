"use client";

import { 
  Calendar, 
  Users, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Clock 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    date: string;
    duration: number;
    participants: number;
    tasks: number;
    status: string;
    agents: any[];
  }
}

const CompactStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "rounded-[20px] py-0.5 px-2 text-[10px] font-bold border flex items-center gap-1 h-5 uppercase tracking-wider";
  
  switch (status) {
    case "Complete":
      return <div className={cn(baseClasses, "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]")}>Complete</div>;
    case "Analysing":
      return (
        <div className={cn(baseClasses, "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]")}>
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Analysing
        </div>
      );
    case "Failed":
      return <div className={cn(baseClasses, "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]")}>Failed</div>;
    case "Queued":
      return <div className={cn(baseClasses, "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]")}>Queued</div>;
    default:
      return <div className={cn(baseClasses, "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]")}>{status}</div>;
  }
};

export function MeetingCard({ meeting }: MeetingCardProps) {
  const statusColors: any = {
    "Complete": "bg-[#16A34A]",
    "Analysing": "bg-[#EA580C]",
    "Failed": "bg-[#DC2626]",
    "Queued": "bg-[#E2E8F0]"
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden transition-all duration-150 hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] hover:border-[#BFDBFE] group flex flex-col h-full">
      {/* Top Accent Bar */}
      <div className={cn("h-[3px] w-full", statusColors[meeting.status] || "bg-slate-200")} />
      
      <div className="p-[16px_18px] flex-1">
         <h4 className="text-[14px] font-semibold text-[#0F172A] leading-tight line-clamp-2 min-h-[40px]">
            {meeting.title}
         </h4>
         
         <div className="flex items-center gap-1.5 text-[12px] text-[#94A3B8] mt-1 font-medium">
            <Calendar className="w-3 h-3" />
            {meeting.date} · {meeting.duration} min
         </div>

         {/* Participants */}
         <div className="flex items-center mt-3">
            <div className="flex -space-x-[8px] mr-2">
               {[...Array(Math.min(meeting.participants, 4))].map((_, i) => (
                 <div key={i} className="w-[26px] h-[26px] rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    <span className="text-[10px] font-bold text-[#94A3B8] italic">{String.fromCharCode(65 + i)}</span>
                 </div>
               ))}
               {meeting.participants > 4 && (
                 <div className="w-[26px] h-[26px] rounded-full border-2 border-white bg-[#F8FAFC] flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[9px] font-bold text-[#64748B]">+{meeting.participants - 4}</span>
                 </div>
               )}
            </div>
         </div>

         {/* Stats Row */}
         <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col leading-none">
               <span className="text-[16px] font-bold font-mono text-[#0F172A]">{meeting.tasks || "—"}</span>
               <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider mt-0.5">tasks</span>
            </div>
            <CompactStatusBadge status={meeting.status} />
         </div>
      </div>

      {/* Footer */}
      <div className="p-[10px_18px] border-t border-[#F1F5F9] bg-[#FAFAFA]/50 group-hover:bg-white flex gap-2 transition-colors">
         <Button variant="outline" className="flex-1 h-8 text-[12px] font-bold border-[#E2E8F0] text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] bg-white">
            Open Report
         </Button>
         <Button variant="outline" className="w-8 h-8 p-0 border-[#E2E8F0] text-[#64748B] hover:text-[#EA580C] hover:border-[#FED7AA] hover:bg-[#FFF7ED] bg-white">
            <RefreshCw className="w-3.5 h-3.5" />
         </Button>
         <Button variant="outline" className="w-8 h-8 p-0 border-[#E2E8F0] text-[#64748B] hover:text-[#DC2626] hover:border-[#FECACA] hover:bg-[#FEF2F2] bg-white">
            <Trash2 className="w-3.5 h-3.5" />
         </Button>
      </div>
    </div>
  );
}
