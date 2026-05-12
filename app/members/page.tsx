export const dynamic = "force-dynamic";

import { airtableListAll } from "@/lib/airtable";
import { MEMBER_FIELDS, TABLES } from "@/lib/fields";
import { parseAttendance, parseMember } from "@/lib/types";
import type { Member } from "@/lib/types";
import { MembersTable } from "./members-table";

export type MemberWithCount = Member & { attendanceCount: number };

export default async function MembersPage() {
  let members: MemberWithCount[] = [];
  let error: string | null = null;
  try {
    const [memRecs, attRecs] = await Promise.all([
      airtableListAll(TABLES.Members, {
        "sort[0][field]": MEMBER_FIELDS.Name,
        "sort[0][direction]": "asc",
      }),
      airtableListAll(TABLES.Attendance),
    ]);
    const counts = new Map<string, number>();
    for (const r of attRecs) {
      const a = parseAttendance(r);
      if (a.memberId)
        counts.set(a.memberId, (counts.get(a.memberId) ?? 0) + 1);
    }
    members = memRecs.map(parseMember).map((m) => ({
      ...m,
      attendanceCount: counts.get(m.id) ?? 0,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return <MembersTable members={members} error={error} />;
}
