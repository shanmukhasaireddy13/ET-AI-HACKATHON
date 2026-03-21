"use client";

import { Sun, Moon, Laptop } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function PreferencesPanel() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Preferences</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Personalise your MeetingMind experience and how data is displayed.</p>
      </div>

      <div className="px-6">
        {/* Language & Regional Section */}
        <div className="py-2 border-b border-slate-100">
          {/* Language Row */}
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Language</h4>
              <p className="text-[12px] text-slate-500 mt-1">Select your preferred language for the interface and agent communication.</p>
            </div>
            <Select defaultValue="en-us">
              <SelectTrigger className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-us">English (US)</SelectItem>
                <SelectItem value="en-gb">English (UK)</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format Row */}
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Date Format</h4>
              <p className="text-[12px] text-slate-500 mt-1">Choose how dates are displayed across all tables and reports.</p>
            </div>
            <Select defaultValue="mmm-dd-yyyy">
              <SelectTrigger className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mmm-dd-yyyy">Mar 21, 2026</SelectItem>
                <SelectItem value="dd-mm-yyyy">21/03/2026</SelectItem>
                <SelectItem value="mm-dd-yyyy">03/21/2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Time Format</h4>
              <p className="text-[12px] text-slate-500 mt-1">Toggle between 12-hour and 24-hour clock displays.</p>
            </div>
            <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200 w-full sm:w-[320px]">
              <button className="flex-1 py-1.5 text-[12px] font-bold rounded-md bg-white shadow-sm text-blue border border-blue/10">12-hour</button>
              <button className="flex-1 py-1.5 text-[12px] font-bold rounded-md text-slate-500 hover:text-slate-700">24-hour</button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="py-6 border-b border-slate-100">
          <h4 className="text-[13px] font-semibold text-slate-900 mb-4">Appearance Theme</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Laptop },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as any)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all group",
                  theme === option.id 
                    ? "bg-blue-light/10 border-blue ring-4 ring-blue/5" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  theme === option.id ? "bg-blue text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-500"
                )}>
                  <option.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[13px] font-bold",
                  theme === option.id ? "text-blue" : "text-slate-500 group-hover:text-slate-700"
                )}>
                  {option.label}
                </span>
                
                {/* Visual Preview Swatch */}
                <div className="mt-1 w-full h-8 rounded-md bg-slate-50 border border-slate-100 p-1.5 flex flex-col gap-1 overflow-hidden opacity-50">
                  <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                  <div className="w-2/3 h-1.5 bg-slate-200 rounded-full" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="py-2 pb-6">
          {/* Default Task View Row */}
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Default Task View</h4>
              <p className="text-[12px] text-slate-500 mt-1">Sets the primary view when opening the Tasks board.</p>
            </div>
            <Select defaultValue="kanban">
              <SelectTrigger className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban Board</SelectItem>
                <SelectItem value="table">Data Table</SelectItem>
                <SelectItem value="calendar">Timeline Calendar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compact Mode Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Compact Mode</h4>
              <p className="text-[12px] text-slate-500 mt-1">Reduce spacing and padding across the entire dashboard for denser information views.</p>
            </div>
            <div className="flex items-center gap-3 sm:w-[320px] justify-end">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">Off</span>
              <Switch />
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">On</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
