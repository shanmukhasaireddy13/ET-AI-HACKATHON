"use client";

import { RefreshCw, Settings, Zap, Unplug, Link as LinkIcon, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type IntegrationStatus = "connected" | "available" | "coming_soon" | "degraded" | "error";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: IntegrationStatus;
  lastSync?: string;
  stats?: { label: string; value: string }[];
  tags?: string[];
  onConfigure?: () => void;
  onConnect?: () => void;
  onTest?: () => void;
  onDisconnect?: () => void;
}

export function IntegrationCard({
  name,
  description,
  icon,
  status,
  lastSync,
  stats,
  tags,
  onConfigure,
  onConnect,
  onTest,
  onDisconnect
}: IntegrationCardProps) {
  const isConnected = status === "connected" || status === "degraded" || status === "error";
  const isComingSoon = status === "coming_soon";
  const isAvailable = status === "available";

  return (
    <div 
      className={cn(
        "bg-white border rounded-xl overflow-hidden transition-all duration-300 group",
        isConnected ? "border-slate-200 border-t-[3px] border-t-green shadow-sm hover:shadow-md" : 
        isAvailable ? "border-slate-200 border-t-[3px] border-t-slate-200 hover:border-t-blue shadow-sm hover:shadow-md" :
        "border-slate-100 opacity-60 cursor-not-allowed"
      )}
    >
      <div className="p-5">
        {/* Top Row: Logo + Status */}
        <div className="flex items-start justify-between">
          <div className="w-[42px] h-[42px] rounded-lg border border-slate-200 bg-white flex items-center justify-center shadow-sm group-hover:border-blue/30 transition-colors">
            {icon}
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border",
              status === "connected" ? "bg-green-light text-green border-green-border" :
              status === "degraded" ? "bg-orange-light text-orange border-orange-200" :
              status === "error" ? "bg-error-bg text-error border-error-border" :
              status === "coming_soon" ? "bg-slate-50 text-slate-400 border-slate-200" :
              "bg-slate-50 text-slate-500 border-slate-200"
            )}
          >
            {isConnected && <div className={cn("w-1.5 h-1.5 rounded-full", status === "connected" ? "bg-green" : status === "degraded" ? "bg-orange" : "bg-error")} />}
            {status === "connected" ? "Connected" : 
             status === "degraded" ? "Degraded" : 
             status === "error" ? "Error" :
             status === "coming_soon" ? "Coming Soon" : "Not connected"}
          </Badge>
        </div>

        {/* Info */}
        <div className="mt-3.5">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{name}</h3>
          <p className={cn(
            "text-[12px] text-slate-500 mt-1 leading-relaxed",
            isAvailable ? "line-clamp-2" : "truncate"
          )}>
            {description}
          </p>
        </div>

        {/* Connected Specifics */}
        {isConnected && (
          <div className="mt-3.5 space-y-3">
            <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
              <span>{lastSync ? `Synced ${lastSync}` : "Never synced"}</span>
            </div>
            
            {stats && (
              <div className="flex gap-5">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 font-mono tracking-tight">{stat.value}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Specifics */}
        {isAvailable && tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {!isComingSoon && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            {isConnected ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={onConfigure}
                  className="h-9 flex-1 bg-slate-50 border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg hover:border-blue hover:text-blue hover:bg-white transition-all gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configure
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onTest}
                  className="h-9 flex-1 border-slate-200 text-slate-700 font-bold text-[12px] rounded-lg hover:border-blue hover:text-blue hover:bg-white transition-all gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Test
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button 
                        variant="outline" 
                        onClick={onDisconnect}
                        className="h-9 w-9 p-0 border-slate-200 text-slate-400 rounded-lg hover:bg-error-bg hover:border-error-border hover:text-error transition-all"
                      >
                        <Unplug className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-0 text-[11px] font-bold">
                      Disconnect
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <Button 
                onClick={onConnect}
                className="h-[38px] w-full bg-blue hover:bg-blue-hover text-white font-bold text-[13px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Connect {name}
              </Button>
            )}
          </div>
        )}

        {isComingSoon && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-400">Coming Soon</span>
            <button className="text-[12px] font-bold text-blue hover:underline">Notify me</button>
          </div>
        )}
      </div>
    </div>
  );
}
