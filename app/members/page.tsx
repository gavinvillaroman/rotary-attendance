export const dynamic = "force-dynamic";

import { airtableListAll } from "@/lib/airtable";
import { MEMBER_FIELDS, TABLES } from "@/lib/fields";
import { parseMember } from "@/lib/types";
import type { Member } from "@/lib/types";
import { Avatar } from "@/components/Avatar";

function statusClass(status: string | null): string {
  if (!status) return "badge badge-muted";
  if (status === "Active") return "badge badge-success";
  if (status === "Honorary") return "badge";
  return "badge badge-muted";
}

export default async function MembersPage() {
  let members: Member[] = [];
  let error: string | null = null;
  try {
    const recs = await airtableListAll(TABLES.Members, {
      "sort[0][field]": MEMBER_FIELDS.Name,
      "sort[0][direction]": "asc",
    });
    members = recs.map(parseMember);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Roster from Airtable · read only
        </p>
      </header>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load members:</strong> {error}
        </div>
      )}

      {!error && members.length === 0 && (
        <div className="card px-6 py-12 text-center text-sm text-[var(--text-muted)]">
          No members found.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} className="card flex items-center gap-3 px-4 py-3">
            <Avatar name={m.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-[15px] font-medium">
                  {m.name}
                </div>
                {m.status && (
                  <span className={statusClass(m.status)}>{m.status}</span>
                )}
              </div>
              <div className="truncate text-xs text-[var(--text-muted)]">
                {[m.title, m.email].filter(Boolean).join(" · ") || " "}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
