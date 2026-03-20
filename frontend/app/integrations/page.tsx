"use client";

import { useEffect, useState, useCallback } from "react";

const API_BASE = "http://localhost:3001";

interface Integration {
  service: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  coming_soon?: boolean;
  details?: {
    base_url?: string;
    email?: string;
    project_key?: string;
    connected_at?: string;
  };
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [jiraForm, setJiraForm] = useState({
    base_url: "",
    email: "",
    api_token: "",
    project_key: "AE",
  });
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/integrations`);
      if (res.ok) {
        const json = await res.json();
        setIntegrations(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch integrations", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/integrations/jira/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jiraForm),
      });
      const json = await res.json();
      setTestResult(json.data || json);
    } catch (err) {
      setError("Failed to test connection. Check your network.");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/integrations/jira`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jiraForm),
      });
      if (res.ok) {
        setShowJiraModal(false);
        setJiraForm({ base_url: "", email: "", api_token: "", project_key: "AE" });
        setTestResult(null);
        await fetchIntegrations();
      } else {
        const data = await res.json();
        setError(data.detail || data.error || "Connection failed");
      }
    } catch (err) {
      setError("Failed to connect. Check your credentials.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (service: string) => {
    try {
      await fetch(`${API_BASE}/api/integrations/${service}`, { method: "DELETE" });
      await fetchIntegrations();
    } catch (err) {
      console.error("Disconnect failed", err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3 flex items-center gap-3">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Integrations
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Connect your enterprise tools to let SIDD's agents create tickets, send notifications, and schedule events on your behalf.
        </p>
      </div>

      {/* Integration Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-56 glass-panel rounded-2xl opacity-50"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {integrations.map(integration => (
            <div
              key={integration.service}
              className={`glass-card rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group ${
                integration.connected ? "border-emerald-500/20" : ""
              }`}
            >
              {/* Glow effect for connected */}
              {integration.connected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -z-10"></div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{integration.name}</h3>
                    {integration.connected && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Connected
                      </span>
                    )}
                  </div>
                </div>
                {integration.coming_soon && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-white/5 text-muted-foreground px-2 py-1 rounded-full border border-white/10">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {integration.description}
              </p>

              {/* Connected details */}
              {integration.connected && integration.details && (
                <div className="bg-black/40 rounded-xl p-3 mb-4 border border-white/5 space-y-1.5">
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span className="opacity-60">URL:</span>
                    <span className="text-foreground/70 font-mono truncate">{integration.details.base_url}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span className="opacity-60">Email:</span>
                    <span className="text-foreground/70 font-mono">{integration.details.email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span className="opacity-60">Project:</span>
                    <span className="text-foreground/70 font-mono">{integration.details.project_key}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {integration.coming_soon ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-medium bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed"
                >
                  Not Available Yet
                </button>
              ) : integration.connected ? (
                <button
                  onClick={() => handleDisconnect(integration.service)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (integration.service === "jira") setShowJiraModal(true);
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.1)] hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                >
                  Connect {integration.name}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jira Connect Modal */}
      {showJiraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-3xl p-8 w-full max-w-lg mx-4 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => { setShowJiraModal(false); setTestResult(null); setError(""); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🎫</span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Connect Jira Cloud</h2>
                <p className="text-sm text-muted-foreground">Enter your Atlassian credentials to connect</p>
              </div>
            </div>

            {/* Help text */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 text-sm text-blue-300">
              <p className="font-semibold mb-1">💡 How to get an API token:</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Go to <span className="font-mono text-blue-400">id.atlassian.com/manage-profile/security/api-tokens</span> → Create API Token → Copy it here.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Jira Base URL</label>
                <input
                  type="url"
                  placeholder="https://your-org.atlassian.net"
                  value={jiraForm.base_url}
                  onChange={e => setJiraForm(f => ({ ...f, base_url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 font-mono text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={jiraForm.email}
                  onChange={e => setJiraForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">API Token</label>
                <input
                  type="password"
                  placeholder="Your Jira API token"
                  value={jiraForm.api_token}
                  onChange={e => setJiraForm(f => ({ ...f, api_token: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm font-mono transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Project Key</label>
                <input
                  type="text"
                  placeholder="AE"
                  value={jiraForm.project_key}
                  onChange={e => setJiraForm(f => ({ ...f, project_key: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm font-mono uppercase transition-colors"
                />
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`rounded-xl p-4 mb-4 border text-sm ${
                testResult.status === "success"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
              }`}>
                {testResult.status === "success" ? (
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Connected as <strong>{testResult.user}</strong> ({testResult.email})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>❌</span>
                    <span>{testResult.error || "Connection failed"}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl p-4 mb-4 border bg-destructive/5 border-destructive/20 text-destructive text-sm">
                ❌ {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing || !jiraForm.base_url || !jiraForm.email || !jiraForm.api_token}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testing && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                Test Connection
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || !jiraForm.base_url || !jiraForm.email || !jiraForm.api_token}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                {connecting && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                Connect & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
