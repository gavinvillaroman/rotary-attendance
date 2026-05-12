import { createClient } from "@/lib/supabase/server";
import type { Event, EventWithCount } from "@/lib/types";
import { EventsTable } from "./events-table";

async function loadEvents(): Promise<EventWithCount[]> {
  const supabase = await createClient();
  const [evRes, attRes] = await Promise.all([
    supabase.from("events").select("*").order("event_date", { ascending: false }),
    supabase.from("attendance").select("event_id"),
  ]);
  if (evRes.error) throw evRes.error;
  if (attRes.error) throw attRes.error;

  const counts = new Map<string, number>();
  for (const a of attRes.data ?? []) {
    if (a.event_id) counts.set(a.event_id, (counts.get(a.event_id) ?? 0) + 1);
  }
  return (evRes.data as Event[]).map((ev) => ({
    ...ev,
    attendeeCount: counts.get(ev.id) ?? 0,
  }));
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
