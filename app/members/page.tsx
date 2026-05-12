import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";
import { MembersTable } from "./members-table";

export type MemberWithCount = Member & { attendanceCount: number };

export default async function MembersPage() {
  let members: MemberWithCount[] = [];
  let error: string | null = null;
  try {
    const supabase = await createClient();
    const [memRes, attRes] = await Promise.all([
      supabase.from("members").select("*").order("name", { ascending: true }),
      supabase.from("attendance").select("member_id"),
    ]);
    if (memRes.error) throw memRes.error;
    if (attRes.error) throw attRes.error;
    const counts = new Map<string, number>();
    for (const a of attRes.data ?? []) {
      if (a.member_id)
        counts.set(a.member_id, (counts.get(a.member_id) ?? 0) + 1);
    }
    members = (memRes.data as Member[]).map((m) => ({
      ...m,
      attendanceCount: counts.get(m.id) ?? 0,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return <MembersTable members={members} error={error} />;
}
