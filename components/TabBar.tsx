"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Events", match: (p: string) => p === "/" || p.startsWith("/events") },
  { href: "/members", label: "Members", match: (p: string) => p.startsWith("/members") },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[640px] items-center justify-center gap-1 px-4 py-3">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-[var(--text)] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
