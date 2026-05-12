import { createClient } from "@/lib/supabase/server";
import { AttendanceLogTable } from "./attendance-table";

export type AttendanceLogRow = {
  id: string;
  checkedInAt: string | null;
  attendeeName: string;
  isGuest: boolean;
  memberId: string | null;
  eventId: string | null;
  eventName: string;
  eventDate: string;
  eventType: string | null;
};

async function loadLog(): Promise<AttendanceLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .select(
      "id, member_id, event_id, guest_name, checked_in_at, member:members(name), event:events(name, event_date, type)",
    )
    .order("checked_in_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((r) => {
    const member = r.member as { name?: string } | null;
    const event = r.event as {
      name?: string;
      event_date?: string;
      type?: string | null;
    } | null;
    return {
      id: r.id as string,
      checkedInAt: r.checked_in_at as string | null,
      attendeeName: member?.name ?? r.guest_name ?? "Unknown",
      isGuest: !member,
      memberId: r.member_id ?? null,
      eventId: r.event_id ?? null,
      eventName: event?.name ?? "(deleted event)",
      eventDate: event?.event_date ?? "",
      eventType: event?.type ?? null,
    };
  });
}

export default async function AttendancePage() {
  let rows: AttendanceLogRow[] = [];
  let error: string | null = null;
  try {
    rows = await loadLog();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return <AttendanceLogTable rows={rows} error={error} />;
}
