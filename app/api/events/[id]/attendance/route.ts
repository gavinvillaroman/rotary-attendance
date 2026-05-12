import { revalidateTag } from "next/cache";
import { airtable, airtableListAll } from "@/lib/airtable";
import { ATTENDANCE_FIELDS, TABLES } from "@/lib/fields";
import {
  parseAttendance,
  parseEvent,
  parseMember,
  type AttendanceWithMember,
} from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // ARRAYJOIN on a linked-record field returns primary-field values, not
    // record IDs, so filtering by linked record ID via formula is not possible.
    // Fetch all and filter in code — fine for prototype scale.
    const attRecs = await airtableListAll(TABLES.Attendance, {
      "sort[0][field]": ATTENDANCE_FIELDS.CheckedInAt,
      "sort[0][direction]": "desc",
    });
    const attendance = attRecs
      .map(parseAttendance)
      .filter((a) => a.eventId === id);

    // Look up members in a single pass.
    const memberIds = Array.from(
      new Set(attendance.map((a) => a.memberId).filter(Boolean) as string[]),
    );
    const memberMap = new Map<string, ReturnType<typeof parseMember>>();
    if (memberIds.length > 0) {
      const orClause = memberIds
        .map((mid) => `RECORD_ID()='${mid}'`)
        .join(",");
      const memRecs = await airtableListAll(TABLES.Members, {
        filterByFormula: `OR(${orClause})`,
      });
      for (const r of memRecs) {
        const m = parseMember(r);
        memberMap.set(m.id, m);
      }
    }

    const result: AttendanceWithMember[] = attendance.map((a) => ({
      ...a,
      member: a.memberId ? memberMap.get(a.memberId) ?? null : null,
    }));
    return Response.json({ attendance: result });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      memberId?: string;
      guestName?: string;
    };
    if (!body.memberId && !body.guestName) {
      return Response.json(
        { error: "memberId or guestName required" },
        { status: 400 },
      );
    }

    // Fetch event name for primary field
    const evRec = await airtable<{
      id: string;
      fields: Record<string, unknown>;
    }>(TABLES.Events, `/${id}?returnFieldsByFieldId=true`);
    const event = parseEvent({
      id: evRec.id,
      createdTime: "",
      fields: evRec.fields,
    });

    let attendeeLabel = body.guestName ?? "";
    if (body.memberId) {
      const memRec = await airtable<{
        id: string;
        fields: Record<string, unknown>;
      }>(TABLES.Members, `/${body.memberId}?returnFieldsByFieldId=true`);
      const m = parseMember({
        id: memRec.id,
        createdTime: "",
        fields: memRec.fields,
      });
      attendeeLabel = m.name;
    }

    const fields: Record<string, unknown> = {
      [ATTENDANCE_FIELDS.CheckIn]: `${event.name} · ${attendeeLabel}`,
      [ATTENDANCE_FIELDS.Event]: [id],
      [ATTENDANCE_FIELDS.CheckedInAt]: new Date().toISOString(),
    };
    if (body.memberId) fields[ATTENDANCE_FIELDS.Member] = [body.memberId];
    if (body.guestName) fields[ATTENDANCE_FIELDS.GuestName] = body.guestName;

    const created = await airtable<{
      id: string;
      fields: Record<string, unknown>;
    }>(TABLES.Attendance, "?returnFieldsByFieldId=true", {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
    const attendance = parseAttendance({
      id: created.id,
      createdTime: "",
      fields: created.fields,
    });
    revalidateTag("airtable", "max");
    return Response.json({ attendance });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
