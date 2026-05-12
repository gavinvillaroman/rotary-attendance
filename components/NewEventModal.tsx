"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_TYPES } from "@/lib/types";

export function NewEventModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<string>(EVENT_TYPES[0]);
  const [customType, setCustomType] = useState(false);
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, type, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      onClose();
      router.push(`/events/${data.event.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
        <h2 className="mb-5 text-xl font-semibold">New Event</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Name
            </label>
            <input
              autoFocus
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekly Lunch Meeting"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Date
            </label>
            <input
              type="date"
              required
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCustomType(false);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active && !customType
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setCustomType(true);
                  setType("");
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  customType
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]"
                }`}
              >
                + Other
              </button>
            </div>
            {customType && (
              <input
                autoFocus
                className="input mt-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. Installation Night"
              />
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
              Location <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Club House"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
