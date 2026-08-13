"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AssistantPanel } from "./assistant-panel";
import { SomaeLogo } from "./logo";

/**
 * Dashboard shell — left sidebar, main workspace, persistent AI assistant.
 * The assistant panel steps aside for full-width tools (workflow editor).
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullWidth =
    pathname.includes("/workflows") || pathname.includes("/blocks");

  return (
    <div className="bg-somae-canvas h-screen w-full overflow-hidden">
      <div className="flex h-full gap-4 p-4">
        {/* Left sidebar */}
        <div className="hidden w-[248px] shrink-0 lg:block">
          <DashboardSidebar />
        </div>

        {/* Main workspace */}
        <main className="pretty-scroll min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Mobile top bar */}
          <div className="mb-4 flex items-center justify-between rounded-[20px] bg-white px-5 py-3 shadow-soft ring-1 ring-[#e9f0fb] lg:hidden">
            <SomaeLogo className="text-[18px] text-[#101c3d]" />
          </div>
          {children}
        </main>

        {/* Persistent AI assistant */}
        {!fullWidth && (
          <div className="hidden w-[320px] shrink-0 xl:block 2xl:w-[340px]">
            <AssistantPanel />
          </div>
        )}
      </div>
    </div>
  );
}
