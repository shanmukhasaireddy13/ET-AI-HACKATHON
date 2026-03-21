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

const MEETINGS = [
  {
    id: "1",
    name: "Engineering Planning Q2",
    source: "Zoom",
    date: "Mar 21",
    time: "10:30 AM",
    tasks: 12,
    status: "Analysing",
    agents: [1, 2, 3, 4, 5]
  },
  {
    id: "2",
    name: "Weekly Design Sync",
    source: "Google Meet",
    date: "Mar 20",
    time: "2:00 PM",
    tasks: 8,
    status: "Complete",
    agents: [1, 2, 3]
  },
  {
    id: "3",
    name: "Product Roadmap Review",
    source: "Teams",
    date: "Mar 19",
    time: "11:15 AM",
    tasks: 15,
    status: "Complete",
    agents: [1, 2, 4]
  },
  {
    id: "4",
    name: "Customer Feedback Session",
    source: "Zoom",
    date: "Mar 19",
    time: "9:00 AM",
    tasks: 5,
    status: "Failed",
    agents: [1, 6]
  },
  {
    id: "5",
    name: "Marketing Brainstorm",
    source: "Teams",
    date: "Mar 18",
    time: "4:30 PM",
    tasks: 0,
    status: "Queued",
    agents: []
  }
];

export function MeetingsTable() {
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
          {MEETINGS.map((meeting) => (
            <TableRow key={meeting.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
              <TableCell className="py-3.5 pl-5">
                <div className="max-w-[280px]">
                  <p className="text-[14px] font-medium text-[#0F172A] truncate mb-0.5">{meeting.name}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Video className="w-3 h-3" />
                    <span>via {meeting.source}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-[13px] text-[#334155]">{meeting.date}</p>
                <p className="text-[11px] text-slate-400">{meeting.time}</p>
              </TableCell>
              <TableCell>
                <span className="text-[13px] font-semibold text-blue">{meeting.tasks}</span>
                <span className="text-[11px] text-slate-400 ml-1">tasks</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={meeting.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center -space-x-1.5">
                  {meeting.agents.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-blue-light border-2 border-white flex items-center justify-center text-[10px] text-blue font-bold">
                      {i + 1}
                    </div>
                  ))}
                  {meeting.agents.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] text-slate-500 font-bold">
                      +{meeting.agents.length - 3}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Button variant="outline" size="sm" className="h-7 px-3 text-[12px] bg-dash-bg border-border-dash hover:border-blue hover:text-blue transition-all">
                  View
                </Button>
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
