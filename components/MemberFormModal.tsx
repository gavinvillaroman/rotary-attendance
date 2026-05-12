"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member, MemberStatus } from "@/lib/types";

type Props =
  | { mode: "create"; onClose: () => void }
  | { mode: "edit"; member: Member; onClose: () => void };

const STATUSES: MemberStatus[] = ["Active", "Inactive", "Honorary"];

export function MemberFormModal(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.member : null;

  const [name, setName] = useState(initial?.name ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [classification, setClassification] = useState(
    initial?.classification ?? "",
  );
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<MemberStatus>(initial?.status ?? "Active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        title: title.trim() || null,
        classification: classification.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
      };
      const url = isEdit ? `/api/members/${props.member.id}` : "/api/members";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      props.onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  async function remove() {
    if (!isEdit) return;
    if (!confirm("Delete this member? This also removes their check-ins.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/members/${props.member.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      props.onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4"
      onClick={props.onClose}
    >
      <div
        className="card w-full max-w-md p-6 sm:rounded-[20px]"
        style={{ boxShadow: "var(--shadow-modal)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 text-xl font-semibold">
          {isEdit ? "Edit Member" : "New Member"}
        </h2>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name">
            <input
              autoFocus
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </Field>
          <Field label="Title">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="President"
            />
          </Field>
          <Field label="Classification">
            <input
              className="input"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              placeholder="Real Estate"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={props.onClose}
                className="btn-secondary"
                disabled={busy}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? "Saving…" : isEdit ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
