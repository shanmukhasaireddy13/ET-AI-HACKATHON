"use client";

import { X, Mail, Send, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EmailConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailConfigDrawer({ open, onOpenChange }: EmailConfigDrawerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => setTesting(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center p-1.5 bg-blue-light/20">
                  <Mail className="w-4 h-4 text-blue" />
               </div>
               <SheetTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Email/SMTP Configuration</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          <div className="p-6 space-y-8 pb-12">
            {/* Section: SMTP Settings */}
            <div className="space-y-4">
               <div className="flex items-center justify-between pl-1">
                  <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">SMTP Configuration</h3>
                  <Badge className="bg-green-light text-green border-green-border text-[10px] uppercase font-bold px-2 py-0 border">Active</Badge>
               </div>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="col-span-2 space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 ml-1">SMTP Host</label>
                        <Input defaultValue="smtp.sendgrid.net" className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 ml-1">Port</label>
                        <Input type="number" defaultValue="587" className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-600 ml-1">Username</label>
                    <Input defaultValue="apikey" className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-600 ml-1">Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        defaultValue="SG.x823js92lks0293js" 
                        className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg pr-10" 
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue transition-colors"
                      >
                         {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 ml-1">From Name</label>
                        <Input defaultValue="MeetingMind Bot" className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-600 ml-1">From Email</label>
                        <Input type="email" defaultValue="bot@acme.com" className="h-10 bg-slate-50 border-slate-200 text-[13px] rounded-lg" />
                     </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleTest}
                    disabled={testing}
                    className="h-10 w-full bg-white border-slate-200 text-slate-700 font-bold text-[13px] rounded-lg gap-2 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {testing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                        Sending Test...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Test Email
                      </>
                    )}
                  </Button>
               </div>
            </div>

            {/* Section: Email Rules */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Rules</h3>
               <div className="space-y-4">
                  {[
                    { label: "Send summary after analysis", desc: "Automated executive summary sent to participants", checked: true },
                    { label: "Send task assignment emails", desc: "Individual alerts when a task is assigned to a user", checked: true },
                    { label: "Send approval request emails", desc: "Daily digest of items requiring manager action", checked: false }
                  ].map((rule, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 p-1 hover:bg-slate-50/50 rounded-lg transition-colors">
                       <div className="space-y-0.5">
                          <p className="text-[13px] font-bold text-slate-900 tracking-tight">{rule.label}</p>
                          <p className="text-[12px] text-slate-500 leading-snug">{rule.desc}</p>
                       </div>
                       <Switch defaultChecked={rule.checked} />
                    </div>
                  ))}

                  <div className="space-y-2 pt-2">
                     <label className="text-[12px] font-bold text-slate-600 ml-1">Email Template</label>
                     <Select defaultValue="modern">
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 text-[13px] font-bold rounded-lg shadow-sm">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                           <SelectItem value="modern">Modern Professional (Default)</SelectItem>
                           <SelectItem value="minimal">Minimal text-only</SelectItem>
                           <SelectItem value="dark">Dark Theme Elite</SelectItem>
                           <SelectItem value="custom">Custom HTML Template</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>
            </div>

            {/* Support Box */}
            <div className="p-4 bg-blue-light/30 border border-blue-mid/40 rounded-xl flex gap-3">
               <AlertCircle className="w-5 h-5 text-blue shrink-0" />
               <p className="text-[12px] text-blue font-medium leading-relaxed">
                  We recommend using a dedicated transactional email service like SendGrid or Postmark for reliable delivery.
               </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-[40px] text-[13px] text-slate-400 hover:text-slate-600 font-bold">
            Cancel
          </Button>
          <Button className="h-[40px] bg-blue hover:bg-blue-hover text-white text-[13px] font-bold px-8 shadow-md transition-all active:scale-95">
            Save Configuration
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
