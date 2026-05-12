import { airtableListAll } from "@/lib/airtable";
import { MEMBER_FIELDS, TABLES } from "@/lib/fields";
import { parseMember } from "@/lib/types";

export async function GET() {
  try {
    const records = await airtableListAll(TABLES.Members, {
      "sort[0][field]": MEMBER_FIELDS.Name,
      "sort[0][direction]": "asc",
    });
    const members = records.map(parseMember);
    return Response.json({ members });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
