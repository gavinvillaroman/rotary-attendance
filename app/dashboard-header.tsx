"use client";

import { useState } from "react";
import { NewEventModal } from "@/components/NewEventModal";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-[14px] text-[var(--text-muted)]">
          Club overview · today at a glance
        </p>
      </div>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + New Event
      </button>
      {open && <NewEventModal onClose={() => setOpen(false)} />}
    </header>
  );
}
