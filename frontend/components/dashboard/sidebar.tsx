"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Mic, 
  CheckSquare, 
  Bot, 
  Bell, 
  Activity, 
  Plug, 
  Users, 
  Settings,
  Plus,
  ChevronsUpDown,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Meetings", icon: Mic, href: "/dashboard/meetings" },
  { label: "Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
  { label: "Agents", icon: Bot, href: "/dashboard/agents" },
  { label: "Approvals", icon: Bell, href: "/dashboard/approvals", badge: "3" },
  { label: "Activity Log", icon: Activity, href: "/dashboard/activity" },
  { label: "Integrations", icon: Plug, href: "/dashboard/integrations" },
];

const WORKSPACE_ITEMS = [
  { label: "Team", icon: Users, href: "/dashboard/settings?section=team" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-screen bg-white border-r border-border-dash pt-16 z-40 flex flex-col">
      {/* Workspace Switcher */}
      <div className="h-[52px] px-4 border-b border-slate-100 flex items-center justify-between hover:bg-dash-bg transition-colors cursor-pointer group">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-[13px] font-semibold text-[#0F172A] truncate">Acme Engineering</span>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Main Menu</p>
        </div>
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 h-9 px-3 rounded-lg text-[14px] font-medium transition-all group relative",
                  isActive 
                    ? "bg-sidebar-active-bg text-sidebar-active-text" 
                    : "text-sidebar-text hover:bg-dash-bg hover:text-body"
                )}
              >
                {isActive && (
                  <div className="absolute left-[-8px] top-1.5 bottom-1.5 w-[3px] bg-blue rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-blue" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-8 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Workspace</p>
        </div>
        <nav className="space-y-0.5 px-2">
          {WORKSPACE_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 h-9 px-3 rounded-lg text-[14px] font-medium transition-all group relative",
                  isActive 
                    ? "bg-sidebar-active-bg text-sidebar-active-text" 
                    : "text-sidebar-text hover:bg-dash-bg hover:text-body"
                )}
              >
                {isActive && (
                  <div className="absolute left-[-8px] top-1.5 bottom-1.5 w-[3px] bg-blue rounded-r-full" />
                )}
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-blue" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
        <Link href="/dashboard/meetings?action=upload" className="block w-full mb-4">
          <Button className="w-full h-9 bg-blue hover:bg-blue-hover text-white text-[13px] font-semibold gap-2 shadow-sm hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Analyse New Meeting
          </Button>
        </Link>
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Monthly Usage</span>
            <span>46%</span>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue rounded-full" style={{ width: "46%" }} />
          </div>
          <p className="text-[11px] text-muted-text">23 of 50 meetings used</p>
        </div>
      </div>
    </aside>
  );
}
