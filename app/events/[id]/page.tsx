import Link from "next/link";
import { airtable } from "@/lib/airtable";
import { TABLES } from "@/lib/fields";
import { parseEvent } from "@/lib/types";
import type { Event } from "@/lib/types";
import { TypeBadge } from "@/components/TypeBadge";
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
        <Link href="/events" className="text-sm text-[var(--primary)]">
          ← Back to events
        </Link>
        <div className="card mt-4 p-4 text-sm text-red-600">
          {error ?? "Event not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px]">
      <Link
        href="/events"
        className="mb-4 inline-block text-sm font-medium text-[var(--primary)]"
      >
        ← Events
      </Link>

      <header className="card mb-6 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <TypeBadge type={event.type} />
            </div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
              {event.name}
            </h1>
            <p className="mt-1 text-[14px] text-[var(--text-muted)]">
              {formatDate(event.date)}
              {event.location ? ` · ${event.location}` : ""}
            </p>
          </div>
        </div>
      </header>

      <CheckInPanel eventId={event.id} eventName={event.name} />
    </div>
  );
}
