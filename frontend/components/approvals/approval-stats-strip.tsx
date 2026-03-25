"use client";

import { ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  active?: boolean;
}

function StatCard({ label, value, icon, iconBg, iconColor, active }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white border rounded-xl p-4 flex items-center gap-4 transition-all shadow-sm",
      active ? "border-orange-200" : "border-slate-200"
    )}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg, iconColor)}>
        {icon}
      </div>
      <div>
        <div className={cn("text-[20px] font-bold font-mono tracking-tighter leading-none", active ? iconColor : "text-slate-900")}>
          {value}
        </div>
        <div className={cn("text-[12px] font-bold mt-1 uppercase tracking-widest", active ? iconColor : "text-slate-400")}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function ApprovalStatsStrip({ 
  pendingCount = 0, 
  approvedCount = 0, 
  rejectedCount = 0, 
  avgTime = "14m" 
}: { 
  pendingCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  avgTime?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      <StatCard 
        label="Pending" 
        value={pendingCount.toString()} 
        icon={<ShieldAlert className="w-5 h-5" />} 
        iconBg="bg-orange-light" 
        iconColor="text-orange" 
        active={pendingCount > 0}
      />
      <StatCard 
        label="Approved" 
        value={approvedCount.toString()} 
        icon={<CheckCircle2 className="w-5 h-5" />} 
        iconBg="bg-success-bg" 
        iconColor="text-success" 
      />
      <StatCard 
        label="Rejected" 
        value={rejectedCount.toString()} 
        icon={<XCircle className="w-5 h-5" />} 
        iconBg="bg-error-bg" 
        iconColor="text-error" 
      />
      <StatCard 
        label="Avg Decision" 
        value={avgTime} 
        icon={<Clock className="w-5 h-5" />} 
        iconBg="bg-slate-50" 
        iconColor="text-slate-500" 
      />
    </div>
  );
}
