"use client";

import { Info, Settings, Shield, Zap, Save, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  noBorder?: boolean;
}

function FieldRow({ label, children, description, noBorder }: FieldRowProps) {
  return (
    <div className={cn("flex flex-col gap-1 py-4", !noBorder && "border-b border-slate-50")}>
      <div className="flex items-center justify-between gap-4">
        <div>
           <label className="text-[13px] font-bold text-slate-700 tracking-tight">{label}</label>
           {description && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{description}</p>}
        </div>
        <div className="flex-shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfigTab({ agentName }: { agentName: string }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      
      {/* General Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-light flex items-center justify-center text-blue">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">General Behavior</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[12px] font-bold text-blue hover:bg-blue-light">Reset Defaults</Button>
        </div>
        
        <div className="space-y-1">
          <FieldRow label="Agent Name" description="External identification in audit logs">
            <Input defaultValue={agentName} className="h-9 w-[260px] text-[13px] border-slate-200 focus:ring-blue" />
          </FieldRow>
          <FieldRow label="Max Concurrent Tasks" description="Limit processing load per agent instance">
            <Input type="number" defaultValue={5} className="h-9 w-20 text-[13px] border-slate-200 focus:ring-blue" />
          </FieldRow>
          <FieldRow label="Response Timeout (s)" description="Wait time before auto-failing a process">
            <Input type="number" defaultValue={30} className="h-9 w-20 text-[13px] border-slate-200 focus:ring-blue" />
          </FieldRow>
          <FieldRow label="Retry on Failure" description="Automatically retry transient API errors" noBorder>
            <Switch defaultChecked />
          </FieldRow>
        </div>
      </div>

      {/* Approval Rules */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-warning-bg flex items-center justify-center text-warning">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Approval Rules</h3>
        </div>

        <div className="space-y-1">
          <FieldRow label="Approval Threshold" description="When should a human review be required?">
            <Select defaultValue="high">
              <SelectTrigger className="w-[200px] h-9 text-[13px] border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical Tasks Only</SelectItem>
                <SelectItem value="high">High Priority +</SelectItem>
                <SelectItem value="medium">Medium Priority +</SelectItem>
                <SelectItem value="all">Require All Approvals</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Auto-Reject Timeout (hrs)" description="Set to 0 to disable auto-rejection" noBorder>
            <Input type="number" defaultValue={24} className="h-9 w-20 text-[13px] border-slate-200 focus:ring-blue" />
          </FieldRow>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-50">
          <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center text-success">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Tools & Permissions</h3>
        </div>

        <div className="space-y-4 pt-1">
          {[
            { name: "Jira Enterprise", level: "Read+Write", enabled: true, icon: "J" },
            { name: "Google Calendar", level: "Read Only", enabled: true, icon: "C" },
            { name: "Slack Notifications", level: "Write Only", enabled: false, icon: "S" }
          ].map((tool, i) => (
            <div key={i} className={cn(
              "flex items-center justify-between p-3.5 px-4 rounded-xl border transition-all",
              tool.enabled ? "bg-success-bg/30 border-success-border/50" : "bg-slate-50/50 border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[13px]",
                  tool.enabled ? "bg-white text-blue border border-blue-mid/30" : "bg-slate-100 text-slate-400"
                )}>
                  {tool.icon}
                </div>
                <div>
                   <span className="text-[13px] font-bold text-slate-800 tracking-tight">{tool.name}</span>
                   <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="text-[10px] uppercase font-bold text-slate-400">Level:</span>
                     <span className="text-[11px] font-bold text-blue tracking-tight hover:underline cursor-pointer">{tool.level}</span>
                   </div>
                </div>
              </div>
              <Switch defaultChecked={tool.enabled} />
            </div>
          ))}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="ghost" className="text-[13px] font-bold text-slate-400 hover:bg-slate-50">Cancel Changes</Button>
        <Button className="bg-blue hover:bg-blue-hover text-white px-8 h-10 font-bold shadow-md shadow-blue/10 rounded-lg flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
