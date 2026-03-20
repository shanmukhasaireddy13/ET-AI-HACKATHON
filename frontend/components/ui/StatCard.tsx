"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
