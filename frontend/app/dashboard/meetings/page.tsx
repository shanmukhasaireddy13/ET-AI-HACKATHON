"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingsStats } from "../../../components/meetings/meetings-stats";
import { MeetingsFilters } from "../../../components/meetings/meetings-filters";
import { MeetingsTable } from "../../../components/meetings/meetings-table";
import { MeetingCard } from "../../../components/meetings/meeting-card";
import { UploadMeetingModal } from "../../../components/meetings/upload-modal";

const meetingsData = [
  { 
    id: "1", 
    title: "Q2 Engineering Planning", 
    project: "Backend Engine", 
    participants: 6, 
    date: "Mar 21, 2026", 
    time: "10:30 AM", 
    duration: 75, 
    source: "Zoom", 
    tasks: 12, 
    status: "Complete",
    agents: [
      { name: "Summarizer", avatar: "/avatars/agent-1.png" },
      { name: "Task Extractor", avatar: "/avatars/agent-2.png" },
      { name: "Decision Logger", avatar: "/avatars/agent-3.png" },
    ]
  },
  { 
    id: "2", 
    title: "Weekly Sync - Product", 
    project: "Mobile App", 
    participants: 4, 
    date: "Mar 21, 2026", 
    time: "09:00 AM", 
    duration: 30, 
    source: "Meet", 
    tasks: 5, 
    status: "Analysing",
    progress: 60,
    currentAgents: "3/5",
    agents: [
      { name: "Summarizer", avatar: "/avatars/agent-1.png" },
      { name: "Task Extractor", avatar: "/avatars/agent-2.png" },
    ]
  },
  { 
    id: "3", 
    title: "Project Alpha Kickoff", 
    participants: 12, 
    date: "Mar 20, 2026", 
    time: "02:00 PM", 
    duration: 60, 
    source: "Teams", 
    tasks: 0, 
    status: "Failed",
    reason: "Audio quality too low",
    agents: []
  },
  { 
    id: "4", 
    title: "Design Review - Website Redesign", 
    project: "Marketing", 
    participants: 3, 
    date: "Mar 20, 2026", 
    time: "11:00 AM", 
    duration: 45, 
    source: "Manual", 
    tasks: 0, 
    status: "Queued",
    agents: []
  },
];

export default function MeetingsPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("action") === "upload") {
      setIsUploadOpen(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      const newPath = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      router.replace(newPath);
    }
  }, [searchParams, router]);

  return (
    <div className="p-[28px_32px] max-w-[1280px] mx-auto space-y-[20px]">
      {/* Section 1: Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-[20px] font-semibold text-[#0F172A]">Meetings</h1>
          <p className="text-[13px] text-[#64748B]">
            47 total · <span className="text-[#EA580C] font-semibold">3 analysing</span> · <span className="text-[#DC2626] font-semibold">2 failed</span>
          </p>
        </div>
        <Button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg px-4 h-10 flex items-center gap-2 text-[13px] font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload Meeting
        </Button>
      </div>

      {/* Section 2: Stats Strip */}
      <MeetingsStats />

      {/* Section 3: Filter + Toolbar */}
      <MeetingsFilters view={view} onViewChange={setView} />

      {/* Section 4 & 5: Library Content */}
      <div className="animate-in fade-in duration-500">
        {view === "list" ? (
          <MeetingsTable />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {meetingsData.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadMeetingModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}
