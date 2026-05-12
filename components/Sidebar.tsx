"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (p: string) => boolean;
};

const items: Item[] = [
  {
    href: "/",
    label: "Dashboard",
    match: (p) => p === "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12l9-8 9 8M5 10v10h14V10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "Events",
    match: (p) => p === "/events" || p.startsWith("/events/"),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect
          x="3.5"
          y="5"
          width="17"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 9.5h17M8 3v4M16 3v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/members",
    label: "Members",
    match: (p) => p.startsWith("/members"),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle
          cx="9"
          cy="9"
          r="3.2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 19c.7-3 3-4.5 5.5-4.5s4.8 1.5 5.5 4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="17"
          cy="8"
          r="2.6"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M15.5 14.5c2.2 0 3.9 1.3 4.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/attendance",
    label: "Attendance",
    match: (p) => p.startsWith("/attendance"),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8 12l2.5 2.5L16 9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-[var(--border)] bg-[var(--surface)] md:sticky md:top-0">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <div
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full bg-[#17458F]"
        >
          <img src="/icon.svg" alt="" width={22} height={22} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold leading-tight">
            RC Cabanatuan North
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Rotary Club
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((it) => {
            const active = it.match(pathname);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={onNavigate}
                  className={
                    "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors " +
                    (active
                      ? "text-[var(--primary)]"
                      : "text-[var(--text)] hover:bg-[#f0f0f3]")
                  }
                  style={
                    active
                      ? { background: "rgba(0,113,227,0.08)" }
                      : undefined
                  }
                >
                  <span className="text-current opacity-90">{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-4 pt-3">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:bg-[#f0f0f3] hover:text-[var(--text)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Sign out</span>
          </button>
        </form>
        <div className="mt-3 px-3 text-[11px] text-[var(--text-muted)]">
          Rotary Attendance
        </div>
      </div>
    </aside>
  );
}
