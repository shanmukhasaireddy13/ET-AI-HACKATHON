"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SettingsNav, SettingsSection } from "@/components/settings/settings-nav";
import { UnsavedChangesBar } from "@/components/settings/unsaved-changes-bar";
import { ProfilePanel } from "@/components/settings/profile-panel";
import { PreferencesPanel } from "@/components/settings/preferences-panel";
import { WorkspacePanel } from "@/components/settings/workspace-panel";
import { TeamPanel } from "@/components/settings/team-panel";
import { NotificationsPanel } from "@/components/settings/notifications-panel";
import { AgentDefaultsPanel } from "@/components/settings/agent-defaults-panel";
import { SecurityPanel } from "@/components/settings/security-panel";
import { BillingPanel } from "@/components/settings/billing-panel";
import { APIKeysPanel } from "@/components/settings/api-keys-panel";
import { cn } from "@/lib/utils";

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as SettingsSection) || "profile";
  
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dirtySections, setDirtySections] = useState<SettingsSection[]>([]);

  // Sync section with URL changes
  useEffect(() => {
    const section = searchParams.get("section") as SettingsSection;
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams, activeSection]);

  // Simulate change detection
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("role") === "switch") {
         setIsDirty(true);
         if (!dirtySections.includes(activeSection)) {
            setDirtySections(prev => [...prev, activeSection]);
         }
      }
    };

    window.addEventListener("change", handleInput);
    return () => window.removeEventListener("change", handleInput);
  }, [activeSection, dirtySections]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDirty(false);
      setDirtySections([]);
    }, 1500);
  };

  const handleDiscard = () => {
    setIsDirty(false);
    setDirtySections([]);
    // In a real app, we'd reset the form state here
  };

  const renderPanel = () => {
    switch (activeSection) {
      case "profile": return <ProfilePanel />;
      case "preferences": return <PreferencesPanel />;
      case "general": return <WorkspacePanel />;
      case "team": return <TeamPanel />;
      case "notifications": return <NotificationsPanel />;
      case "agents": return <AgentDefaultsPanel />;
      case "security": return <SecurityPanel />;
      case "billing": return <BillingPanel />;
      case "api": return <APIKeysPanel />;
      default: return <ProfilePanel />;
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg pb-20">
      <div className="max-w-[1100px] mx-auto px-8 py-7">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-[13px] text-slate-500 mt-0.5 font-medium">Manage your account, workspace, and preferences.</p>
        </div>

        {/* Main Settings Layout */}
        <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
          {/* Left Nav */}
          <SettingsNav 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
            dirtySections={dirtySections}
          />

          {/* Right Content Panel */}
          <main className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             {renderPanel()}
          </main>
        </div>
      </div>

      {/* Unsaved Changes Bar */}
      <UnsavedChangesBar 
        isVisible={isDirty} 
        onSave={handleSave} 
        onDiscard={handleDiscard}
        isLoading={isLoading}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
       <div className="flex justify-center p-20">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
       </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
