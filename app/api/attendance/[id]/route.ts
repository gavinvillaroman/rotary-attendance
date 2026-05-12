import { airtable } from "@/lib/airtable";
import { TABLES } from "@/lib/fields";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await airtable(TABLES.Attendance, `/${id}`, { method: "DELETE" });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
