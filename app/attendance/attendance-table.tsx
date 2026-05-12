"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TypeBadge } from "@/components/TypeBadge";
import type { AttendanceLogRow } from "./page";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AttendanceLogTable({
  rows,
  error,
}: {
  rows: AttendanceLogRow[];
  error: string | null;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.attendeeName.toLowerCase().includes(q) ||
        r.eventName.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">
            Attendance
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            All check-ins across every event
          </p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[12px] text-[var(--text-muted)]">
          {rows.length} total
        </div>
      </header>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load attendance log:</strong> {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search attendee or event…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="ml-auto text-[12px] text-[var(--text-muted)]">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--text-muted)]">
          No check-ins yet.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Event</th>
                <th>Type</th>
                <th>Event Date</th>
                <th>Checked In</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.attendeeName}</span>
                      {r.isGuest && (
                        <span className="badge badge-muted">Guest</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {r.eventId ? (
                      <Link
                        href={`/events/${r.eventId}`}
                        className="text-[var(--primary)] hover:underline"
                      >
                        {r.eventName}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-muted)]">
                        {r.eventName}
                      </span>
                    )}
                  </td>
                  <td>
                    <TypeBadge type={r.eventType} />
                  </td>
                  <td className="text-[var(--text-muted)] tabular-nums">
                    {formatDate(r.eventDate)}
                  </td>
                  <td className="text-[var(--text-muted)] tabular-nums">
                    {formatDateTime(r.checkedInAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
