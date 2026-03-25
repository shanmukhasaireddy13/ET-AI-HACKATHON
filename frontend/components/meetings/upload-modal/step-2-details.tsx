"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { X, Calendar as CalendarIcon, Clock, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export function Step2Details({ onNext, onBack }: Step2Props) {
  const [title, setTitle] = useState("New Meeting Analysis");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [platform, setPlatform] = useState("zoom");
  const [participants, setParticipants] = useState<string[]>(["Shanmukha Sai", "Sai Reddy"]);
  const [inputValue, setInputValue] = useState("");

  const addParticipant = () => {
    if (inputValue.trim()) {
      setParticipants([...participants, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeParticipant = (name: string) => {
    setParticipants(participants.filter(p => p !== name));
  };

  const handleSubmit = () => {
    onNext({
      title,
      date,
      time,
      duration,
      platform,
      participants
    });
  };

  return (
    <div className="p-7 space-y-6">
      {/* Meeting Title */}
      <div className="space-y-2">
         <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Meeting Title</label>
         <Input 
          placeholder="e.g. Q2 Engineering Planning"
          className="h-11 border-[#E2E8F0] rounded-lg text-[14px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
         />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Date</label>
            <div className="relative">
               <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
               <Input 
                type="date" 
                className="h-11 pl-10 border-[#E2E8F0] rounded-lg text-[14px]" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
               />
            </div>
         </div>
         <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Time</label>
            <div className="relative">
               <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
               <Input 
                type="time" 
                className="h-11 pl-10 border-[#E2E8F0] rounded-lg text-[14px]" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
               />
            </div>
         </div>
      </div>

      {/* Duration & Platform */}
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Duration (min)</label>
            <Input 
              type="number" 
              className="h-11 border-[#E2E8F0] rounded-lg text-[14px]" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
         </div>
         <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Platform</label>
            <Select value={platform} onValueChange={(val) => setPlatform(val as any)}>
               <SelectTrigger className="h-11 border-[#E2E8F0] rounded-lg text-[14px]">
                  <SelectValue placeholder="Select Platform" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </div>

      {/* Participants */}
      <div className="space-y-2">
         <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Participants</label>
         <div className="border border-[#E2E8F0] rounded-lg p-2 min-h-[44px] flex flex-wrap gap-2 focus-within:border-[#2563EB] transition-colors">
            {participants.map((p) => (
               <div key={p} className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-full py-1 pl-2 pr-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-4 h-4 rounded-full bg-blue text-white text-[8px] flex items-center justify-center font-bold">
                     {p[0]}
                  </div>
                  <span className="text-[12px] font-medium text-[#2563EB]">{p}</span>
                  <button onClick={() => removeParticipant(p)} className="w-4 h-4 rounded-full hover:bg-blue/10 flex items-center justify-center text-[#94A3B8]">
                     <X className="w-2.5 h-2.5" />
                  </button>
               </div>
            ))}
            <input 
              className="flex-1 outline-none text-[13px] px-2 min-w-[120px]"
              placeholder={participants.length === 0 ? "Add participants..." : ""}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
            />
         </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6 pt-4 border-t border-[#F1F5F9]">
         <Button onClick={onBack} variant="ghost" className="text-[#64748B] font-bold px-0 hover:bg-transparent hover:text-[#0F172A]">
            ← Back
         </Button>
         <Button onClick={handleSubmit} className="h-10 px-6 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg font-bold text-[13px]">
            Next: Configure →
         </Button>
      </div>
    </div>
  );
}

