export const dynamic = "force-dynamic";

import { airtableListAll } from "@/lib/airtable";
import { EVENT_FIELDS, TABLES } from "@/lib/fields";
import { parseAttendance, parseEvent } from "@/lib/types";
import type { EventWithCount } from "@/lib/types";
import { EventsTable } from "./events-table";

async function loadEvents(): Promise<EventWithCount[]> {
  const [eventRecs, attendanceRecs] = await Promise.all([
    airtableListAll(TABLES.Events, {
      "sort[0][field]": EVENT_FIELDS.Date,
      "sort[0][direction]": "desc",
    }),
    airtableListAll(TABLES.Attendance),
  ]);
  const counts = new Map<string, number>();
  for (const rec of attendanceRecs) {
    const a = parseAttendance(rec);
    if (a.eventId) counts.set(a.eventId, (counts.get(a.eventId) ?? 0) + 1);
  }
  return eventRecs.map((r) => {
    const ev = parseEvent(r);
    return { ...ev, attendeeCount: counts.get(ev.id) ?? 0 };
  });
}

export default async function EventsPage() {
  let events: EventWithCount[] = [];
  let error: string | null = null;
  try {
    events = await loadEvents();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return <EventsTable events={events} error={error} />;
}
