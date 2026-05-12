import { revalidateTag } from "next/cache";
import { airtable, airtableListAll } from "@/lib/airtable";
import { ATTENDANCE_FIELDS, EVENT_FIELDS, TABLES } from "@/lib/fields";
import { parseAttendance, parseEvent } from "@/lib/types";

export async function GET() {
  try {
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
    const events = eventRecs.map((r) => {
      const ev = parseEvent(r);
      return { ...ev, attendeeCount: counts.get(ev.id) ?? 0 };
    });
    return Response.json({ events });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      date?: string;
      type?: string;
      location?: string;
    };
    if (!body.name || !body.date) {
      return Response.json(
        { error: "name and date are required" },
        { status: 400 },
      );
    }
    const fields: Record<string, unknown> = {
      [EVENT_FIELDS.Name]: body.name,
      [EVENT_FIELDS.Date]: body.date,
    };
    if (body.type) fields[EVENT_FIELDS.Type] = body.type;
    if (body.location) fields[EVENT_FIELDS.Location] = body.location;

    const created = await airtable<{ id: string; fields: Record<string, unknown> }>(
      TABLES.Events,
      "?returnFieldsByFieldId=true&typecast=true",
      {
        method: "POST",
        body: JSON.stringify({ fields }),
      },
    );
    const event = parseEvent({
      id: created.id,
      createdTime: "",
      fields: created.fields,
    });
    revalidateTag("airtable", "max");
    return Response.json({ event });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
