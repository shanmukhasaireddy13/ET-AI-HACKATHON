"use client";

import { Building2, Upload, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function WorkspacePanel() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

  const domain = user?.email?.split('@')[1]?.split('.')[0] || "acme";
  const workspaceName = domain.charAt(0).toUpperCase() + domain.slice(1) + " Engineering";
  const workspaceSlug = domain + "-engineering";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">General Workspace Settings</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Configure your organization's presence and global defaults.</p>
      </div>

      <div className="px-6">
        {/* Branding Section */}
        <div className="py-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Workspace Logo</h4>
              <p className="text-[12px] text-slate-500 mt-1">This logo will appear in meeting reports, exports, and email notifications sent to your team.</p>
            </div>
            <div className="flex items-center gap-5 sm:w-[320px]">
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                <Building2 className="w-8 h-8 text-slate-200" />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="h-9 px-4 text-[13px] font-semibold border-slate-200 gap-2">
                  <Upload className="w-4 h-4 text-slate-400" />
                  Upload logo
                </Button>
                <p className="text-[11px] text-slate-400 font-medium leading-none pl-1">PNG, SVG (max 512x512)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Section */}
        <div className="py-2 border-b border-slate-100">
          {/* Name Row */}
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Workspace Name</h4>
              <p className="text-[12px] text-slate-500 mt-1">The display name of your organization within MeetingMind.</p>
            </div>
            <Input defaultValue={workspaceName} className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10 font-medium capitalize" />
          </div>

          {/* Slug Row */}
          <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Workspace Slug</h4>
              <p className="text-[12px] text-slate-500 mt-1">Your unique workspace URL. Changing this may break existing integration links.</p>
            </div>
            <div className="relative w-full sm:w-[320px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-medium select-none">
                meetingmind.io/
              </span>
              <Input defaultValue={workspaceSlug} className="h-10 pl-[110px] border-slate-200 rounded-lg focus:ring-blue/10 font-bold text-blue" />
            </div>
          </div>

          {/* Default Project Row */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[400px]">
              <h4 className="text-[13px] font-semibold text-slate-900">Default Jira Project</h4>
              <p className="text-[12px] text-slate-500 mt-1">Standard target project for all auto-extracted tasks unless specified otherwise.</p>
            </div>
            <Select defaultValue="backend">
              <SelectTrigger className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backend">BACKEND (Backend Engineering)</SelectItem>
                <SelectItem value="mobile">MOBILE (iOS & Android)</SelectItem>
                <SelectItem value="infra">INFRA (Cloud Architecture)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Working Hours Section */}
        <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="max-w-[400px]">
            <h4 className="text-[13px] font-semibold text-slate-900">Standard Working Hours</h4>
            <p className="text-[12px] text-slate-500 mt-1">Agents will avoid sending high-urgency Slack or SMS alerts outside these hours unless critical errors occur.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-[320px]">
            <div className="flex-1 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input type="time" defaultValue="09:00" className="h-10 pl-9 border-slate-200 rounded-lg focus:ring-blue/10 font-mono text-[13px]" />
            </div>
            <span className="text-[12px] font-bold text-slate-300 uppercase">To</span>
            <div className="flex-1 relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input type="time" defaultValue="18:00" className="h-10 pl-9 border-slate-200 rounded-lg focus:ring-blue/10 font-mono text-[13px]" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="py-8">
          <div className="bg-error-bg/5 border border-error/20 rounded-xl p-5 overflow-hidden relative group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle className="w-24 h-24 text-error" />
            </div>
            
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="text-[13px] font-bold text-error uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h4>
                <p className="text-[13px] text-slate-700 mt-2 font-medium">Delete Workspace</p>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  Permanently delete this workspace and all associated data including 1,200+ meeting records and Jira sync history. <strong>This action cannot be undone.</strong>
                </p>
              </div>
              <Button variant="outline" className="h-10 px-6 border-error text-error hover:bg-error hover:text-white transition-all font-bold text-[13px]">
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
