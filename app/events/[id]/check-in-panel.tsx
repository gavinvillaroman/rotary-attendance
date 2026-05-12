"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AttendeeRow } from "@/components/AttendeeRow";
import { AddAttendeeModal } from "@/components/AddAttendeeModal";
import type { AttendanceWithMember } from "@/lib/types";

export function CheckInPanel({
  eventId,
}: {
  eventId: string;
  eventName: string;
}) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAttendance(data.attendance);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function removeAttendance(id: string) {
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function deleteEvent() {
    if (!confirm("Delete this event and all check-ins?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/events");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  }

  const excluded = new Set(
    attendance.map((a) => a.member_id).filter(Boolean) as string[],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-medium text-[var(--primary)]">
          {attendance.length}{" "}
          {attendance.length === 1 ? "attendee" : "attendees"}
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + Add Attendee
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          Loading…
        </p>
      ) : attendance.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
          <p className="text-[15px] font-medium">No check-ins yet</p>
          <p className="text-sm text-[var(--text-muted)]">
            Tap “Add Attendee” to start.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {attendance.map((a) => (
            <AttendeeRow
              key={a.id}
              attendance={a}
              onRemove={removeAttendance}
            />
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <button
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          onClick={deleteEvent}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete event"}
        </button>
      </div>

      {showAdd && (
        <AddAttendeeModal
          eventId={eventId}
          excludedMemberIds={excluded}
          onClose={() => setShowAdd(false)}
          onAdded={async () => {
            await load();
          }}
        />
      )}
    </div>
  );
}
