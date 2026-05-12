import Link from "next/link";
import { airtable } from "@/lib/airtable";
import { TABLES } from "@/lib/fields";
import { parseEvent } from "@/lib/types";
import type { Event } from "@/lib/types";
import { CheckInPanel } from "./check-in-panel";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event: Event | null = null;
  let error: string | null = null;
  try {
    const rec = await airtable<{
      id: string;
      fields: Record<string, unknown>;
    }>(TABLES.Events, `/${id}?returnFieldsByFieldId=true`);
    event = parseEvent({ id: rec.id, createdTime: "", fields: rec.fields });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !event) {
    return (
      <div>
        <Link href="/" className="text-sm text-[var(--primary)]">
          ← Back
        </Link>
        <div className="card mt-4 p-4 text-sm text-red-600">
          {error ?? "Event not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-medium text-[var(--primary)]"
      >
        ← Events
      </Link>
      <header className="mb-6">
        {event.type && (
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {event.type}
          </div>
        )}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">
          {event.name}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--text-muted)]">
          {formatDate(event.date)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </header>

      <CheckInPanel eventId={event.id} eventName={event.name} />
    </div>
  );
}
