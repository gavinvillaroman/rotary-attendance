import Link from "next/link";
import type { EventWithCount } from "@/lib/types";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EventCard({ event }: { event: EventWithCount }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="card block px-4 py-4 transition-transform hover:-translate-y-0.5"
    >
      <div className="mb-2 flex items-center gap-2">
        {event.type && <span className="badge">{event.type}</span>}
        <span className="text-xs text-[var(--text-muted)]">
          {formatDate(event.date)}
        </span>
      </div>
      <h3 className="text-[17px] font-semibold leading-tight text-[var(--text)]">
        {event.name}
      </h3>
      <div className="mt-2 flex items-center justify-between text-[13px] text-[var(--text-muted)]">
        <span>{event.location || " "}</span>
        <span className="font-medium text-[var(--primary)]">
          {event.attendeeCount} {event.attendeeCount === 1 ? "attendee" : "attendees"}
        </span>
      </div>
    </Link>
  );
}
