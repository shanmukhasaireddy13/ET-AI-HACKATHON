"use client";

import Link from "next/link";

interface Meeting {
  id: string;
  transcript: string;
  status: string;
  created_at?: string;
  task_count?: number;
  approval_count?: number;
  proposal_count?: number;
  error_count?: number;
}

interface MeetingListProps {
  meetings: Meeting[];
  loading: boolean;
}

export default function MeetingList({ meetings, loading }: MeetingListProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel h-24 w-full opacity-50"></div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-lg font-medium">No meetings processed yet</p>
        <p className="text-sm mt-1 mb-6">Upload a transcript to create your first meeting workflow.</p>
        <button className="px-6 py-2 rounded-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 transition-colors font-medium">
          Process New Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Link 
          href={`/meetings/${meeting.id}`} 
          key={meeting.id}
          className="block glass-panel p-5 hover:bg-white/[0.03] transition-colors border border-transparent hover:border-primary/30 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg truncate text-foreground">
                  Meeting {meeting.id.split("-").slice(0, 2).join("-")}
                </h3>
                <StatusBadge status={meeting.status} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {meeting.transcript.substring(0, 100)}...
              </p>
            </div>
            
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col items-center">
                  <span className="font-medium text-foreground">{meeting.task_count || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider">Tasks</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-medium text-foreground">{meeting.proposal_count || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider">Proposals</span>
                </div>
                {(meeting.approval_count && meeting.approval_count > 0) ? (
                  <div className="flex flex-col items-center text-accent">
                    <span className="font-medium">{meeting.approval_count}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Approvals</span>
                  </div>
                ) : null}
              </div>
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    running: "bg-blue-500/10 text-blue-400 border-blue-500/20 active-agent-ring",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    needs_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const style = styles[status.toLowerCase()] || "bg-gray-500/10 text-gray-400 border-gray-500/20";

  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${style} capitalize font-medium flex items-center gap-1.5`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
      )}
      {status.replace("_", " ")}
    </span>
  );
}
