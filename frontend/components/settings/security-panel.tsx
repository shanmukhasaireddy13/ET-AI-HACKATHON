"use client";

import { Shield, Key, Smartphone, Laptop, Globe, Trash2, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sessions = [
  { id: "1", browser: "Chrome", os: "Windows 11", ip: "192.168.1.1", current: true, lastSeen: "Active now" },
  { id: "2", browser: "Safari", os: "iOS 17.2", ip: "216.58.210.164", current: false, lastSeen: "2 hours ago" },
];

export function SecurityPanel() {
  const [password, setPassword] = useState("");

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">Security</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Manage your account protection, authentication methods, and active sessions.</p>
      </div>

      <div className="px-6">
        {/* Password Section */}
        <div className="py-6 border-b border-slate-100">
           <h3 className="text-[13px] font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              Update Password
           </h3>
           <div className="space-y-5 max-w-[400px]">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                <Input type="password" placeholder="••••••••" className="h-10 border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                <Input 
                  type="password" 
                  placeholder="Minimum 8 characters" 
                  className="h-10 border-slate-200 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrength password={password} />
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" className="h-10 border-slate-200 rounded-lg" />
              </div>
              <Button className="bg-blue hover:bg-blue-hover text-white text-[13px] font-bold h-10 px-6 shadow-md shadow-blue/10">
                Update Password
              </Button>
           </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="py-6 border-b border-slate-100">
           <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                 <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    Two-Factor Authentication
                 </h3>
                 <p className="text-[12px] text-slate-500">Add an extra layer of security to your account using TOTP.</p>
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 py-1 px-3 rounded-full text-[11px] font-bold">
                 Disabled
              </Badge>
           </div>
           
           <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-6 flex flex-col md:flex-row gap-8">
              <div className="w-[140px] h-[140px] border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-white shrink-0 group hover:border-blue/30 transition-colors">
                 <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-blue/30 transition-colors">
                    <Globe className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase">QR Capture</span>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 <p className="text-[13px] font-medium text-slate-700">1. Scan the QR code with your authenticator app (Google, Authy, etc.)</p>
                 <p className="text-[13px] font-medium text-slate-700">2. Enter the 6-digit verification code below to enable 2FA.</p>
                 <div className="flex items-center gap-3">
                    <Input placeholder="000 000" className="h-10 w-[140px] border-slate-200 rounded-lg text-center font-bold tracking-[0.2em] text-[16px]" maxLength={6} />
                    <Button className="h-10 px-6 bg-slate-900 hover:bg-black text-white text-[13px] font-bold">
                       Verify & Enable
                    </Button>
                 </div>
                 <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Can't scan? Use the manual entry code: <span className="font-mono font-bold text-slate-700 select-all">MM-QJ8X-29ZK-P1R0</span>
                 </p>
              </div>
           </div>
        </div>

        {/* Active Sessions Section */}
        <div className="py-6 pb-12">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                 <Shield className="w-4 h-4 text-slate-400" />
                 Active Sessions
              </h3>
              <button className="text-[12px] font-bold text-error hover:underline">Revoke all other sessions</button>
           </div>
           
           <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                       {session.os.includes("Windows") ? <Laptop className="w-5 h-5 text-slate-400" /> : <Smartphone className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="flex flex-col leading-tight">
                       <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-slate-900">{session.browser} on {session.os}</span>
                          {session.current && (
                             <Badge className="bg-green/10 text-green border-green/20 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">Current</Badge>
                          )}
                       </div>
                       <span className="text-[12px] text-slate-500 font-medium">{session.ip} • {session.lastSeen}</span>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" className="text-error hover:text-error hover:bg-error-bg/10 rounded-lg p-2 h-9 w-9">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
