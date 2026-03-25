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
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: number;
  tasks: number;
  status: string;
  agents: any[];
  project?: string;
  source?: string;
};

export default function MeetingsPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const fetchMeetings = async () => {
    setLoading(true);
    
    // 1. Fetch meetings
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('meetings')
      .select('*, tasks(count)')
      .order('created_at', { ascending: false });

    // 2. Fetch total tasks count across all meetings
    const { count: tasksCount, error: tasksError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (meetingsError) {
      console.error("Error fetching meetings:", meetingsError);
    } else {
      const formatted: Meeting[] = meetingsData.map((m: any) => ({
        id: m.id,
        title: m.title,
        date: format(new Date(m.created_at), 'MMM dd, yyyy'),
        duration: m.metadata?.duration || 0,
        participants: m.metadata?.participants?.split(',').length || 0,
        tasks: m.tasks?.[0]?.count || 0,
        status: m.status === 'processing' ? 'Analysing' : m.status.charAt(0).toUpperCase() + m.status.slice(1),
        agents: [],
        project: "General",
        source: m.metadata?.platform || "External"
      }));
      setMeetings(formatted);
      setTotalTaskCount(tasksCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "upload") {
      setIsUploadOpen(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("action");
      const newPath = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      router.replace(newPath);
    }
  }, [searchParams, router]);

  const stats = {
    total: meetings.length,
    completed: meetings.filter(m => m.status !== 'Analysing').length,
    analysing: meetings.filter(m => m.status === 'Analysing').length,
    tasks: totalTaskCount,
    failed: meetings.filter(m => m.status === 'Failed').length
  };

  return (
    <div className="p-[28px_32px] max-w-[1280px] mx-auto space-y-[20px]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-[20px] font-semibold text-[#0F172A]">Meetings Library</h1>
          <p className="text-[13px] text-[#64748B]">
            {stats.total} total · <span className="text-[#EA580C] font-semibold">{stats.analysing} processing</span> · <span className="text-[#DC2626] font-semibold">{stats.failed} failed</span>
          </p>
        </div>
        <Button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg px-4 h-10 flex items-center gap-2 text-[13px] font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload New Recording
        </Button>
      </div>

      <MeetingsStats stats={stats} />

      <MeetingsFilters view={view} onViewChange={setView} />

      <div className="animate-in fade-in duration-500 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-white border border-dashed rounded-xl p-20 text-center shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
               <Mic className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-[16px] font-semibold text-slate-900">Your meeting library is empty</h3>
            <p className="text-[13px] text-slate-500 mt-2 max-w-xs mx-auto">Upload a meeting transcript or recording to see AI analysis in action.</p>
            <Button onClick={() => setIsUploadOpen(true)} className="mt-6 bg-blue">Upload Your First Meeting</Button>
          </div>
        ) : view === "list" ? (
          <MeetingsTable meetings={meetings} /> 
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>

      <UploadMeetingModal open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}

// Add missing import for Mic
import { Mic } from "lucide-react";
