"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NewEventModal } from "@/components/NewEventModal";
import { TypeBadge } from "@/components/TypeBadge";
import type { EventWithCount } from "@/lib/types";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type SortKey = "date" | "name" | "attendees";

export function EventsTable({
  events,
  error,
}: {
  events: EventWithCount[];
  error: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? events.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            (e.location ?? "").toLowerCase().includes(q) ||
            (e.type ?? "").toLowerCase().includes(q),
        )
      : events;
    const sortedRows = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sort === "date") cmp = a.date.localeCompare(b.date);
      else if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "attendees") cmp = a.attendeeCount - b.attendeeCount;
      return dir === "asc" ? cmp : -cmp;
    });
    return sortedRows;
  }, [events, query, sort, dir]);

  function toggleSort(key: SortKey) {
    if (key === sort) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir(key === "date" ? "desc" : "asc");
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event and all its check-ins?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingId(null);
    }
  }

  function indicator(key: SortKey) {
    if (sort !== key) return null;
    return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            All meetings, fundraisers, and gatherings
          </p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + New Event
        </button>
      </header>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load events:</strong> {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search name, location, type…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="ml-auto text-[12px] text-[var(--text-muted)]">
          {sorted.length} of {events.length} events
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="text-[15px] font-medium">No events yet</div>
          <p className="text-sm text-[var(--text-muted)]">
            Create your first event to start tracking attendance.
          </p>
          <button className="btn-primary mt-2" onClick={() => setOpen(true)}>
            + New Event
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th
                  className="sortable"
                  onClick={() => toggleSort("name")}
                >
                  Name{indicator("name")}
                </th>
                <th
                  className="sortable"
                  onClick={() => toggleSort("date")}
                >
                  Date{indicator("date")}
                </th>
                <th>Type</th>
                <th>Location</th>
                <th
                  className="sortable"
                  style={{ textAlign: "right" }}
                  onClick={() => toggleSort("attendees")}
                >
                  Attendees{indicator("attendees")}
                </th>
                <th style={{ width: 70 }} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((ev) => (
                <tr
                  key={ev.id}
                  className="row-link"
                  onClick={() => router.push(`/events/${ev.id}`)}
                >
                  <td className="font-medium">{ev.name}</td>
                  <td className="text-[var(--text-muted)] tabular-nums">
                    {formatDate(ev.date)}
                  </td>
                  <td>
                    <TypeBadge type={ev.type} />
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {ev.location || "—"}
                  </td>
                  <td
                    className="font-medium tabular-nums"
                    style={{ textAlign: "right" }}
                  >
                    {ev.attendeeCount}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-[12px] font-medium text-red-600 hover:underline disabled:opacity-50"
                      disabled={deletingId === ev.id}
                      onClick={() => deleteEvent(ev.id)}
                    >
                      {deletingId === ev.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <NewEventModal onClose={() => setOpen(false)} />}
    </div>
  );
}
