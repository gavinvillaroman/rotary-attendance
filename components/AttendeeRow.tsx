"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import type { AttendanceWithMember } from "@/lib/types";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AttendeeRow({
  attendance,
  onRemove,
}: {
  attendance: AttendanceWithMember;
  onRemove: (id: string) => void | Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const name = attendance.member?.name ?? attendance.guestName ?? "Unknown";
  const isGuest = !attendance.member;

  async function handleRemove() {
    setBusy(true);
    await onRemove(attendance.id);
    // parent will refresh
  }

  return (
    <div className="card flex items-center gap-3 px-4 py-3">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-[15px] font-medium">{name}</div>
          {isGuest && <span className="badge badge-muted">Guest</span>}
        </div>
        <div className="text-xs text-[var(--text-muted)]">
          Checked in {formatTime(attendance.checkedInAt)}
        </div>
      </div>
      {!confirming ? (
        <button
          className="text-xs font-medium text-[var(--text-muted)] hover:text-red-600"
          onClick={() => setConfirming(true)}
        >
          Remove
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            className="text-xs font-medium text-[var(--text-muted)]"
            onClick={() => setConfirming(false)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn-danger text-xs"
            onClick={handleRemove}
            disabled={busy}
          >
            {busy ? "…" : "Confirm"}
          </button>
        </div>
      )}
    </div>
  );
}
