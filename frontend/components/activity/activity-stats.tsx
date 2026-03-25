"use client";

import { useState, useEffect } from "react";
import { Activity, Bot, User, AlertCircle, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
      <div className={cn("absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700", iconColor)}>
        {icon}
      </div>
    </div>
  );
}

export function ActivityStats() {
  const [stats, setStats] = useState({
    total: 0,
    agent: 0,
    manager: 0,
    errors: 0,
    integrations: 0
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const [mCount, tCount, aCount, iCount] = await Promise.all([
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('approvals').select('*', { count: 'exact', head: true }),
        supabase.from('integrations').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        total: (mCount.count || 0) + (tCount.count || 0) + (aCount.count || 0),
        agent: (mCount.count || 0) + (tCount.count || 0),
        manager: aCount.count || 0,
        errors: 0, // Placeholder for actual error logging table if added
        integrations: iCount.count || 0
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard 
        label="Total Events" 
        value={stats.total.toLocaleString()} 
        icon={<Activity />} 
        iconBg="bg-blue-light/10"
        iconColor="text-blue" 
      />
      <StatCard 
        label="Agent Actions" 
        value={stats.agent.toLocaleString()} 
        icon={<Bot />} 
        iconBg="bg-green-light/10"
        iconColor="text-green" 
      />
      <StatCard 
        label="Manager Actions" 
        value={stats.manager.toLocaleString()} 
        icon={<User />} 
        iconBg="bg-blue-light/10"
        iconColor="text-blue" 
      />
      <StatCard 
        label="Critical Errors" 
        value="0" 
        icon={<AlertCircle />} 
        iconBg="bg-error-bg/10"
        iconColor="text-error"
        valueColor="text-error"
      />
      <StatCard 
        label="Integrations" 
        value={stats.integrations.toString()} 
        icon={<Plug />} 
        iconBg="bg-slate-50"
        iconColor="text-slate-400" 
      />
    </div>
  );
}
