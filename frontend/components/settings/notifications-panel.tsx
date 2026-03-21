"use client";

import { Bell, Mail, MessageSquare, Clock, Globe, Shield, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const notificationTypes = [
  { id: "approval", label: "New pending approval", description: "Receive an alert when an agent requires your decision.", defaultOn: true },
  { id: "analysis", label: "Meeting analysis complete", description: "Get notified when a meeting has been processed by AI.", defaultOn: true },
  { id: "task", label: "Task assigned to team", description: "Notification when a new task is extracted for your project.", defaultOn: true },
  { id: "error", label: "Agent error", description: "Urgent alert if an agent fails to execute a mission.", defaultOn: true },
  { id: "sync", label: "Jira sync failure", description: "Notification if external tool synchronization fails.", defaultOn: true },
  { id: "summary", label: "Weekly workspace summary", description: "Regular digest of all activities and progress.", defaultOn: false },
];

export function NotificationsPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Notifications</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Control how and when you receive alerts from your agents and workspace results.</p>
      </div>

      <div className="px-6 pb-2">
        {/* In-App Channel */}
        <div className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-light/10 flex items-center justify-center">
                 <Bell className="w-4 h-4 text-blue" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">In-App Notifications</h3>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="space-y-1">
            {notificationTypes.map((type) => (
              <div key={type.id} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/20 px-1 rounded-lg">
                <div className="max-w-[400px]">
                  <p className="text-[13px] font-semibold text-slate-900">{type.label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{type.description}</p>
                </div>
                <Switch defaultChecked={type.defaultOn} />
              </div>
            ))}
          </div>
        </div>

        {/* Email Channel */}
        <div className="py-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-light/10 flex items-center justify-center">
                 <Mail className="w-4 h-4 text-orange" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Email Notifications</h3>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Email digest frequency</h4>
              <p className="text-[12px] text-slate-500 mt-1">Choose how often you want to receive consolidated notification emails.</p>
            </div>
            <Select defaultValue="daily">
              <SelectTrigger className="h-10 w-full sm:w-[240px] border-slate-200 rounded-lg">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Slack Channel */}
        <div className="py-6 border-b border-slate-100 group opacity-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4A154B]/10 flex items-center justify-center">
                 <MessageSquare className="w-4 h-4 text-[#4A154B]" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Slack Notifications</h3>
            </div>
            <Badge className="bg-green/10 text-green border-green/20 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">Connected</Badge>
          </div>
          <p className="text-[12px] text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
             Notifications are currently being sent to <span className="text-blue font-bold px-1 rounded bg-blue-light/20">#engi-ops-alerts</span>
          </p>
          <div className="space-y-1">
             <div className="flex items-start justify-between py-3 hover:bg-slate-50/20 px-1 rounded-lg">
                <div className="max-w-[400px]">
                  <p className="text-[13px] font-semibold text-slate-900">Mention me in threads</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Agents will @mention you directly on Slack for approvals.</p>
                </div>
                <Switch defaultChecked />
              </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="py-6 border-b border-slate-100 group">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-light/10 flex items-center justify-center">
                   <Clock className="w-4 h-4 text-orange" />
                </div>
                <h3 className="text-[14px] font-bold text-slate-900">Quiet Hours</h3>
             </div>
             <Switch defaultChecked />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2">
            <span className="text-[13px] text-slate-500 font-medium">Don't notify between</span>
            <Input type="time" defaultValue="22:00" className="h-9 w-[110px] border-slate-200 rounded-lg focus:ring-blue/10 font-mono text-[13px]" />
            <span className="text-[13px] text-slate-300 font-bold uppercase">and</span>
            <Input type="time" defaultValue="08:00" className="h-9 w-[110px] border-slate-200 rounded-lg focus:ring-blue/10 font-mono text-[13px]" />
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest ml-1">(UTC+05:30)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
