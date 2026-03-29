"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TaskChip {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  day: number;
}


export function TaskCalendar({ tasks = [] }: { tasks?: any[] }) {
  const [view, setView] = useState<"month" | "week">("month");

  // Simple grid for current month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const monthName = today.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-500">
      {/* Calendar Header */}
      <div className="p-5 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" className="h-9 w-9 p-0 border-slate-200 shadow-sm hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </Button>
            <Button variant="outline" className="h-9 w-9 p-0 border-slate-200 shadow-sm hover:bg-slate-50">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">{monthName} {currentYear}</h2>
        </div>

        <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1">
          <button 
            onClick={() => setView("month")}
            className={cn(
              "h-8 px-4 text-[12px] font-bold rounded-md transition-all",
              view === "month" ? "bg-white text-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Month
          </button>
          <button 
             onClick={() => setView("week")}
             className={cn(
               "h-8 px-4 text-[12px] font-bold rounded-md transition-all",
               view === "week" ? "bg-white text-blue shadow-sm" : "text-slate-500 hover:text-slate-700"
             )}
          >
            Week
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-[11px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7">
        {leadingDays.map((i) => (
          <div key={`leading-${i}`} className="min-h-[140px] border-r border-b border-slate-100 bg-slate-50/30" />
        ))}
        {days.map((day) => {
          const isToday = day === today.getDate();
          
          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate || t.dueDate === "TBD") return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.getDate() === day && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
          });
          
          return (
            <div 
              key={day} 
              className={cn(
                "min-h-[140px] border-r border-b border-slate-100 p-2.5 transition-colors hover:bg-slate-50/50 group",
                day > 31 && "bg-slate-50/30"
              )}
            >
              <div className="flex justify-end mb-2">
                <span className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-bold transition-all",
                  isToday ? "bg-blue text-white shadow-md ring-2 ring-blue/20 translate-y-[-2px] scale-110" : "text-slate-400"
                )}>
                  {day}
                </span>
              </div>

              <div className="space-y-1.5 overflow-hidden">
                {dayTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      "px-2 py-1.5 rounded-md border text-[11.5px] font-bold tracking-tight truncate cursor-pointer transition-all hover:translate-x-1 shadow-sm",
                      task.priority === "High" ? "bg-error-bg/50 border-error-border/40 text-error border-l-[3px] border-l-error" :
                      task.priority === "Medium" ? "bg-orange-light/50 border-orange-200/40 text-orange border-l-[3px] border-l-orange" :
                      "bg-blue-light/50 border-blue-mid/40 text-blue border-l-[3px] border-l-blue"
                    )}
                  >
                    {task.title}
                  </div>
                ))}
                
                {dayTasks.length > 2 && (
                  <div className="mt-1 text-center">
                    <button className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.05em] hover:text-blue transition-colors">
                      + {dayTasks.length - 2} more
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
