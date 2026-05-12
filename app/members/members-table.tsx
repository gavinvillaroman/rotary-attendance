"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/TypeBadge";
import { MemberFormModal } from "@/components/MemberFormModal";
import type { MemberWithCount } from "./page";
import type { CllaStatus, Member } from "@/lib/types";

type SortKey = "name" | "title" | "status" | "attendance" | "clla";
type StatusFilter = "all" | "Active" | "Inactive" | "Honorary";

function pesoFormat(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function CllaBadge({ status }: { status: CllaStatus | null }) {
  if (!status) return <span className="text-[var(--text-muted)]">—</span>;
  const color =
    status === "Paid"
      ? "bg-green-100 text-green-800"
      : status === "Confirmed"
        ? "bg-yellow-100 text-yellow-800"
        : status === "Declined"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}
    >
      {status}
    </span>
  );
}

export function MembersTable({
  members,
  error,
}: {
  members: MemberWithCount[];
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = members;
    if (q) {
      rows = rows.filter((m) =>
        [m.name, m.email, m.classification, m.title]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "all") {
      rows = rows.filter((m) => m.status === statusFilter);
    }
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      else if (sort === "title")
        cmp = (a.title ?? "").localeCompare(b.title ?? "");
      else if (sort === "status")
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
      else if (sort === "attendance")
        cmp = a.attendanceCount - b.attendanceCount;
      else if (sort === "clla")
        cmp = (a.clla_2026_status ?? "").localeCompare(
          b.clla_2026_status ?? "",
        );
      return dir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [members, query, sort, dir, statusFilter]);

  function toggleSort(key: SortKey) {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir(key === "attendance" ? "desc" : "asc");
    }
  }

  function indicator(key: SortKey) {
    if (sort !== key) return null;
    return <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
  }

  const pills: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Active", label: "Active" },
    { key: "Inactive", label: "Inactive" },
    { key: "Honorary", label: "Honorary" },
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Club roster · {members.length} members
          </p>
        </div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}>
          + Add Member
        </button>
      </header>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load members:</strong> {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search name, email, classification…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-1">
          {pills.map((p) => {
            const active = statusFilter === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setStatusFilter(p.key)}
                className={
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors " +
                  (active
                    ? "bg-[var(--text)] text-white"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[12px] text-[var(--text-muted)]">
          {filtered.length} of {members.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-[var(--text-muted)]">
          No members match your filters.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 56 }} />
                <th className="sortable" onClick={() => toggleSort("name")}>
                  Name{indicator("name")}
                </th>
                <th className="sortable" onClick={() => toggleSort("title")}>
                  Title{indicator("title")}
                </th>
                <th>Classification</th>
                <th>Email</th>
                <th className="sortable" onClick={() => toggleSort("status")}>
                  Status{indicator("status")}
                </th>
                <th className="sortable" onClick={() => toggleSort("clla")}>
                  CLLA 2026{indicator("clla")}
                </th>
                <th style={{ textAlign: "right" }}>Amount Paid</th>
                <th
                  className="sortable"
                  style={{ textAlign: "right" }}
                  onClick={() => toggleSort("attendance")}
                >
                  Attendance{indicator("attendance")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="row-link"
                  onClick={() => setEditing(m)}
                >
                  <td>
                    <Avatar name={m.name} />
                  </td>
                  <td className="font-medium">{m.name}</td>
                  <td className="text-[var(--text-muted)]">
                    {m.title || "—"}
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {m.classification || "—"}
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {m.email || "—"}
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>
                    <CllaBadge status={m.clla_2026_status} />
                  </td>
                  <td
                    className="text-[var(--text-muted)] tabular-nums"
                    style={{ textAlign: "right" }}
                  >
                    {pesoFormat(m.clla_2026_amount_paid)}
                  </td>
                  <td
                    className="font-medium tabular-nums"
                    style={{ textAlign: "right" }}
                  >
                    {m.attendanceCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addOpen && (
        <MemberFormModal mode="create" onClose={() => setAddOpen(false)} />
      )}
      {editing && (
        <MemberFormModal
          mode="edit"
          member={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
