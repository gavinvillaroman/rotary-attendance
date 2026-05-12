import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { TypeBadge } from "@/components/TypeBadge";
import { DashboardHeader } from "./dashboard-header";

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

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type DashboardData = {
  totalMembers: number;
  activeMembers: number;
  eventsThisMonth: number;
  totalAttendance: number;
  nextEvent: Event | null;
  recentEvents: { event: Event; attendeeCount: number }[];
  recentCheckIns: {
    id: string;
    name: string;
    eventName: string;
    eventId: string | null;
    checkedInAt: string | null;
  }[];
};

async function loadDashboard(): Promise<DashboardData> {
  const supabase = await createClient();
  const [membersRes, eventsRes, attRes] = await Promise.all([
    supabase.from("members").select("*").order("name", { ascending: true }),
    supabase.from("events").select("*").order("event_date", { ascending: false }),
    supabase
      .from("attendance")
      .select("*, member:members(id,name,title)")
      .order("checked_in_at", { ascending: false }),
  ]);

  if (membersRes.error) throw membersRes.error;
  if (eventsRes.error) throw eventsRes.error;
  if (attRes.error) throw attRes.error;

  const members = membersRes.data ?? [];
  const events = (eventsRes.data ?? []) as Event[];
  const attendance = attRes.data ?? [];

  const eventMap = new Map<string, Event>();
  events.forEach((e) => eventMap.set(e.id, e));

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const upcoming = events
    .filter((e) => e.event_date && e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  const attendanceCounts = new Map<string, number>();
  for (const a of attendance) {
    if (a.event_id) {
      attendanceCounts.set(
        a.event_id,
        (attendanceCounts.get(a.event_id) ?? 0) + 1,
      );
    }
  }

  const recentEvents = events.slice(0, 5).map((ev) => ({
    event: ev,
    attendeeCount: attendanceCounts.get(ev.id) ?? 0,
  }));

  const recentCheckIns = attendance.slice(0, 10).map((a) => {
    const ev = a.event_id ? eventMap.get(a.event_id) : null;
    const memberName = (a.member as { name?: string } | null)?.name;
    return {
      id: a.id as string,
      name: memberName ?? a.guest_name ?? "Unknown",
      eventName: ev?.name ?? "(deleted event)",
      eventId: a.event_id ?? null,
      checkedInAt: a.checked_in_at ?? null,
    };
  });

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "Active").length,
    eventsThisMonth: events.filter((e) => e.event_date?.startsWith(yyyymm)).length,
    totalAttendance: attendance.length,
    nextEvent: upcoming[0] ?? null,
    recentEvents,
    recentCheckIns,
  };
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="card px-5 py-5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-2 text-[32px] font-semibold leading-none tabular-nums">
        {value}
      </div>
      {sub && (
        <div className="mt-2 text-[13px] text-[var(--text-muted)]">{sub}</div>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  let data: DashboardData | null = null;
  let error: string | null = null;
  try {
    data = await loadDashboard();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || !data) {
    return (
      <div>
        <DashboardHeader />
        <div className="card mt-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Couldn’t load dashboard:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={data.totalMembers}
          sub={`${data.activeMembers} active`}
        />
        <StatCard label="Events this Month" value={data.eventsThisMonth} />
        <StatCard
          label="Total Attendance"
          value={data.totalAttendance}
          sub="all-time check-ins"
        />
        <StatCard
          label="Next Event"
          value={
            data.nextEvent ? (
              <span className="text-[18px] font-semibold leading-tight">
                <Link
                  href={`/events/${data.nextEvent.id}`}
                  className="hover:underline"
                >
                  {data.nextEvent.name}
                </Link>
              </span>
            ) : (
              <span className="text-[18px] font-medium text-[var(--text-muted)]">
                None
              </span>
            )
          }
          sub={
            data.nextEvent ? (
              formatDate(data.nextEvent.event_date)
            ) : (
              <Link
                href="/events"
                className="text-[var(--primary)] hover:underline"
              >
                + New Event
              </Link>
            )
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <section className="card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-[15px] font-semibold">Recent Events</h2>
            <Link
              href="/events"
              className="text-[13px] font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.recentEvents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
              No events yet.
            </div>
          ) : (
            <ul>
              {data.recentEvents.map(({ event, attendeeCount }) => (
                <li
                  key={event.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#fafafa]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-medium">
                          {event.name}
                        </span>
                        <TypeBadge type={event.type} />
                      </div>
                      <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                        {formatDate(event.event_date)}
                        {event.location ? ` · ${event.location}` : ""}
                      </div>
                    </div>
                    <div className="text-[13px] font-medium text-[var(--primary)] tabular-nums">
                      {attendeeCount}
                    </div>
                    <span className="text-[var(--text-muted)]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-[15px] font-semibold">Recent Check-ins</h2>
            <Link
              href="/attendance"
              className="text-[13px] font-medium text-[var(--primary)] hover:underline"
            >
              View log
            </Link>
          </div>
          {data.recentCheckIns.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
              No check-ins yet.
            </div>
          ) : (
            <ul>
              {data.recentCheckIns.map((c) => (
                <li
                  key={c.id}
                  className="border-b border-[var(--border)] px-5 py-2.5 last:border-b-0"
                >
                  <div className="truncate text-[14px] font-medium">
                    {c.name}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2 text-[12px] text-[var(--text-muted)]">
                    <span className="truncate">{c.eventName}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatDateTime(c.checkedInAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
