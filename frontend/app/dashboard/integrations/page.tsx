"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchIntegrations, initiateJiraOAuth, disconnectJira } from "@/lib/api";
import { useSearchParams } from "next/navigation";

interface Integration {
  service: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  details: any;
  oauth_available?: boolean;
  coming_soon?: boolean;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState("");
  const searchParams = useSearchParams();

  const connectedParam = searchParams.get("connected");
  const errorParam = searchParams.get("error");

  const loadIntegrations = useCallback(async () => {
    try {
      const data = await fetchIntegrations();
      setIntegrations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

  const handleConnect = async (service: string) => {
    setConnecting(service);
    try {
      if (service === "jira") {
        const data = await initiateJiraOAuth();
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      console.error(err);
      setConnecting("");
    }
  };

  const handleDisconnect = async (service: string) => {
    try {
      if (service === "jira") await disconnectJira();
      loadIntegrations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-neutral-400 mt-1">Connect your tools to enable autonomous agent actions.</p>
      </div>

      {/* Success / Error banners */}
      {connectedParam && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Successfully connected {connectedParam}!
        </div>
      )}
      {errorParam && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Connection failed: {errorParam.replace(/_/g, " ")}
        </div>
      )}

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))
        ) : (
          integrations.map((int) => (
            <div key={int.service} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <h3 className="font-semibold">{int.name}</h3>
                    <p className="text-xs text-neutral-500">{int.description}</p>
                  </div>
                </div>
                {int.connected && (
                  <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    Connected
                  </span>
                )}
              </div>

              {int.connected ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs">
                    <p className="text-neutral-400">Connected as <span className="text-white font-medium">{int.details?.display_name || int.details?.email || "User"}</span></p>
                    {int.details?.site_name && <p className="text-neutral-500 mt-1">Site: {int.details.site_name}</p>}
                  </div>
                  <button
                    onClick={() => handleDisconnect(int.service)}
                    className="w-full py-2 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : int.coming_soon ? (
                <div className="mt-4 py-2 text-center rounded-xl bg-white/5 text-neutral-500 text-sm">
                  Coming Soon
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(int.service)}
                  disabled={connecting === int.service}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-pink-600 text-white disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  {connecting === int.service ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
                  ) : (
                    `Connect ${int.name}`
                  )}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
