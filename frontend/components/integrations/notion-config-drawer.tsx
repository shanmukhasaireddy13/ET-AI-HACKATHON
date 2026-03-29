"use client";

import { useState, useEffect } from "react";
import { X, Zap, Copy, ExternalLink, CheckCircle2, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

interface NotionConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NotionConfigDrawer({ open, onOpenChange, onSuccess }: NotionConfigDrawerProps) {
  const [token, setToken] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [autoPush, setAutoPush] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("integrations")
      .select("*")
      .eq("name", "notion")
      .single();

    if (data) {
      setToken(data.api_token || "");
      try {
        const extra = JSON.parse(data.extra || "{}");
        setDatabaseId(extra.database_id || "");
        setAutoPush(extra.auto_push !== false);
      } catch (e) {
        setDatabaseId("");
        setAutoPush(true);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("integrations").upsert({
      name: "notion",
      api_token: token,
      extra: JSON.stringify({ database_id: databaseId, auto_push: autoPush }),
      status: "connected",
      last_sync: new Date().toISOString()
    }, { onConflict: "name" });

    if (!error) {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SheetHeader className="px-6 py-4 border-b border-slate-100 flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center p-1.5 bg-slate-50">
                  <FileText className="w-5 h-5 text-slate-900" />
               </div>
               <SheetTitle className="text-[16px] font-bold text-slate-900 tracking-tight">Notion Configuration</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </Button>
          </SheetHeader>

          <div className="p-6 space-y-8 pb-12">
            {/* Guide */}
            <div className="p-4 bg-blue-light/20 border border-blue-mid/40 rounded-xl space-y-2">
               <div className="flex items-center gap-2 text-blue">
                  <Info className="w-4 h-4" />
                  <span className="text-[12px] font-bold uppercase tracking-widest">How to connect</span>
               </div>
               <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" className="text-blue hover:underline">Notion Developers</a> and create an Internal Integration.<br/>
                  2. Share your Database with this integration using the "Connect to" button in your Database.<br/>
                  3. Paste the Secret Token and Database ID below.
               </p>
            </div>

            {/* Section: Credentials */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Credentials</h3>
               <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Internal Integration Token</label>
                    <Input 
                      type="password" 
                      placeholder="secret_..." 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="h-10 bg-white border-slate-200 focus-visible:ring-blue text-[13px] rounded-lg" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-700 ml-1">Database ID</label>
                    <Input 
                      placeholder="32d206..." 
                      value={databaseId}
                      onChange={(e) => setDatabaseId(e.target.value)}
                      className="h-10 bg-white border-slate-200 focus-visible:ring-blue text-[13px] rounded-lg" 
                    />
                  </div>
                  <Button variant="outline" className="h-9 w-full bg-white border-slate-200 text-slate-600 font-bold text-[12px] rounded-lg gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]">
                    <Zap className="w-3.5 h-3.5" /> Test Notion Connection
                  </Button>
               </div>
            </div>

            {/* Section: Automation */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Automation</h3>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-bold text-slate-900">Auto-push tasks to Notion</p>
                    <p className="text-[11px] text-slate-500 leading-snug">Instantly create Notion items after meeting analysis</p>
                  </div>
                  <Switch checked={autoPush} onCheckedChange={setAutoPush} />
               </div>
            </div>

            {/* Section: Features */}
            <div className="space-y-4">
               <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Enabled Features</h3>
               <div className="space-y-4">
                  {[
                    { label: "Meeting Summaries", desc: "Sync meeting high-level notes & topics" },
                    { label: "Decision Log", desc: "Export extracted decisions to a Notion table" },
                    { label: "Action Items", desc: "Create tasks in your Notion board" }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-green" />
                       <div className="space-y-0.5">
                          <p className="text-[13px] font-bold text-slate-900">{f.label}</p>
                          <p className="text-[11px] text-slate-500">{f.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-[40px] text-[13px] text-slate-400 hover:text-slate-600 font-bold">
            Cancel
          </Button>
          <Button 
            disabled={loading || !token || !databaseId}
            onClick={handleSave}
            className="h-[40px] bg-blue hover:bg-blue-hover text-white text-[13px] font-bold px-8 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {saved ? "Saved!" : loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
