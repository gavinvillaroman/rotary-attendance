"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/events": "Events",
  "/members": "Members",
  "/attendance": "Attendance",
};

function deriveTitle(pathname: string): string {
  if (pathname.startsWith("/events/")) return "Event";
  return TITLES[pathname] ?? "Rotary Attendance";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const title = deriveTitle(pathname);

  // Auth pages render without the app chrome.
  if (pathname.startsWith("/login") || pathname.startsWith("/auth/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar onNavigate={() => setDrawerOpen(false)} />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-[260px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-1.5 text-[var(--text)] hover:bg-[var(--border)]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="text-[15px] font-semibold">{title}</div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
