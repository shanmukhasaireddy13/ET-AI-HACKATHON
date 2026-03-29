"use client";

import { useState, useEffect } from "react";
import { 
  Key, 
  Search, 
  HelpCircle, 
  Hash, 
  Mail, 
  Github, 
  FileText, 
  Layers, 
  CheckSquare, 
  Calendar, 
  Users, 
  Video, 
  Cloud,
  Database,
  Briefcase,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IntegrationCard, IntegrationStatus } from "@/components/integrations/integration-card";
import { JiraConfigDrawer } from "@/components/integrations/jira-config-drawer";
import { SlackConfigDrawer } from "@/components/integrations/slack-config-drawer";
import { EmailConfigDrawer } from "@/components/integrations/email-config-drawer";
import { NotionConfigDrawer } from "@/components/integrations/notion-config-drawer";
import { ConnectModal } from "@/components/integrations/connect-modal";
import { DisconnectAlert } from "@/components/integrations/disconnect-alert";
import { createClient } from "@/lib/supabase/client";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJiraOpen, setIsJiraOpen] = useState(false);
  const [isSlackOpen, setIsSlackOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isNotionOpen, setIsNotionOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const supabase = createClient();

  const fetchIntegrations = async () => {
    const { data, error } = await supabase.from('integrations').select('*');
    if (data) setIntegrations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnect = (name: string, icon: React.ReactNode) => {
    setSelectedIntegration({ name, icon });
    setIsConnectOpen(true);
  };

  const handleDisconnect = (name: string) => {
    const existing = integrations.find(i => i.name === name);
    setSelectedIntegration({ name, icon: null, id: existing?.id });
    setIsDisconnectOpen(true);
  };

  const confirmConnect = async () => {
    const { error } = await supabase.from('integrations').upsert({
      name: selectedIntegration.name,
      status: 'connected',
      last_sync: new Date().toISOString()
    }, { onConflict: 'name' });
    
    if (!error) fetchIntegrations();
    setIsConnectOpen(false);
  };

  const confirmDisconnect = async () => {
    const { error } = await supabase.from('integrations').update({
       status: 'available'
    }).eq('name', selectedIntegration.name);

    if (!error) fetchIntegrations();
    setIsDisconnectOpen(false);
  };

  const JiraIcon = <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue fill-current"><path d="M11.53 2c0 2.399 1.944 4.343 4.342 4.343h4.343V2h-8.685zm0 10.114c0 2.4 1.944 4.343 4.342 4.343h4.343v-4.343h-8.685zm-1.416-5.057c0 2.4-1.943 4.343-4.342 4.343H1.43V7.057h8.685zm0 10.114c0 2.4-1.943 4.343-4.342 4.343H1.43v-4.343h8.685z"/></svg>;
  const SlackIcon = <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#4A154B] fill-current"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.527 2.527 0 0 1 2.521 2.522v2.52h-2.521zM8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.958 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.52 2.52h-2.522v-2.52zM17.688 8.834a2.527 2.527 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.167 0a2.528 2.528 0 0 1 2.521 2.522v6.312zM15.167 18.958a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521 2.527 2.527 0 0 1-2.521-2.522v-2.52h2.521zM15.167 17.688a2.527 2.527 0 0 1-2.521-2.521 2.527 2.527 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.167a2.528 2.528 0 0 1-2.522 2.521h-6.312z"/></svg>;

  const connectedList = integrations.filter(i => i.status === 'connected');
  const availableOptions = [
    { name: "Jira", desc: "Task tracking, project management & issue sync", icon: JiraIcon },
    { name: "Slack", desc: "Team notifications, standups & agent chat", icon: SlackIcon },
    { name: "GitHub", desc: "Link tasks to pull requests and issues", icon: <Github className="w-6 h-6 text-slate-900" /> },
    { name: "Email/SMTP", desc: "Professional email summaries and task alerts", icon: <Mail className="w-6 h-6 text-blue" /> },
    { name: "Notion", desc: "Sync meeting summaries and decisions", icon: <FileText className="w-6 h-6 text-slate-900" /> },
    { name: "Linear", desc: "Create and sync high-performance issues", icon: <Layers className="w-6 h-6 text-blue" /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-dash-bg min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1100px] mx-auto px-8 py-7 space-y-10 pb-20">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
           <div>
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Integrations</h1>
              <p className="text-[13px] text-slate-500 mt-1">Connect your tools to automate task routing, notifications, and more</p>
           </div>
           <Button variant="outline" className="h-9 px-4 bg-white border-slate-200 text-slate-600 font-bold text-[13px] rounded-lg gap-2 hover:border-blue hover:text-blue transition-all active:scale-[0.98]">
              <Key className="w-3.5 h-3.5" />
              API Keys
           </Button>
        </div>

        {/* Section 1: Connected */}
        {connectedList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
                <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">Connected</h2>
                <Badge className="bg-green-light text-green border-green-border text-[11px] font-bold px-2 py-0.5 rounded-full border">{connectedList.length} connected</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedList.map(item => {
                  const base = availableOptions.find(o => o.name === item.name) || { icon: <Zap /> };
                  return (
                    <IntegrationCard 
                      key={item.id}
                      name={item.name}
                      description={item.description || "Active automation link"}
                      icon={base.icon}
                      status="connected"
                      lastSync={item.last_sync ? "Just now" : "Never"}
                      onConfigure={() => {
                        if (item.name === "Jira") setIsJiraOpen(true);
                        if (item.name === "Slack") setIsSlackOpen(true);
                        if (item.name === "Email/SMTP") setIsEmailOpen(true);
                        if (item.name === "Notion") setIsNotionOpen(true);
                      }}
                      onDisconnect={() => handleDisconnect(item.name)}
                    />
                  );
                })}
            </div>
          </div>
        )}

        {/* Section 2: Available */}
        <div className="space-y-4">
           <div className="flex items-end justify-between">
              <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">Available Integrations</h2>
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-blue transition-colors" />
                 <Input placeholder="Search integrations..." className="h-8.5 w-[260px] pl-9 bg-white border-slate-200 text-[12px] font-medium rounded-lg" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableOptions.filter(o => !connectedList.find(c => c.name === o.name)).map((item, i) => (
                <IntegrationCard 
                   key={i}
                   name={item.name}
                   description={item.desc || ""}
                   icon={item.icon}
                   status="available"
                   onConnect={() => {
                     if (item.name === "Notion") setIsNotionOpen(true);
                     else handleConnect(item.name, item.icon);
                   }}
                />
              ))}
           </div>
        </div>

        {/* Global UI Components */}
        <JiraConfigDrawer open={isJiraOpen} onOpenChange={setIsJiraOpen} />
        <SlackConfigDrawer open={isSlackOpen} onOpenChange={setIsSlackOpen} />
        <EmailConfigDrawer open={isEmailOpen} onOpenChange={setIsEmailOpen} />
        <NotionConfigDrawer open={isNotionOpen} onOpenChange={setIsNotionOpen} onSuccess={fetchIntegrations} />
        
        <ConnectModal 
          open={isConnectOpen} 
          onOpenChange={setIsConnectOpen} 
          integration={selectedIntegration}
          onSuccess={confirmConnect}
        />

        <DisconnectAlert 
          open={isDisconnectOpen}
          onOpenChange={setIsDisconnectOpen}
          integrationName={selectedIntegration?.name}
          onConfirm={confirmDisconnect}
        />
      </div>
    </div>
  );
}
