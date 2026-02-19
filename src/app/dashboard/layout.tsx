"use client";

import { useState } from "react";
import { Sidebar, MobileMenuButton } from "@/components/Sidebar";
import { DashboardProvider } from "@/components/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#09090b] flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main area — pushed right of the fixed sidebar on desktop */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* Mobile top bar */}
          <header className="md:hidden nav-blur sticky top-0 z-30 border-b border-white/5 px-4 py-3 flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white font-display">LocalRank</span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
