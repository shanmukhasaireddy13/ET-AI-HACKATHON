"use client";

import { Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfilePanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Profile</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Manage your personal information and how others see you.</p>
      </div>

      {/* Avatar Section */}
      <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-6">
        <Avatar className="w-16 h-16 border-2 border-slate-100 ring-2 ring-white">
          <AvatarFallback className="bg-blue-light/10 text-blue font-bold text-xl">JD</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-4 text-[13px] font-semibold border-slate-200 gap-2">
              <Upload className="w-4 h-4 text-slate-400" />
              Upload photo
            </Button>
            <button className="text-[12px] font-semibold text-error hover:underline px-2">
              Remove
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">JPEG, PNG or WebP. Max 2MB.</p>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="px-6 py-2">
        {/* Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-50">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">First Name</label>
            <Input defaultValue="John" className="h-10 border-slate-200 rounded-lg focus:ring-blue/10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
            <Input defaultValue="Doe" className="h-10 border-slate-200 rounded-lg focus:ring-blue/10" />
          </div>
        </div>

        {/* Email Row */}
        <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-[400px]">
            <h4 className="text-[13px] font-semibold text-slate-900">Work Email</h4>
            <p className="text-[12px] text-slate-500 mt-1">This email will be used for all workspace communications and Jira syncs.</p>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Input defaultValue="john.doe@acme.inc" className="h-10 pr-10 border-slate-200 rounded-lg focus:ring-blue/10" />
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green" />
          </div>
        </div>

        {/* Phone Row */}
        <div className="py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-[400px]">
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-semibold text-slate-900">Phone Number</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded leading-none">Optional</span>
            </div>
            <p className="text-[12px] text-slate-500 mt-1">Used for 2FA and high-priority SMS alerts from agents.</p>
          </div>
          <Input type="tel" placeholder="+1 (555) 000-0000" className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg focus:ring-blue/10" />
        </div>

        {/* Job Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-50">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Job Title</label>
            <Input defaultValue="Senior Engineering Manager" className="h-10 border-slate-200 rounded-lg focus:ring-blue/10" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Department</label>
            <Select defaultValue="engineering">
              <SelectTrigger className="h-10 border-slate-200 rounded-lg">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timezone Row */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-[400px]">
            <h4 className="text-[13px] font-semibold text-slate-900">Timezone</h4>
            <p className="text-[12px] text-slate-500 mt-1">Sets when you receive daily summaries and agent reports.</p>
          </div>
          <Select defaultValue="utc-5-30">
            <SelectTrigger className="h-10 w-full sm:w-[320px] border-slate-200 rounded-lg">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc-5-30">(UTC+05:30) Chennai, Mumbai, New Delhi</SelectItem>
              <SelectItem value="utc-0">UTC (Universal Coordinated Time)</SelectItem>
              <SelectItem value="utc-8">(UTC-08:00) Pacific Time (US & Canada)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save Button Row */}
      <div className="px-6 py-5 bg-slate-50/50 flex justify-end gap-3 mt-4 border-t border-slate-100">
        <Button variant="ghost" className="h-9 px-5 text-[13px] font-semibold text-slate-500 hover:text-slate-800">
          Cancel
        </Button>
        <Button className="h-9 px-6 bg-blue hover:bg-blue-hover text-white text-[13px] font-bold shadow-md shadow-blue/10 transition-all hover:-translate-y-0.5">
          Save Profile
        </Button>
      </div>
    </div>
  );
}
