"use client";

import { Mail, MoreHorizontal, UserPlus, Shield, User, Eye, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const members = [
  { id: "1", name: "John Doe", email: "john.doe@acme.inc", role: "Admin", status: "Active", joined: "Jan 14, 2026" },
  { id: "2", name: "Sarah Smith", email: "sarah.s@acme.inc", role: "Manager", status: "Active", joined: "Feb 02, 2026" },
  { id: "3", name: "Mike Johnson", email: "m.johnson@acme.inc", role: "Viewer", status: "Active", joined: "Mar 10, 2026" },
  { id: "4", name: "Pending User", email: "new.hire@acme.inc", role: "Manager", status: "Invited", joined: "Pending" },
];

export function TeamPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 leading-none">Team Members</h2>
          <p className="text-[13px] text-slate-500 mt-1.5">Manage who has access to this workspace and their permission levels.</p>
        </div>
        <Badge variant="outline" className="w-fit bg-slate-50 text-slate-500 border-slate-200 py-1 px-3 rounded-full text-[11px] font-bold">
          4 Members
        </Badge>
      </div>

      {/* Invite Row */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="colleague@company.com" className="h-10 pl-9 border-slate-200 rounded-lg focus:ring-blue/10" />
        </div>
        <Select defaultValue="manager">
          <SelectTrigger className="w-[130px] h-10 border-slate-200 rounded-lg">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button className="h-10 px-6 bg-blue hover:bg-blue-hover text-white text-[13px] font-bold gap-2 shadow-md shadow-blue/10 transition-all hover:-translate-y-0.5">
          <UserPlus className="w-4 h-4" />
          Send Invite
        </Button>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/50 h-[38px] border-b border-slate-100">
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-6 text-left">Member</th>
              <th className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Role</th>
              <th className="w-[100px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Status</th>
              <th className="w-[120px] text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Joined</th>
              <th className="w-[80px] text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="h-[64px] border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-slate-100 shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-bold">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[14px] font-semibold text-slate-900">{member.name}</span>
                      <span className="text-[12px] text-slate-500">{member.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <Select defaultValue={member.role.toLowerCase()}>
                    <SelectTrigger className={cn(
                      "h-7 w-[100px] text-[11px] font-bold border-none shadow-none rounded-full",
                      member.role === "Admin" ? "bg-error-bg/30 text-error" : 
                      member.role === "Manager" ? "bg-blue-light/30 text-blue" : "bg-slate-100 text-slate-500"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td>
                  <Badge className={cn(
                    "text-[10px] font-bold rounded-full px-2 py-0.5",
                    member.status === "Active" ? "bg-green text-white" : "bg-orange text-white"
                  )}>
                    {member.status}
                  </Badge>
                </td>
                <td>
                  <span className="text-[13px] text-slate-500 font-medium">{member.joined}</span>
                </td>
                <td className="pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" className="w-8 h-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-[180px] p-1.5 rounded-xl border-slate-200 shadow-lg">
                      {member.status === "Invited" && (
                        <DropdownMenuItem className="rounded-lg gap-2 text-[13px] font-medium py-2 focus:bg-slate-50 cursor-pointer">
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                          Resend Invite
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="rounded-lg gap-2 text-[13px] font-medium py-2 focus:bg-slate-50 cursor-pointer text-slate-600">
                        <Eye className="w-4 h-4 text-slate-400" />
                        View Activity
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-slate-100" />
                      <DropdownMenuItem className="rounded-lg gap-2 text-[13px] font-bold py-2 focus:bg-error-bg/10 text-error cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invites Dotted Section Suggestion */}
      <div className="px-6 py-6 border-t-2 border-dashed border-slate-100 bg-slate-50/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pending Invites (1)</h4>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm border-l-4 border-l-orange">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-light/10 flex items-center justify-center">
                 <Mail className="w-4 h-4 text-orange" />
              </div>
              <div className="flex flex-col leading-tight">
                 <span className="text-[13px] font-bold text-slate-900">new.hire@acme.inc</span>
                 <span className="text-[11px] text-slate-400 font-medium italic">Manager role — Invited 2h ago</span>
              </div>
           </div>
           <Button variant="ghost" className="text-error hover:text-error hover:bg-error-bg/10 text-[12px] font-bold h-8">
              Revoke
           </Button>
        </div>
      </div>
    </div>
  );
}
