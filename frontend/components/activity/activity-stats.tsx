"use client";

import { Activity, Bot, User, AlertCircle, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({ label, value, icon, iconBg, iconColor, valueColor }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500", iconBg)}>
        <div className={cn("w-5 h-5", iconColor)}>
          {icon}
        </div>
      </div>
      <div>
        <div className={cn("text-[18px] font-bold font-mono tracking-tight leading-none", valueColor || "text-slate-900")}>
          {value}
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">
          {label}
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div className={cn("absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700", iconColor)}>
        {icon}
      </div>
    </div>
  );
}

export function ActivityStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard 
        label="Total Events (7d)" 
        value="1,204" 
        icon={<Activity />} 
        iconBg="bg-blue-light/10"
        iconColor="text-blue" 
      />
      <StatCard 
        label="Agent Actions" 
        value="1,142" 
        icon={<Bot />} 
        iconBg="bg-green-light/10"
        iconColor="text-green" 
      />
      <StatCard 
        label="Manager Actions" 
        value="48" 
        icon={<User />} 
        iconBg="bg-blue-light/10"
        iconColor="text-blue" 
      />
      <StatCard 
        label="Critical Errors" 
        value="7" 
        icon={<AlertCircle />} 
        iconBg="bg-error-bg/10"
        iconColor="text-error"
        valueColor="text-error"
      />
      <StatCard 
        label="Integrations" 
        value="214" 
        icon={<Plug />} 
        iconBg="bg-slate-50"
        iconColor="text-slate-400" 
      />
    </div>
  );
}
