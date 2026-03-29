"use client";

import { Bell, CircleHelp, Search, ChevronDown, User, Settings, CreditCard, Keyboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [userEmail, setUserEmail] = useState("user@acme.com");
  const [userName, setUserName] = useState("John Doe");
  const [userTitle, setUserTitle] = useState("Team Member");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "user@acme.com");
        const nameFallback = user.email?.split('@')[0] || "John Doe";
        setUserName(user.user_metadata?.full_name || nameFallback);

        // Fetch profile title
        const { data: profile } = await supabase
          .from('profiles')
          .select('title')
          .eq('id', user.id)
          .single();
        if (profile?.title) setUserTitle(profile.title);
      }
      // Fetch pending approvals
      const { count } = await supabase
        .from('approvals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (count !== null) setPendingApprovals(count);
    }
    fetchData();
  }, []);

  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-dash z-50 px-6 flex items-center justify-between">
      {/* Left Zone: Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">
          M
        </div>
        <span className="font-semibold text-[#0F172A] text-[16px] tracking-tight">MeetingMind</span>
      </div>

      {/* Center Zone: Search */}
      <div className="hidden md:flex items-center relative w-[320px]">
        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search meetings, tasks, agents..." 
          className="pl-9 pr-14 h-9 bg-dash-bg border-border-dash text-[13px] focus-visible:ring-blue"
        />
        <div className="absolute right-2 px-1.5 py-0.5 rounded border border-border-dash bg-white text-[10px] text-slate-400 font-medium">
          ⌘K
        </div>
      </div>

      {/* Right Zone: Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative text-muted-text hover:bg-dash-bg rounded-lg">
          <Bell className="w-5 h-5" />
          {pendingApprovals > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-orange text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
              {pendingApprovals}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-dash-bg rounded-lg">
          <CircleHelp className="w-5 h-5" />
        </Button>
        
        <div className="w-px h-7 bg-border-dash mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={
              <div className="flex items-center gap-3 p-1.5 hover:bg-dash-bg rounded-lg transition-colors text-left group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-blue-light text-blue flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                  {initials}
                </div>
                <div className="hidden lg:block">
                  <p className="text-[14px] font-semibold text-[#0F172A] leading-none mb-1 truncate max-w-[120px] capitalize">{userName}</p>
                  <p className="text-[11px] text-muted-text leading-none">{userTitle}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            }
          />
          <DropdownMenuContent align="end" className="w-[220px] rounded-xl border-border-dash shadow-lg">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-3">
                <p className="text-sm font-semibold text-black capitalize">{userName}</p>
                <p className="text-xs text-muted-text">{userEmail}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="h-9 gap-2 text-[14px] text-body cursor-pointer hover:bg-dash-bg">
              <User className="w-4 h-4 text-slate-400" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="h-9 gap-2 text-[14px] text-body cursor-pointer hover:bg-dash-bg">
              <Settings className="w-4 h-4 text-slate-400" /> Team Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="h-9 gap-2 text-[14px] text-body cursor-pointer hover:bg-dash-bg">
              <CreditCard className="w-4 h-4 text-slate-400" /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem className="h-9 gap-2 text-[14px] text-body cursor-pointer hover:bg-dash-bg">
              <Keyboard className="w-4 h-4 text-slate-400" /> Keyboard Shortcuts
              <span className="ml-auto text-[10px] text-slate-400">⌘/</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="h-9 gap-2 text-[14px] text-red-600 cursor-pointer hover:bg-red-light focus:text-red-600 focus:bg-red-light" onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
