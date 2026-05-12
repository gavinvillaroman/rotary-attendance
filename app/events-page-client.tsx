"use client";

import { useState } from "react";
import { EventCard } from "@/components/EventCard";
import { NewEventModal } from "@/components/NewEventModal";
import type { EventWithCount } from "@/lib/types";

export function EventsPageClient({
  events,
  error,
}: {
  events: EventWithCount[];
  error: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight">Events</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + New Event
        </button>
      </header>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load events:</strong> {error}
        </div>
      )}

      {!error && events.length === 0 && (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="text-[15px] font-medium">No events yet</div>
          <p className="text-sm text-[var(--text-muted)]">
            Create your first event to start tracking attendance.
          </p>
          <button className="btn-primary mt-2" onClick={() => setOpen(true)}>
            + New Event
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>

      {open && <NewEventModal onClose={() => setOpen(false)} />}
    </>
  );
}
