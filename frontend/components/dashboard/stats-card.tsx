"use client";

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  description?: string;
  urgent?: boolean;
}

export function StatsCard({ 
  label, 
  value, 
  icon: Icon, 
  iconColor = "text-blue", 
  iconBg = "bg-blue-light",
  trend,
  description,
  urgent
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white border border-border-dash rounded-xl p-5 relative overflow-hidden transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] group",
      urgent && "border-t-2 border-t-orange"
    )}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-200", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[28px] font-bold text-[#0F172A] font-mono-data tracking-tight">{value}</h3>
        
        <div className="flex items-center gap-1.5 h-5">
          {trend ? (
            <>
              {trend.type === "up" && <TrendingUp className="w-3.5 h-3.5 text-success" />}
              {trend.type === "down" && <TrendingDown className="w-3.5 h-3.5 text-error" />}
              {trend.type === "neutral" && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              <span className={cn(
                "text-[12px] font-medium",
                trend.type === "up" ? "text-success" : trend.type === "down" ? "text-error" : "text-slate-400"
              )}>
                {trend.value}
              </span>
            </>
          ) : description ? (
            <span className={cn("text-[12px] font-medium", urgent ? "text-orange" : "text-muted-text")}>
              {description}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
