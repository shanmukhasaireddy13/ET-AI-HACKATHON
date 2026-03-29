"use client";

import { Mic, Video, ExternalLink } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import Link from "next/link";

type MeetingRecord = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  tasks_count?: number;
};

export function MeetingsTable() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      // Fetch meetings and join with task counts
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          tasks:tasks(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching meetings:", error);
      } else {
        const formatted = data.map((m: any) => ({
          ...m,
          tasks_count: m.tasks?.[0]?.count || 0
        }));
        setMeetings(formatted);
      }
      setLoading(false);
    }

    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-border-dash rounded-xl p-8 flex justify-center items-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white border border-border-dash rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-[15px] font-semibold text-slate-900">No meetings found</h3>
        <p className="text-[13px] text-slate-500 mt-1 max-w-[240px] mx-auto">Upload your first meeting transcript to get started with AI analysis.</p>
        <Button size="sm" className="mt-6 bg-blue hover:bg-blue-hover text-white h-8 text-[12px]">Upload Meeting</Button>
      </div>
    );
  }
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Recent Meetings</h3>
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline">
          View all →
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-dash-bg">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="w-[300px] h-9 text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-5">Meeting</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tasks</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Agents</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-5 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
              <TableCell className="py-3.5 pl-5">
                <div className="max-w-[280px]">
                  <p className="text-[14px] font-medium text-[#0F172A] truncate mb-0.5">{meeting.title}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Video className="w-3 h-3" />
                    <span>via Zoom</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-[13px] text-[#334155]">{format(new Date(meeting.created_at), 'MMM dd')}</p>
                <p className="text-[11px] text-slate-400">{format(new Date(meeting.created_at), 'p')}</p>
              </TableCell>
              <TableCell>
                <span className="text-[13px] font-semibold text-blue">{meeting.tasks_count}</span>
                <span className="text-[11px] text-slate-400 ml-1">tasks</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={meeting.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center -space-x-1.5">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-blue-light border-2 border-white flex items-center justify-center text-[10px] text-blue font-bold">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Link href={`/dashboard/meetings/${meeting.id}`}>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-[12px] bg-dash-bg border-border-dash hover:border-blue hover:text-blue transition-all">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Analysing":
      return (
        <Badge variant="outline" className="bg-warning-bg text-warning border-warning-border rounded-full px-2.5 py-0.5 text-[10px] font-bold gap-1.5 overflow-hidden ring-0">
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-soft" />
          {status}
        </Badge>
      );
    case "Complete":
      return (
        <Badge variant="outline" className="bg-success-bg text-success border-success-border rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-0">
          {status}
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="outline" className="bg-error-bg text-error border-error-border rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-0">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-0">
          {status}
        </Badge>
      );
  }
}
