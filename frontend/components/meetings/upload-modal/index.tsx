"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Step1Transcript } from "./step-1-transcript";
import { Step2Details } from "./step-2-details";
import { Step3Config } from "./step-3-config";

interface UploadMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadMeetingModal({ open, onOpenChange }: UploadMeetingModalProps) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [stepData, setStepData] = useState<any>({});

  const handleNext = (data: any) => {
    setStepData({ ...stepData, ...data });
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = async (finalData: any) => {
    const fullData = { ...stepData, ...finalData };
    setIsUploading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001'}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullData),
      });

      if (!response.ok) throw new Error('Failed to upload meeting');
      
      const result = await response.json();
      console.log("Meeting processed:", result);
      
      onOpenChange(false);
      setTimeout(() => {
        setStep(1);
        setStepData({});
        setIsUploading(false);
      }, 300);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      alert("Failed to start analysis. Please check if the backend is running.");
    }
  };

  const steps = [
    { number: 1, label: "Upload Transcript" },
    { number: 2, label: "Meeting Details" },
    { number: 3, label: "Configure & Run" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[680px] p-0 overflow-hidden border-none rounded-[14px] shadow-[0_24px_80px_rgba(0,0,0,0.15)] bg-white">
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#F1F5F9] flex items-center justify-between bg-white sticky top-0 z-10">
           <DialogHeader>
              <DialogTitle className="text-[16px] font-semibold text-[#0F172A]">Analyse New Meeting</DialogTitle>
           </DialogHeader>
           <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] transition-colors"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Step Indicator */}
        <div className="px-7 py-4 border-b border-[#F1F5F9] flex items-center gap-0">
           {steps.map((s, i) => (
             <div key={s.number} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-2">
                   <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[13px] transition-all shrink-0 border-2",
                      step === s.number ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] font-bold" :
                      step > s.number ? "border-[#16A34A] bg-[#16A34A] text-white" :
                      "border-[#E2E8F0] bg-white text-[#94A3B8]"
                   )}>
                      {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
                   </div>
                   <span className={cn(
                     "text-[12px] whitespace-nowrap",
                     step === s.number ? "text-[#2563EB] font-semibold" :
                     step > s.number ? "text-[#16A34A] font-medium" :
                     "text-[#94A3B8]"
                   )}>
                      {s.label}
                   </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-[2px] mx-4 -mt-6",
                    step > s.number ? "bg-[#16A34A]" : "bg-[#E2E8F0]"
                  )} />
                )}
             </div>
           ))}
        </div>

        {/* Step Content Area */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
           {step === 1 && <Step1Transcript onNext={handleNext} />}
           {step === 2 && <Step2Details onNext={handleNext} onBack={handleBack} />}
           {step === 3 && <Step3Config onBack={handleBack} onFinish={handleFinish} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
