export const dynamic = "force-dynamic";

import { airtableListAll } from "@/lib/airtable";
import {
  ATTENDANCE_FIELDS,
  EVENT_FIELDS,
  TABLES,
} from "@/lib/fields";
import {
  parseAttendance,
  parseEvent,
  parseMember,
  type Event,
  type Member,
} from "@/lib/types";
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
  const [attRecs, evRecs, memRecs] = await Promise.all([
    airtableListAll(TABLES.Attendance, {
      "sort[0][field]": ATTENDANCE_FIELDS.CheckedInAt,
      "sort[0][direction]": "desc",
    }),
    airtableListAll(TABLES.Events, {
      "sort[0][field]": EVENT_FIELDS.Date,
      "sort[0][direction]": "desc",
    }),
    airtableListAll(TABLES.Members),
  ]);
  const eventMap = new Map<string, Event>();
  evRecs.forEach((r) => {
    const ev = parseEvent(r);
    eventMap.set(ev.id, ev);
  });
  const memberMap = new Map<string, Member>();
  memRecs.forEach((r) => {
    const m = parseMember(r);
    memberMap.set(m.id, m);
  });

  const rows: AttendanceLogRow[] = attRecs.map((r) => {
    const a = parseAttendance(r);
    const ev = a.eventId ? eventMap.get(a.eventId) : null;
    const member = a.memberId ? memberMap.get(a.memberId) : null;
    return {
      id: a.id,
      checkedInAt: a.checkedInAt,
      attendeeName: member ? member.name : a.guestName ?? "Unknown",
      isGuest: !member,
      memberId: a.memberId,
      eventId: a.eventId,
      eventName: ev?.name ?? "(deleted event)",
      eventDate: ev?.date ?? "",
      eventType: ev?.type ?? null,
    };
  });
  rows.sort((a, b) =>
    (b.checkedInAt ?? "").localeCompare(a.checkedInAt ?? ""),
  );
  return rows;
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
