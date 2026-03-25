"use client";

import { Mic, CheckCircle2, Loader2, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: any;
  value: string | number;
  label: string;
  iconColor: string;
  iconBg: string;
  textColor?: string;
  isSpinning?: boolean;
}

const StatCard = ({ icon: Icon, value, label, iconColor, iconBg, textColor = "text-[#0F172A]", isSpinning }: StatCardProps) => (
  <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 flex items-center gap-4 transition-all hover:shadow-sm">
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
      <Icon className={cn("w-5 h-5", iconColor, isSpinning && "animate-spin")} />
    </div>
    <div className="flex flex-col">
      <span className={cn("text-[20px] font-bold leading-none font-mono tracking-tight", textColor)}>
        {value}
      </span>
      <span className="text-[11px] text-[#64748B] font-medium mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  </div>
);

export function MeetingsStats({ stats }: { stats: { total: number, completed: number, analysing: number, tasks: number } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] mb-[20px]">
      <StatCard 
        icon={Mic}
        value={stats.total}
        label="Total Meetings"
        iconColor="text-[#2563EB]"
        iconBg="bg-[#EFF6FF]"
      />
      <StatCard 
        icon={CheckCircle2}
        value={stats.completed}
        label="Completed"
        iconColor="text-[#16A34A]"
        iconBg="bg-[#F0FDF4]"
      />
      <StatCard 
        icon={Loader2}
        value={stats.analysing}
        label="Analysing"
        iconColor="text-[#EA580C]"
        iconBg="bg-[#FFF7ED]"
        textColor="text-[#EA580C]"
        isSpinning={stats.analysing > 0}
      />
      <StatCard 
        icon={CheckSquare}
        value={stats.tasks}
        label="Tasks Extracted"
        iconColor="text-[#2563EB]"
        iconBg="bg-[#EFF6FF]"
      />
    </div>
  );
}
