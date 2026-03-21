"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  Sliders, 
  Building2, 
  Users, 
  Bell, 
  Bot, 
  Shield, 
  CreditCard, 
  Key 
} from "lucide-react";

export type SettingsSection = 
  | "profile" 
  | "preferences" 
  | "general" 
  | "team" 
  | "notifications" 
  | "agents" 
  | "security" 
  | "billing" 
  | "api";

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: any;
  hasChanges?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: "Account",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "preferences", label: "Preferences", icon: Sliders },
    ]
  },
  {
    label: "Workspace",
    items: [
      { id: "general", label: "General", icon: Building2 },
      { id: "team", label: "Team Members", icon: Users },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "agents", label: "Agent Defaults", icon: Bot },
    ]
  },
  {
    label: "Security & Billing",
    items: [
      { id: "security", label: "Security", icon: Shield },
      { id: "billing", label: "Billing & Plan", icon: CreditCard },
      { id: "api", label: "API Keys", icon: Key },
    ]
  }
];

interface SettingsNavProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  dirtySections: SettingsSection[];
}

export function SettingsNav({ activeSection, onSectionChange, dirtySections }: SettingsNavProps) {
  return (
    <nav className="w-[220px] bg-white border border-slate-200 rounded-xl py-2 sticky top-[92px] shadow-sm">
      {GROUPS.map((group, groupIdx) => (
        <div key={group.label} className={cn(groupIdx !== 0 && "mt-2 pt-2 border-t border-slate-50")}>
          <div className="px-4 pt-2.5 pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              {group.label}
            </span>
          </div>
          <div className="space-y-0.5 px-2 mt-1">
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              const isDirty = dirtySections.includes(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-medium transition-all group relative",
                    isActive 
                      ? "bg-blue-light/10 text-blue" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-[-8px] top-2 bottom-2 w-[3px] bg-blue rounded-r-full" />
                  )}
                  
                  <item.icon className={cn(
                    "w-[15px] h-[15px] transition-colors",
                    isActive ? "text-blue" : "text-slate-400 group-hover:text-slate-500"
                  )} />
                  
                  <span className="truncate">{item.label}</span>
                  
                  {isDirty && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
