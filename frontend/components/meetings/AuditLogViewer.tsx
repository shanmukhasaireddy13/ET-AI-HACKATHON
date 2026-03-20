"use client";

interface AuditLog {
  timestamp: string;
  agent: string;
  action: string;
  details: any;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
  loading: boolean;
}

export default function AuditLogViewer({ logs, loading }: AuditLogViewerProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="flex gap-4">
               <div className="w-2 h-full bg-white/5 rounded-full"></div>
               <div className="h-20 flex-1 bg-white/5 rounded-lg"></div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
        <p>No agent activity logs available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      {logs.map((log, index) => {
        const isLatest = index === logs.length - 1;
        return (
          <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-4">
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
              {isLatest ? (
                 <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.8)] animate-pulse"></div>
              ) : (
                 <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              )}
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel p-4 rounded-xl transition-all hover:bg-white/[0.04]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-primary drop-shadow-sm">{log.agent || "System"}</span>
                <span className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-2">{log.action}</p>
              
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="bg-black/40 rounded-lg p-3 overflow-x-auto text-[11px] font-mono text-muted-foreground border border-white/5">
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
