import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, CheckCircle2, AlertCircle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ActivityLogTab({ logs = [] }: { logs?: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button className="px-3 py-1 text-[12px] font-bold bg-white text-blue border border-blue/10 shadow-sm rounded-md">All</button>
          <button className="px-3 py-1 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">Info</button>
          <button className="px-3 py-1 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">Warning</button>
          <button className="px-3 py-1 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">Error</button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-200 text-slate-500 gap-1.5 px-3 py-1.5 text-[12px] bg-white">
            <Clock className="w-3.5 h-3.5" /> Mar 21, 2026 - Today
          </Badge>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 h-10">
              <th className="w-10"></th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2 w-24">Level</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-40">Timestamp</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-24">Duration</th>
              <th className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pr-6 text-right w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className={cn(
                    "group h-12 hover:bg-slate-50/50 cursor-pointer border-b border-slate-50 transition-colors",
                    expandedId === log.id && "bg-slate-50/50 border-slate-200"
                  )}
                >
                  <td className="text-center pl-4">
                    {expandedId === log.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </td>
                  <td className="pl-2">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border",
                      log.level === "Success" ? "bg-success-bg text-success border-success-border" :
                      log.level === "Warning" ? "bg-warning-bg text-warning border-warning-border" :
                      log.level === "Error" ? "bg-error-bg text-error border-error-border" :
                      "bg-blue-light text-blue border-blue-mid"
                    )}>
                      {log.level === "Success" ? <CheckCircle2 className="w-2.5 h-2.5" /> :
                       log.level === "Warning" ? <AlertCircle className="w-2.5 h-2.5" /> :
                       log.level === "Error" ? <AlertCircle className="w-2.5 h-2.5" /> :
                       <Info className="w-2.5 h-2.5" />}
                      {log.level}
                    </div>
                  </td>
                  <td className="text-[12px] font-mono text-slate-500">{log.timestamp}</td>
                  <td className="text-[13px] text-slate-700 truncate pr-4 max-w-[300px]">{log.action}</td>
                  <td className="text-[12px] font-mono text-slate-500">{log.duration}</td>
                  <td className="text-right pr-6">
                    <span className={cn(
                      "text-[12px] font-bold",
                      log.status === "Complete" ? "text-success" : 
                      log.status === "Failed" ? "text-error" : "text-warning"
                    )}>{log.status}</span>
                  </td>
                </tr>
                {expandedId === log.id && (
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                    <td colSpan={6} className="p-5 pl-14 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Input Context</label>
                          <div className="relative group/code">
                            <pre className="p-3 bg-white border border-slate-200 rounded-lg text-[12px] font-mono text-slate-600 overflow-x-auto">
                              {log.input}
                            </pre>
                            <button className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-blue-light text-slate-400 hover:text-blue rounded border border-slate-200 opacity-0 group-hover/code:opacity-100 transition-all shadow-sm">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Agent Output</label>
                          <div className="relative group/code">
                            <pre className="p-3 bg-white border border-slate-200 rounded-lg text-[12px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap">
                              {log.output}
                            </pre>
                            <button className="absolute top-2 right-2 p-1.5 bg-slate-50 hover:bg-blue-light text-slate-400 hover:text-blue rounded border border-slate-200 opacity-0 group-hover/code:opacity-100 transition-all shadow-sm">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-400 text-sm">
                  No activity logs found for this agent.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white shadow-sm rounded-b-xl">
          <span className="text-[12px] text-slate-400 font-medium tracking-tight">Showing last 4 logs</span>
          <div className="flex items-center gap-1">
             <button className="w-7 h-7 flex items-center justify-center rounded bg-blue text-white font-bold shadow-sm">1</button>
             <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 font-medium text-slate-500">2</button>
             <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 font-medium text-slate-500 transition-colors">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
