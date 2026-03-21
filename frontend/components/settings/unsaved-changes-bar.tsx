"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UnsavedChangesBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isLoading?: boolean;
}

export function UnsavedChangesBar({ isVisible, onSave, onDiscard, isLoading }: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-[calc(240px+32px)] right-8 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white border border-blue/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl py-3 px-6 flex items-center gap-8 pointer-events-auto border-b-4 border-b-blue">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue animate-pulse" />
              <span className="text-[13px] font-bold text-blue tracking-tight">
                You have unsaved changes
              </span>
            </div>
            
            <div className="h-4 w-px bg-slate-100" />
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={onDiscard}
                disabled={isLoading}
                className="h-9 px-4 text-[13px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              >
                Discard
              </Button>
              <Button 
                onClick={onSave}
                className="h-9 px-6 bg-blue hover:bg-blue-hover text-white text-[13px] font-bold shadow-lg shadow-blue/20 transition-all hover:-translate-y-0.5"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
