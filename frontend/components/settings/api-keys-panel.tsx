"use client";

import { Key, Plus, Copy, Trash2, Eye, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

const keys = [
  { id: "1", name: "Production AI Agent", permissions: "Full Access", created: "Jan 12, 2026", lastUsed: "2 mins ago" },
  { id: "2", name: "Staging Connector", permissions: "Read Only", created: "Feb 05, 2026", lastUsed: "1 day ago" },
  { id: "3", name: "Mobile App Client", permissions: "Tasks Only", created: "Mar 15, 2026", lastUsed: "Never" },
];

export function APIKeysPanel() {
  const [showReveal, setShowReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const newKeySecret = "mm_live_7x9w2v4k8b1q5n3p0r2s4t6u8v0x1y3z";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-[15px] font-bold text-slate-900 leading-none">API Keys</h2>
        <p className="text-[13px] text-slate-500 mt-1.5">Access the MeetingMind API programmatically. Keep your keys secure.</p>
      </div>

      <div className="px-6">
        {/* Create Key Row */}
        <div className="py-6 border-b border-slate-100 bg-slate-50/50 px-6 -mx-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Key Name (e.g. My Integration)" className="h-10 border-slate-200 rounded-lg bg-white" />
          </div>
          <Select defaultValue="full">
            <SelectTrigger className="w-[140px] h-10 border-slate-200 rounded-lg bg-white">
              <SelectValue placeholder="Permissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Access</SelectItem>
              <SelectItem value="read">Read Only</SelectItem>
              <SelectItem value="tasks">Tasks Only</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setShowReveal(true)}
            className="h-10 px-6 bg-blue hover:bg-blue-hover text-white text-[13px] font-bold gap-2 shadow-md shadow-blue/10"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </Button>
        </div>

        {/* Keys Table */}
        <div className="py-2 pb-8 overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
             <thead>
                <tr className="h-10 border-b border-slate-100">
                   <th className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Name</th>
                   <th className="w-[140px] text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Permissions</th>
                   <th className="w-[120px] text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Created</th>
                   <th className="w-[140px] text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Last Used</th>
                   <th className="w-[100px] text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-2">Actions</th>
                </tr>
             </thead>
             <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="h-14 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td>
                       <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                             <Key className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-900">{key.name}</span>
                       </div>
                    </td>
                    <td>
                       <Badge className={cn(
                         "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                         key.permissions === "Full Access" ? "bg-blue-light/30 text-blue" :
                         key.permissions === "Read Only" ? "bg-slate-100 text-slate-500" : "bg-orange-light/30 text-orange"
                       )}>
                          {key.permissions}
                       </Badge>
                    </td>
                    <td className="text-[12px] font-medium text-slate-500">{key.created}</td>
                    <td className="text-[12px] font-bold text-slate-700">{key.lastUsed}</td>
                    <td className="text-right pr-2">
                       <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-400 hover:text-blue hover:bg-blue-light/10">
                             <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" className="w-8 h-8 p-0 text-slate-400 hover:text-error hover:bg-error-bg/10">
                             <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* One-time Reveal Dialog */}
      <AlertDialog open={showReveal} onOpenChange={setShowReveal}>
        <AlertDialogContent className="max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
           <div className="bg-blue p-8 flex flex-col items-center text-center text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] opacity-10">
                 <Key className="w-48 h-48 rotate-45" />
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 ring-8 ring-white/10">
                 <ShieldCheck className="w-8 h-8" />
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-extrabold tracking-tight">Save your API key</AlertDialogTitle>
                <AlertDialogDescription className="text-white/80 text-[14px]">
                  This key will only be shown once. Copy and store it securely. We do not store the key secret once this window is closed.
                </AlertDialogDescription>
              </AlertDialogHeader>
           </div>
           
           <div className="p-8 space-y-6 bg-white">
              <div className="space-y-4">
                 <div className="bg-orange-light/10 border border-orange/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#92400E] font-medium leading-relaxed">
                       If you lose this key, you will need to revoke it and create a new one. Applications using the old key will lose access immediately.
                    </p>
                 </div>
                 
                 <div className="relative">
                    <Input 
                      readOnly 
                      value={newKeySecret} 
                      className="h-12 bg-slate-50 border-slate-200 font-mono text-[13px] pr-24 font-bold rounded-xl focus:ring-blue/5"
                    />
                    <Button 
                      onClick={handleCopy}
                      className={cn(
                        "absolute right-1 top-1 h-10 px-4 rounded-lg text-[12px] font-bold transition-all",
                        copied ? "bg-green text-white" : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                      )}
                    >
                       {copied ? (
                         <span className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Copied!
                         </span>
                       ) : (
                         <span className="flex items-center gap-1.5">
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            Copy Key
                         </span>
                       )}
                    </Button>
                 </div>
              </div>
              
              <AlertDialogFooter className="pt-2">
                <AlertDialogAction className="w-full bg-blue hover:bg-blue-hover text-white h-12 font-bold rounded-xl shadow-lg shadow-blue/20">
                   Done, I've secured it
                </AlertDialogAction>
              </AlertDialogFooter>
           </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
