"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface DisconnectAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string | null;
  onConfirm: () => void;
}

export function DisconnectAlert({ open, onOpenChange, integrationName, onConfirm }: DisconnectAlertProps) {
  if (!integrationName) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 rounded-2xl shadow-2xl animate-in zoom-in-95 selection:bg-error/10">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-orange-light flex items-center justify-center text-orange mb-4 shadow-sm border border-orange-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-[18px] font-bold text-slate-900 tracking-tight leading-tight">
              Disconnect {integrationName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-slate-500 leading-relaxed font-medium">
              This will stop all synchronization with <strong>{integrationName}</strong>. Existing data will remain, but new updates will cease until reconnected.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 gap-3">
          <AlertDialogCancel className="h-10 text-[14px] font-bold text-slate-400 hover:bg-white border-0 bg-transparent m-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="h-10 bg-error hover:bg-error-hover text-white font-bold text-[14px] rounded-xl px-6 shadow-md shadow-error/10 border-0 transition-all active:scale-95 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
