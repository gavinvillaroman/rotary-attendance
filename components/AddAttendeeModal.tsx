"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import type { Member } from "@/lib/types";

type Props = {
  eventId: string;
  excludedMemberIds: Set<string>;
  onClose: () => void;
  onAdded: () => void;
};

export function AddAttendeeModal({
  eventId,
  excludedMemberIds,
  onClose,
  onAdded,
}: Props) {
  const [tab, setTab] = useState<"member" | "guest">("member");
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/members");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setMembers(data.members);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (excludedMemberIds.has(m.id)) return false;
      if (!q) return true;
      return m.name.toLowerCase().includes(q);
    });
  }, [members, query, excludedMemberIds]);

  async function addMember(memberId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guestName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onAdded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6 sm:rounded-[20px]"
        style={{ boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold">Add Attendee</h2>

        <div className="mb-4 flex gap-1 rounded-[var(--radius-control)] bg-[var(--bg)] p-1">
          {(["member", "guest"] as const).map((t) => (
            <button
              key={t}
              className={
                "flex-1 rounded-md py-1.5 text-sm font-medium transition " +
                (tab === t
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--text-muted)]")
              }
              onClick={() => setTab(t)}
            >
              {t === "member" ? "Member" : "Guest"}
            </button>
          ))}
        </div>

        {tab === "member" && (
          <>
            <input
              autoFocus
              className="input mb-3"
              placeholder="Search members…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto">
              {loading && (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                  Loading…
                </p>
              )}
              {!loading && filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">
                  No matches.
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    disabled={busy}
                    onClick={() => addMember(m.id)}
                    className="flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 text-left transition hover:bg-[var(--bg)] disabled:opacity-50"
                  >
                    <Avatar name={m.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">
                        {m.name}
                      </div>
                      {m.title && (
                        <div className="truncate text-xs text-[var(--text-muted)]">
                          {m.title}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "guest" && (
          <form onSubmit={addGuest} className="space-y-3">
            <input
              autoFocus
              className="input"
              placeholder="Guest name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={busy || !guestName.trim()}
            >
              {busy ? "Adding…" : "Add Guest"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
