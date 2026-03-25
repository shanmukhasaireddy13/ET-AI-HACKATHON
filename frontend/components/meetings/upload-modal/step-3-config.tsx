"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Step3Props {
  onFinish: (data: any) => void;
  onBack: () => void;
}

const analysisOptions = [
  { id: "decisions", label: "Decisions", description: "Extract key decisions made in the meeting", checked: true },
  { id: "tasks", label: "Tasks & Action Items", description: "Generate tasks and assign to participants", checked: true },
  { id: "followups", label: "Follow-up Items", description: "Flag items that need follow-up", checked: true },
  { id: "blockers", label: "Blockers", description: "Identify blockers and risks mentioned", checked: true },
  { id: "sentiment", label: "Sentiment Analysis", description: "Analyse meeting tone and engagement", checked: false, pro: true },
];

export function Step3Config({ onFinish, onBack }: Step3Props) {
  const [priority, setPriority] = useState<string>("Normal");
  const [options, setOptions] = useState({
    decisions: true,
    tasks: true,
    followups: true,
    blockers: true,
    sentiment: false
  });

  const handleFinish = () => {
    onFinish({
      priority,
      options
    });
  };

  return (
    <div className="p-7 space-y-8">
      {/* Analysis Options */}
      <div className="space-y-4">
         <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">What should agents extract?</label>
         <div className="divide-y divide-[#F8FAFC]">
            {analysisOptions.map((opt) => (
              <div key={opt.id} className="py-3.5 flex align-start gap-3">
                 <Checkbox 
                  id={opt.id} 
                  checked={options[opt.id as keyof typeof options]} 
                  onCheckedChange={(checked) => setOptions({...options, [opt.id]: !!checked})}
                  disabled={opt.pro} 
                  className="mt-0.5 border-[#E2E8F0]" 
                 />
                 <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <label htmlFor={opt.id} className="text-[13px] font-medium text-[#0F172A] cursor-pointer">
                          {opt.label}
                       </label>
                       {opt.pro && (
                         <span className="bg-[#F1F5F9] text-[#64748B] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</span>
                       )}
                    </div>
                    <span className="text-[12px] text-[#64748B] mt-0.5">{opt.description}</span>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Integration Targets */}
      <div className="space-y-4">
         <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.1em]">Auto-push results to:</label>
         <div className="space-y-1">
            <div className="flex items-center justify-between py-2.5 border-b border-[#F8FAFC]">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-light/10 text-blue flex items-center justify-center font-bold text-xs italic">J</div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-medium text-[#0F172A]">Jira</span>
                     <span className="text-[11px] text-[#16A34A] font-medium tracking-tight">Connected up to date</span>
                  </div>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#F8FAFC]">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-light/10 text-green flex items-center justify-center font-bold text-xs italic">S</div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-medium text-[#0F172A]">Slack</span>
                     <span className="text-[11px] text-[#16A34A] font-medium tracking-tight">Connected (#general)</span>
                  </div>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#F8FAFC]">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs italic">E</div>
                  <div className="flex flex-col">
                     <span className="text-[13px] font-medium text-slate-400">Email</span>
                     <span className="text-[11px] text-[#94A3B8] italic">Not configured</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button className="text-[11px] font-bold text-[#2563EB] hover:underline">Configure</button>
                  <Switch disabled />
               </div>
            </div>
         </div>
      </div>

      {/* Priority Override */}
      <div className="flex items-center gap-4 py-2">
         <label className="text-[13px] font-medium text-[#334155]">Meeting priority:</label>
         <div className="flex bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]">
            {["Normal", "High", "Critical"].map((p) => (
              <button 
               key={p}
               onClick={() => setPriority(p)}
               className={cn(
                 "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all",
                 priority === p ? (
                   p === "Normal" ? "bg-[#EFF6FF] text-[#2563EB] shadow-sm" :
                   p === "High" ? "bg-[#FFF7ED] text-[#EA580C] shadow-sm" :
                   "bg-[#FEF2F2] text-[#DC2626] shadow-sm"
                 ) : "text-[#64748B] hover:text-[#0F172A]"
               )}
              >
                 {p}
              </button>
            ))}
         </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
         <Button onClick={onBack} variant="ghost" className="text-[#64748B] font-bold px-0 hover:bg-transparent hover:text-[#0F172A]">
            ← Back
         </Button>
         <Button onClick={handleFinish} className="h-12 px-8 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold text-[14px] shadow-xl shadow-blue/20 transition-all active:scale-95">
            Start Analysis 🚀
         </Button>
      </div>
    </div>
  );
}

