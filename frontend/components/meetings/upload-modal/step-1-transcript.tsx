"use client";

import { Upload, FileText, X, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Step1Props {
  onNext: (data: any) => void;
}

export function Step1Transcript({ onNext }: Step1Props) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="p-7">
      {/* Tab Toggle */}
      <div className="flex bg-[#F1F5F9] p-1 rounded-xl w-fit mb-5">
         <button 
          onClick={() => setActiveTab("upload")}
          className={cn(
            "px-5 py-2 rounded-lg text-[13px] font-bold transition-all",
            activeTab === "upload" ? "bg-white shadow-sm text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"
          )}
         >
            Upload File
         </button>
         <button 
          onClick={() => setActiveTab("paste")}
          className={cn(
            "px-5 py-2 rounded-lg text-[13px] font-bold transition-all",
            activeTab === "paste" ? "bg-white shadow-sm text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"
          )}
         >
            Paste Text
         </button>
      </div>

      {activeTab === "upload" ? (
        <div className="space-y-4">
           {!file ? (
             <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={cn(
                "border-2 border-dashed rounded-[10px] p-[48px_32px] text-center cursor-pointer transition-all",
                isDragging ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC]"
              )}
             >
                <div className="flex flex-col items-center">
                   <Upload className="w-8 h-8 text-[#94A3B8]" />
                   <p className="text-[14px] font-medium text-[#334155] mt-3">Drop your transcript here</p>
                   <p className="text-[13px] text-[#64748B] mt-1">or click to browse files</p>
                   <p className="text-[12px] text-[#94A3B8] mt-2">Supports .txt, .pdf, .docx, .vtt, .srt</p>
                </div>
             </div>
           ) : (
             <div className="border border-[#BBF7D0] bg-[#F0FDF4] rounded-[10px] p-4 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                   <FileText className="w-5 h-5 text-[#2563EB]" />
                   <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-[#0F172A]">{file.name}</span>
                      <span className="text-[12px] text-[#64748B]">{Math.round(file.size / 1024)} KB</span>
                   </div>
                </div>
                <button onClick={() => setFile(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-[#94A3B8]">
                   <X className="w-4 h-4" />
                </button>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-4">
           <Textarea 
            placeholder="Paste your meeting transcript here..."
            className="min-h-[240px] border-[#E2E8F0] rounded-lg p-[14px_16px] text-[13px] text-[#334155] leading-[1.6] focus:border-[#2563EB] ring-0"
            value={text}
            onChange={(e) => setText(e.target.value)}
           />
           <div className="text-right text-[12px] text-[#94A3B8] font-medium">
              {wordCount} words
           </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end mt-6">
         <Button 
          onClick={() => onNext({ type: activeTab, content: file || text })}
          disabled={!file && !text.trim()}
          className="h-10 px-6 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg font-bold text-[13px]"
         >
            Next: Meeting Details →
         </Button>
      </div>
    </div>
  );
}
