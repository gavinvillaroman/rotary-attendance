import { airtableListAll } from "@/lib/airtable";
import { ATTENDANCE_FIELDS, EVENT_FIELDS, TABLES } from "@/lib/fields";
import {
  parseAttendance,
  parseEvent,
  parseMember,
  type Event,
  type Member,
} from "@/lib/types";

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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : null;

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
    for (const r of evRecs) {
      const ev = parseEvent(r);
      eventMap.set(ev.id, ev);
    }
    const memberMap = new Map<string, Member>();
    for (const r of memRecs) {
      const m = parseMember(r);
      memberMap.set(m.id, m);
    }

    let rows: AttendanceLogRow[] = attRecs.map((r) => {
      const a = parseAttendance(r);
      const ev = a.eventId ? eventMap.get(a.eventId) : null;
      const member = a.memberId ? memberMap.get(a.memberId) : null;
      const attendeeName = member
        ? member.name
        : a.guestName ?? "Unknown";
      return {
        id: a.id,
        checkedInAt: a.checkedInAt,
        attendeeName,
        isGuest: !member,
        memberId: a.memberId,
        eventId: a.eventId,
        eventName: ev?.name ?? "(deleted event)",
        eventDate: ev?.date ?? "",
        eventType: ev?.type ?? null,
      };
    });

    // sort by checkedInAt desc (some may be null)
    rows.sort((a, b) => {
      const ax = a.checkedInAt ?? "";
      const bx = b.checkedInAt ?? "";
      return bx.localeCompare(ax);
    });

    if (limit) rows = rows.slice(0, limit);

    return Response.json({ attendance: rows });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
