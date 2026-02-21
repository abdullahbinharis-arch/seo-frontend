"use client";

import { useState } from "react";
import { Sidebar, MobileMenuButton } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { DashboardProvider } from "@/components/DashboardContext";
import { Logo } from "@/components/brand/Logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#09090b] flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main area — pushed right of the fixed sidebar on desktop */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* Desktop top bar */}
          <TopBar />

          {/* Mobile top bar */}
          <header className="md:hidden nav-blur sticky top-0 z-30 border-b border-white/6 px-4 py-3 flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <Logo size="sidebar" animated={false} />
          </header>

          {/* Page content */}
          <main className="flex-1 px-6 py-6 max-w-[1200px] w-full">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
