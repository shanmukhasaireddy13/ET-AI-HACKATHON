import { Bot, CheckSquare, ShieldAlert, Mic, AlertCircle, Plug, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

type ActivityItem = {
  id: string;
  type: "meeting" | "task" | "approval" | "agent" | "error";
  actor: string;
  description: string;
  timestamp: string;
  icon: any;
  bg: string;
  color: string;
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchActivity() {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const mapped: ActivityItem[] = data.map(item => {
          let icon = Bot;
          let bg = "bg-slate-100";
          let color = "text-slate-500";

          switch (item.category) {
            case 'meeting':
              icon = Mic;
              bg = "bg-blue-light";
              color = "text-blue";
              break;
            case 'task':
              icon = CheckSquare;
              bg = "bg-success-bg";
              color = "text-success";
              break;
            case 'approval':
              icon = ShieldAlert;
              bg = "bg-orange-light";
              color = "text-orange";
              break;
            case 'integration':
              icon = Plug;
              bg = "bg-purple-light";
              color = "text-purple";
              break;
          }

          return {
            id: item.id,
            type: item.category as any,
            actor: item.category === 'agent' ? 'Meeting Mind Agent' : 'System',
            description: item.description || item.action,
            timestamp: item.created_at,
            icon: icon,
            bg: bg,
            color: color
          };
        });

        setActivities(mapped);
      }
      setLoading(false);
    }

    fetchActivity();
  }, []);

  if (loading) {
     return (
       <div className="bg-white border border-border-dash rounded-xl p-12 flex justify-center items-center shadow-sm">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
       </div>
     );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white border border-border-dash rounded-xl p-12 text-center shadow-sm">
        <p className="text-[13px] text-slate-500">No recent activity found.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-border-dash rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">Activity Feed</h3>
        <div className="flex bg-dash-bg p-0.5 rounded-lg border border-border-dash">
          {["All", "Agents", "Tasks", "Approvals"].map((tab, i) => (
            <button 
              key={tab}
              className={cn(
                "px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                i === 0 ? "bg-white shadow-sm text-blue" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="link" className="text-blue text-[12px] h-auto p-0 hover:no-underline font-medium">
          Mark all read
        </Button>
      </div>

      <div className="divide-y divide-slate-50">
        {activities.map((item, idx) => (
          <div key={item.id} className="px-6 py-3.5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group relative overflow-hidden">
            {idx === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue" />}
            
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.bg)}>
              <item.icon className={cn("w-4 h-4", item.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-[#334155] leading-snug">
                <span className="font-bold text-[#0F172A]">{item.actor}</span>{" "}
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] text-slate-400">{formatDistanceToNow(new Date(item.timestamp))} ago</span>
                {item.type === "agent" && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
              </div>
            </div>

            <Button variant="ghost" size="icon" className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="px-6 py-3 bg-dash-bg text-center">
        <Button variant="link" className="text-blue text-[13px] h-auto p-0 hover:no-underline font-medium">
          View full activity log →
        </Button>
      </div>
    </div>
  );
}
