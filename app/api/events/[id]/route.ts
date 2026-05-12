import { airtable, airtableListAll } from "@/lib/airtable";
import { ATTENDANCE_FIELDS, TABLES } from "@/lib/fields";
import { parseAttendance, parseEvent } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rec = await airtable<{
      id: string;
      fields: Record<string, unknown>;
    }>(TABLES.Events, `/${id}?returnFieldsByFieldId=true`);
    const event = parseEvent({
      id: rec.id,
      createdTime: "",
      fields: rec.fields,
    });
    return Response.json({ event });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Find all attendance for this event and delete first (no cascade).
    const formula = `FIND('${id}', ARRAYJOIN({${ATTENDANCE_FIELDS.Event}}))`;
    const attRecs = await airtableListAll(TABLES.Attendance, {
      filterByFormula: formula,
    });
    const ids = attRecs.map((r) => parseAttendance(r).id);
    // Airtable delete supports up to 10 record IDs per request.
    for (let i = 0; i < ids.length; i += 10) {
      const chunk = ids.slice(i, i + 10);
      const qs = chunk.map((x) => `records[]=${encodeURIComponent(x)}`).join("&");
      await airtable(TABLES.Attendance, `?${qs}`, { method: "DELETE" });
    }
    await airtable(TABLES.Events, `/${id}`, { method: "DELETE" });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
