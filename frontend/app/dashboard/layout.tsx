"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dash-bg font-sans">
      <Header />
      <Sidebar />
      <main className="ml-[240px] pt-16 min-h-[calc(100vh-64px)]">
        <div className="max-w-[1280px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
