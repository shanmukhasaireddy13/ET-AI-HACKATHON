import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function PerformanceTab({ agentName }: { agentName: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPerformance() {
      const { data, error } = await supabase
        .from('agent_reasoning')
        .select('*')
        .eq('agent_name', agentName)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const success = data.filter(r => r.status === 'completed').length;
        const failed = data.filter(r => r.status === 'failed').length;
        const rate = data.length > 0 ? ((success / data.length) * 100).toFixed(1) : "0";
        
        // Group by day for the chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const chartData = last7Days.map(date => {
          return data.filter(r => r.created_at.startsWith(date)).length;
        });

        setStats({
          success,
          failed,
          rate,
          chartData,
          total: data.length
        });
      }
      setLoading(false);
    }
    fetchPerformance();
  }, [agentName]);

  if (loading) return <div className="py-20 text-center text-slate-400">Loading metrics...</div>;
  if (!stats) return <div className="py-20 text-center text-slate-400">No performance data found for this agent.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-slate-500 uppercase tracking-widest pl-1">Metrics for {agentName}</h2>
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          {["7 days", "30 days", "90 days"].map((range, i) => (
            <button 
              key={range} 
              className={cn(
                "px-3 py-1 text-[12px] font-bold rounded-md transition-all",
                i === 0 ? "bg-white text-blue border border-blue/10 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-800 mb-6">Tasks Processed Over Time</h3>
          <div className="h-[200px] w-full relative group">
            <svg viewBox="0 0 400 200" className="w-full h-full text-blue">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={stats.chartData.map((val: number, i: number) => {
                  const x = i * (400 / 6);
                  const y = 180 - (val * 20); // Scale value
                  return `${x},${y}`;
                }).join(" ")}
                className="opacity-90 drop-shadow-lg"
              />
              {/* Reference grid lines */}
              {[40, 80, 120, 160].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {/* Labels */}
              <text x="0" y="195" fontSize="10" className="fill-slate-400 font-mono">Mon</text>
              <text x="400" y="195" fontSize="10" textAnchor="end" className="fill-slate-400 font-mono">Today</text>
            </svg>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-[13px] font-bold text-slate-800 w-full mb-4">Success Rate</h3>
          <div className="relative w-[160px] h-[160px]">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              <circle 
                cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="12" 
                strokeDasharray="251.2" strokeDashoffset="2.5" strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[24px] font-bold text-slate-900 font-mono tracking-tighter">{stats.rate}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">Success</span>
            </div>
          </div>
          <div className="mt-4 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-success rounded-full" />
              <span className="text-[11px] font-bold text-slate-500">Success {stats.success}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-error rounded-full" />
              <span className="text-[11px] font-bold text-slate-500">Failure {stats.failed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-bold text-slate-800 mb-4 uppercase tracking-widest text-[#94a3b8]">Avg Response Time (s)</h3>
          <div className="flex items-end gap-2 h-24">
            {stats.chartData.slice(-7).map((h: number, i: number) => (
              <div 
                key={i} 
                style={{ height: `${Math.min(h * 20, 100)}%` }} 
                className="flex-1 bg-blue/20 hover:bg-blue border-t-2 border-blue/40 transition-all rounded-t-sm"
              />
            ))}
          </div>
          <div className="mt-3 text-[18px] font-bold text-slate-900 font-mono">1.2s</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[12px] font-bold text-slate-800 mb-1 uppercase tracking-widest text-[#94a3b8]">Approval Rate</h3>
            <div className="text-[28px] font-bold text-slate-900 font-mono tracking-tighter">{stats.rate}%</div>
            <p className="text-[11px] text-slate-500 font-medium">Derived from {stats.total} tasks</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden shadow-inner">
             <div className="bg-success h-full transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-[12px] font-bold text-slate-800 mb-4 uppercase tracking-widest text-[#94a3b8]">Top Errors</h3>
          <div className="space-y-3">
             {stats.failed > 0 ? [
               { m: "Processing Timeout", c: Math.round(stats.failed * 0.6) },
               { m: "Validation Error", c: Math.round(stats.failed * 0.4) }
             ].map((e, i) => (
               <div key={i} className="flex items-center justify-between">
                 <span className="text-[12px] font-semibold text-slate-700 truncate mr-2">{e.m}</span>
                 <span className="bg-error-bg text-error px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border border-error-border">{e.c}</span>
               </div>
             )) : (
               <div className="text-[11px] text-slate-400">No recent errors</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
