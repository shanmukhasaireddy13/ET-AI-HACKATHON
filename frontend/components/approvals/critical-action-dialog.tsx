"use client";

import { useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface CriticalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionTitle: string;
  onConfirm: () => void;
}

export function CriticalActionDialog({ open, onOpenChange, actionTitle, onConfirm }: CriticalActionDialogProps) {
  const [confirmValue, setConfirmValue] = useState("");
  const isValid = confirmValue === "CONFIRM";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[480px] rounded-2xl border-slate-200 shadow-2xl p-6">
        <AlertDialogHeader>
          <div className="w-11 h-11 rounded-xl bg-orange-light flex items-center justify-center text-orange mb-2 shadow-sm border border-orange-200/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-[18px] font-bold text-slate-900 tracking-tight leading-none">
             Confirm Critical Action
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-slate-500 leading-relaxed pt-2">
            You are about to execute: <span className="font-bold text-slate-900 leading-none">"{actionTitle}"</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
           <div className="p-3.5 bg-error-bg/50 border border-error-border/30 rounded-xl flex gap-3">
              <Info className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <p className="text-[13px] font-bold text-error leading-relaxed italic">
                This action cannot be undone. It will trigger external API executions and notify stakeholders.
              </p>
           </div>
           
           <div className="space-y-2">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Type CONFIRM to proceed</label>
             <Input 
               value={confirmValue}
               onChange={(e) => setConfirmValue(e.target.value)}
               placeholder="CONFIRM"
               className="h-11 border-slate-200 focus-visible:ring-error text-[14px] font-bold tracking-widest font-mono shadow-inner rounded-xl"
             />
           </div>
        </div>

        <AlertDialogFooter className="gap-3 sm:justify-start pt-2">
          <AlertDialogCancel className="flex-1 h-11 border-slate-200 font-bold text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            disabled={!isValid}
            onClick={onConfirm}
            className="flex-1 h-11 bg-error hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-error/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Approve & Execute
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
