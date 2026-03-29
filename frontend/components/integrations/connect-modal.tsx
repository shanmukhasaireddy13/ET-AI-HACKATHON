"use client";

import { useState } from "react";
import { X, Check, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: {
    name: string;
    icon: React.ReactNode;
  } | null;
  onSuccess: () => void;
}

export function ConnectModal({ open, onOpenChange, integration, onSuccess }: ConnectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simulate OAuth redirect and return
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleDone = () => {
    onSuccess();
    onOpenChange(false);
    // Reset for next time
    setTimeout(() => setStep(1), 300);
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="px-6 py-5 border-b border-slate-50 flex-row items-center justify-between space-y-0 bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white shadow-sm p-1.5">
                {integration.icon}
             </div>
             <DialogTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Connect {integration.name}</DialogTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:bg-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="p-8">
          {step === 1 ? (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                   <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      MeetingMind requires project-level access to your <strong>{integration.name}</strong> workspace to synchronize tasks and automate workflows.
                   </p>
                </div>

                <div className="space-y-3">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Requested Permissions</p>
                   <div className="space-y-2.5">
                      {[
                        "View project data and member lists",
                        "Create and update issues/tickets",
                        "Subscribe to workspace events (webhooks)",
                        "Add comments and attachments to tasks"
                      ].map((perm, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-green" />
                           </div>
                           <span className="text-[13px] text-slate-700 font-medium">{perm}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                   <Lock className="w-4 h-4 text-slate-400" />
                   <p className="text-[12px] text-slate-500 font-medium">
                      Your credentials are encrypted and never stored on our servers. Authorization happens directly via {integration.name}.
                   </p>
                </div>
             </div>
          ) : (
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-500">
               <div className="w-16 h-16 rounded-full bg-green-light flex items-center justify-center text-green shadow-lg shadow-green/10 border border-green-border animate-in scale-in duration-700">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">Successfully Connected!</h3>
                  <p className="text-[14px] text-slate-500">MeetingMind is now linked to your <strong>Acme HQ</strong> workspace.</p>
               </div>
               <button className="text-[13px] font-extrabold text-blue hover:underline decoration-blue/30 underline-offset-4 pt-2">
                  Configure sync settings now →
               </button>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/30 border-t border-slate-50 gap-3">
          {step === 1 ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-10 text-[14px] font-bold text-slate-400 hover:bg-white"
              >
                Cancel
              </Button>
              <Button 
                disabled={loading}
                onClick={handleConnect}
                className="h-10 grow bg-blue hover:bg-blue-hover text-white font-bold text-[14px] rounded-xl px-8 shadow-md shadow-blue/20 transition-all active:scale-95 gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Continue to {integration.name}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleDone}
              className="h-10 w-full bg-blue hover:bg-blue-hover text-white font-bold text-[14px] rounded-xl px-8 shadow-md shadow-blue/20 transition-all active:scale-95"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
