# Rotary Attendance Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only Next.js prototype that tracks Rotary event attendance via a Search-and-Add check-in flow, backed by Supabase.

**Architecture:** Next.js 16 App Router on `localhost:3000` reads/writes a Supabase Postgres database directly using the JS client (no API routes, no auth). Three tables — `members`, `events`, `attendance` — with the JS client called from Server Components for reads and Client Components for mutations. Apple-clean visual language (white surfaces, blue accent, SF system fonts, 640px max-width).

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase JS client (`@supabase/supabase-js`) · Supabase hosted free tier

**Spec:** `docs/superpowers/specs/2026-05-12-rotary-attendance-design.md`

---

## File Structure

```
~/Projects/rotary-attendance/
├── app/
│   ├── layout.tsx              # Root layout, fonts, tab bar
│   ├── globals.css             # Tailwind + Apple variables
│   ├── page.tsx                # Events list (server component)
│   ├── events/
│   │   ├── new-event-button.tsx        # Client: opens NewEventModal
│   │   └── [id]/
│   │       ├── page.tsx                # Event detail (server component, fetches event + attendance)
│   │       └── check-in-panel.tsx      # Client: search, add, remove
│   └── members/
│       ├── page.tsx                    # Roster (server component)
│       └── member-list.tsx             # Client: list + edit modal trigger
├── components/
│   ├── TabBar.tsx              # Bottom (mobile) / top (desktop) nav
│   ├── EventCard.tsx           # One event card
│   ├── AttendeeRow.tsx         # One attendee row in event detail
│   ├── AddAttendeeModal.tsx    # Member-search OR guest-name modal
│   ├── NewEventModal.tsx       # Create event form
│   └── MemberFormModal.tsx     # Create/edit member form
├── lib/
│   ├── supabase.ts             # Browser + server clients
│   ├── types.ts                # Member, Event, Attendance types
│   └── queries.ts              # Typed data access functions
├── supabase/
│   └── migrations/
│       └── 0001_init.sql       # Tables, constraints, indexes
├── .env.local                  # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `~/Projects/rotary-attendance/package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `.env.local.example`

- [ ] **Step 1: Create the project with create-next-app**

```bash
cd ~/Projects
npx create-next-app@latest rotary-attendance \
  --typescript --tailwind --app --no-src-dir --no-eslint --no-turbopack \
  --import-alias "@/*"
```

Accept the default Tailwind setup. This creates the directory and installs deps.

- [ ] **Step 2: Verify the project runs**

```bash
cd ~/Projects/rotary-attendance
npm run dev
```

Expected: server starts at http://localhost:3000 and shows the Next.js welcome page. Stop with Ctrl+C.

- [ ] **Step 3: Install Supabase JS client**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 4: Create .env.local.example**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

- [ ] **Step 5: Initialize git and commit**

```bash
cd ~/Projects/rotary-attendance
git init
git add -A
git commit -m "chore: scaffold next.js + tailwind + supabase client"
```

---

## Task 2: Create Supabase project and apply schema

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Create the Supabase project**

Open https://supabase.com/dashboard, create a new project named `rotary-attendance` in any region. Wait for it to provision (~2 min). Copy the Project URL and `anon` key from Settings → API.

- [ ] **Step 2: Write `.env.local` with real values**

```bash
# .env.local — DO NOT COMMIT
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 3: Create the migration file**

Create `supabase/migrations/0001_init.sql`:

```sql
-- Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  role text not null default 'Member' check (role in ('President','Secretary','Member','Guest')),
  created_at timestamptz not null default now()
);

-- Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  location text,
  event_type text not null default 'Weekly' check (event_type in ('Weekly','Board','Fundraiser','Social')),
  created_at timestamptz not null default now()
);

-- Attendance (member OR guest, never both)
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  guest_name text,
  checked_in_at timestamptz not null default now(),
  constraint member_xor_guest check (
    (member_id is not null and guest_name is null)
    or (member_id is null and guest_name is not null)
  )
);

-- One check-in per member per event (guests allowed multiple by design — different names)
create unique index if not exists attendance_event_member_uniq
  on attendance (event_id, member_id)
  where member_id is not null;

-- Tables have no RLS in this prototype; the anon key has full read/write.
-- Disable RLS explicitly so the anon key works for both read and write.
alter table members  disable row level security;
alter table events   disable row level security;
alter table attendance disable row level security;
```

- [ ] **Step 4: Apply the migration via the Supabase SQL editor**

Open the Supabase Dashboard → SQL Editor → New Query, paste the contents of `0001_init.sql`, click **Run**.

Expected: "Success. No rows returned." for each statement.

- [ ] **Step 5: Reload the PostgREST schema**

In the same SQL editor, run:

```sql
notify pgrst, 'reload schema';
```

Expected: success. (PostgREST otherwise rejects client writes against newly-created tables with "couldn't save" while direct SQL still works.)

- [ ] **Step 6: Sanity-check the tables via the dashboard**

Open Table Editor — confirm `members`, `events`, `attendance` exist with the expected columns.

- [ ] **Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add supabase schema migration"
```

---

## Task 3: Supabase client + shared types

**Files:**
- Create: `lib/supabase.ts`, `lib/types.ts`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export type MemberRole = 'President' | 'Secretary' | 'Member' | 'Guest';
export type EventType = 'Weekly' | 'Board' | 'Fundraiser' | 'Social';

export type Member = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: MemberRole;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  event_date: string; // YYYY-MM-DD
  location: string | null;
  event_type: EventType;
  created_at: string;
};

export type Attendance = {
  id: string;
  event_id: string;
  member_id: string | null;
  guest_name: string | null;
  checked_in_at: string;
};

export type AttendanceWithMember = Attendance & {
  member: Pick<Member, 'id' | 'name' | 'role'> | null;
};
```

- [ ] **Step 2: Write `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Single client — usable from server components and client components.
// No auth in this prototype, so the same anon key works everywhere.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
```

- [ ] **Step 3: Verify it compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add supabase client + shared types"
```

---

## Task 4: Apple visual baseline + root layout with TabBar

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `components/TabBar.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-text: #1d1d1f;
  --color-text-muted: #86868b;
  --color-primary: #0071e3;
  --color-success: #34c759;
  --color-danger: #ff3b30;
  --color-border: #e5e5ea;
}

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}

button { font-family: inherit; }
```

- [ ] **Step 2: Create `components/TabBar.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Events' },
  { href: '/members', label: 'Members' },
];

export function TabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/events') : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 inset-x-0 sm:static sm:max-w-[640px] sm:mx-auto bg-white sm:bg-transparent border-t sm:border-t-0 sm:border-b border-[var(--color-border)] z-10">
      <div className="flex justify-around sm:justify-start sm:gap-6 sm:px-6 py-3">
        {tabs.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`text-sm font-medium ${isActive(t.href) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import './globals.css';
import { TabBar } from '@/components/TabBar';

export const metadata = {
  title: 'Rotary Attendance',
  description: 'Rotary event attendance tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen pb-20 sm:pb-0">
          <TabBar />
          <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx` with a placeholder**

```tsx
export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Events</h1>
      <p className="text-sm text-[var(--color-text-muted)] mt-2">Coming up next…</p>
    </div>
  );
}
```

- [ ] **Step 5: Run dev server and visually verify**

```bash
npm run dev
```

Open http://localhost:3000 — expected: light gray bg, white tab bar, "Events" heading. Resize the window — at narrow widths the tab bar drops to the bottom of the screen. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add app/ components/
git commit -m "feat: apple visual baseline + tab bar + root layout"
```

---

## Task 5: Members page — list, add, edit

**Files:**
- Create: `app/members/page.tsx`, `app/members/member-list.tsx`, `components/MemberFormModal.tsx`

- [ ] **Step 1: Create `components/MemberFormModal.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Member, MemberRole } from '@/lib/types';

const ROLES: MemberRole[] = ['President', 'Secretary', 'Member', 'Guest'];

export function MemberFormModal({
  open,
  member,
  onClose,
  onSaved,
}: {
  open: boolean;
  member: Member | null; // null = create, else edit
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [role, setRole] = useState<MemberRole>(member?.role ?? 'Member');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function save() {
    setSaving(true);
    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role,
    };
    if (member) {
      await supabase.from('members').update(payload).eq('id', member.id);
    } else {
      await supabase.from('members').insert(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  async function remove() {
    if (!member) return;
    if (!confirm(`Delete ${member.name}?`)) return;
    await supabase.from('members').delete().eq('id', member.id);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{member ? 'Edit Member' : 'Add Member'}</h2>
        <div className="space-y-3">
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <select className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" value={role} onChange={e => setRole(e.target.value as MemberRole)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[var(--color-bg)] text-sm font-medium">Cancel</button>
          <button onClick={save} disabled={!name.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {member && (
          <button onClick={remove} className="mt-3 w-full py-2 text-sm text-[var(--color-danger)]">Delete member</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/members/member-list.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Member } from '@/lib/types';
import { MemberFormModal } from '@/components/MemberFormModal';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('');
}

export function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [editing, setEditing] = useState<Member | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    const { data } = await supabase.from('members').select('*').order('name');
    setMembers(data ?? []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Members</h1>
        <button onClick={() => setShowCreate(true)} className="bg-[var(--color-primary)] text-white text-sm font-medium px-3 py-1.5 rounded-full">+ Add</button>
      </div>
      <div className="bg-white rounded-2xl divide-y divide-[var(--color-border)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {members.length === 0 && <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">No members yet</div>}
        {members.map(m => (
          <button key={m.id} onClick={() => setEditing(m)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
            <div className="w-9 h-9 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-xs font-semibold text-[var(--color-text-muted)]">{initials(m.name)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.name}</div>
              <div className="text-xs text-[var(--color-text-muted)] truncate">{m.role}{m.email ? ` · ${m.email}` : ''}</div>
            </div>
          </button>
        ))}
      </div>
      <MemberFormModal open={showCreate} member={null} onClose={() => setShowCreate(false)} onSaved={load} />
      <MemberFormModal open={!!editing} member={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  );
}
```

- [ ] **Step 3: Create `app/members/page.tsx`**

```tsx
import { MemberList } from './member-list';

export default function MembersPage() {
  return <MemberList />;
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Visit http://localhost:3000/members. Click "+ Add", create a member (e.g., "Test One", Secretary), Save. Confirm it appears. Tap the row → edit → change role → Save → confirm. Tap → Delete → confirm gone. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/members components/MemberFormModal.tsx
git commit -m "feat: members page with create/edit/delete"
```

---

## Task 6: Events list + new event modal

**Files:**
- Create: `components/EventCard.tsx`, `components/NewEventModal.tsx`, `app/events/new-event-button.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/NewEventModal.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { EventType } from '@/lib/types';

const TYPES: EventType[] = ['Weekly', 'Board', 'Fundraiser', 'Social'];

export function NewEventModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>('Weekly');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from('events')
      .insert({ name: name.trim(), event_date: date, location: location.trim() || null, event_type: type })
      .select('id')
      .single();
    setSaving(false);
    if (error || !data) { alert(error?.message ?? 'Failed'); return; }
    onClose();
    router.push(`/events/${data.id}`);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">New Event</h2>
        <div className="space-y-3">
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" placeholder="Event name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" placeholder="Location (optional)" value={location} onChange={e => setLocation(e.target.value)} />
          <select className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm" value={type} onChange={e => setType(e.target.value as EventType)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[var(--color-bg)] text-sm font-medium">Cancel</button>
          <button onClick={save} disabled={!name.trim() || saving} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50">
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/events/new-event-button.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { NewEventModal } from '@/components/NewEventModal';

export function NewEventButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-[var(--color-primary)] text-white text-sm font-medium px-3 py-1.5 rounded-full">+ New Event</button>
      <NewEventModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: Create `components/EventCard.tsx`**

```tsx
import Link from 'next/link';
import type { Event } from '@/lib/types';

export function EventCard({ event, attendeeCount }: { event: Event; attendeeCount: number }) {
  const date = new Date(event.event_date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">{event.event_type}</div>
      <div className="text-base font-semibold mt-0.5">{event.name}</div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">{date}{event.location ? ` · ${event.location}` : ''}</div>
      <div className="text-xs text-[var(--color-primary)] mt-2">{attendeeCount} {attendeeCount === 1 ? 'attendee' : 'attendees'}</div>
    </Link>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx` (server component)**

```tsx
import { supabase } from '@/lib/supabase';
import type { Event } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { NewEventButton } from './events/new-event-button';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  const { data: counts } = await supabase
    .from('attendance')
    .select('event_id');

  const countByEvent = new Map<string, number>();
  for (const row of counts ?? []) {
    countByEvent.set(row.event_id, (countByEvent.get(row.event_id) ?? 0) + 1);
  }

  const list = (events ?? []) as Event[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Events</h1>
        <NewEventButton />
      </div>
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-sm text-[var(--color-text-muted)]">
          No events yet. Tap "+ New Event" to get started.
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map(e => (
            <EventCard key={e.id} event={e} attendeeCount={countByEvent.get(e.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Visit http://localhost:3000. Tap "+ New Event" → fill in "Weekly Lunch", today's date, type Weekly → Create. Expected: redirected to `/events/<id>` (404 for now — page is next task). Go back to `/` — the event appears with "0 attendees".

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/events/new-event-button.tsx components/EventCard.tsx components/NewEventModal.tsx
git commit -m "feat: events list with new-event modal"
```

---

## Task 7: Event detail — search & add check-in

**Files:**
- Create: `app/events/[id]/page.tsx`, `app/events/[id]/check-in-panel.tsx`, `components/AttendeeRow.tsx`, `components/AddAttendeeModal.tsx`

- [ ] **Step 1: Create `components/AttendeeRow.tsx`**

```tsx
'use client';
import type { AttendanceWithMember } from '@/lib/types';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('');
}

export function AttendeeRow({ row, onRemove }: { row: AttendanceWithMember; onRemove: () => void }) {
  const name = row.member?.name ?? row.guest_name ?? 'Unknown';
  const isGuest = !row.member;
  const time = new Date(row.checked_in_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <button onClick={onRemove} className="w-full flex items-center gap-3 px-3 py-2.5 bg-[var(--color-bg)] rounded-xl mb-1.5 text-left">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${isGuest ? 'bg-[var(--color-text-muted)]' : 'bg-[var(--color-success)]'}`}>
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{name}{isGuest && <span className="text-[var(--color-text-muted)] ml-1.5 text-xs">guest</span>}</div>
      </div>
      <span className="text-[11px] text-[var(--color-text-muted)]">{time}</span>
    </button>
  );
}
```

- [ ] **Step 2: Create `components/AddAttendeeModal.tsx`**

```tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Member } from '@/lib/types';

type Mode = 'member' | 'guest';

export function AddAttendeeModal({
  open,
  eventId,
  alreadyCheckedInIds,
  onClose,
  onAdded,
}: {
  open: boolean;
  eventId: string;
  alreadyCheckedInIds: Set<string>;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [mode, setMode] = useState<Mode>('member');
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [guestName, setGuestName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery(''); setGuestName(''); setMode('member');
    supabase.from('members').select('*').order('name').then(({ data }) => setMembers(data ?? []));
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter(m => !alreadyCheckedInIds.has(m.id))
      .filter(m => !q || m.name.toLowerCase().includes(q));
  }, [members, query, alreadyCheckedInIds]);

  if (!open) return null;

  async function addMember(id: string) {
    setSaving(true);
    await supabase.from('attendance').insert({ event_id: eventId, member_id: id });
    setSaving(false);
    onAdded();
    onClose();
  }

  async function addGuest() {
    if (!guestName.trim()) return;
    setSaving(true);
    await supabase.from('attendance').insert({ event_id: eventId, guest_name: guestName.trim() });
    setSaving(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <div className="flex gap-1 bg-[var(--color-bg)] rounded-xl p-1 mb-4">
          <button onClick={() => setMode('member')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg ${mode === 'member' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}>Member</button>
          <button onClick={() => setMode('guest')} className={`flex-1 py-1.5 text-sm font-medium rounded-lg ${mode === 'guest' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}>Guest</button>
        </div>

        {mode === 'member' ? (
          <>
            <input autoFocus className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm mb-3" placeholder="Search members…" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="max-h-72 overflow-y-auto -mx-1 px-1">
              {filtered.length === 0 && <div className="text-center text-xs text-[var(--color-text-muted)] py-6">No matches</div>}
              {filtered.map(m => (
                <button key={m.id} onClick={() => addMember(m.id)} disabled={saving} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg)] rounded-xl text-left">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{m.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{m.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <input autoFocus className="w-full bg-[var(--color-bg)] rounded-xl px-3 py-2.5 text-sm mb-3" placeholder="Guest name" value={guestName} onChange={e => setGuestName(e.target.value)} />
            <button onClick={addGuest} disabled={!guestName.trim() || saving} className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium disabled:opacity-50">
              {saving ? 'Adding…' : 'Add guest'}
            </button>
          </>
        )}

        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-[var(--color-text-muted)]">Cancel</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/events/[id]/check-in-panel.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AttendanceWithMember, Event } from '@/lib/types';
import { AttendeeRow } from '@/components/AttendeeRow';
import { AddAttendeeModal } from '@/components/AddAttendeeModal';

export function CheckInPanel({ event }: { event: Event }) {
  const router = useRouter();
  const [rows, setRows] = useState<AttendanceWithMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('attendance')
      .select('*, member:members(id,name,role)')
      .eq('event_id', event.id)
      .order('checked_in_at', { ascending: false });
    setRows((data ?? []) as AttendanceWithMember[]);
  }
  useEffect(() => { load(); }, [event.id]);

  async function remove(row: AttendanceWithMember) {
    const label = row.member?.name ?? row.guest_name ?? 'attendee';
    if (!confirm(`Remove ${label}?`)) return;
    await supabase.from('attendance').delete().eq('id', row.id);
    await load();
  }

  async function deleteEvent() {
    if (!confirm(`Delete "${event.name}" and all its attendance?`)) return;
    await supabase.from('events').delete().eq('id', event.id);
    router.push('/');
    router.refresh();
  }

  const date = new Date(event.event_date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const checkedInMemberIds = new Set(rows.map(r => r.member_id).filter((x): x is string => !!x));

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">{event.event_type}</div>
      <h1 className="text-2xl font-semibold mt-0.5">{event.name}</h1>
      <div className="text-sm text-[var(--color-text-muted)] mt-1">{date}{event.location ? ` · ${event.location}` : ''}</div>
      <div className="text-sm text-[var(--color-primary)] mt-2 mb-5">{rows.length} {rows.length === 1 ? 'attendee' : 'attendees'}</div>

      <div className="bg-white rounded-2xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {rows.length === 0 ? (
          <div className="text-center text-sm text-[var(--color-text-muted)] py-6">No one checked in yet</div>
        ) : (
          rows.map(r => <AttendeeRow key={r.id} row={r} onRemove={() => remove(r)} />)
        )}
        <button onClick={() => setShowAdd(true)} className="w-full mt-2 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium">+ Add attendee</button>
      </div>

      <button onClick={deleteEvent} className="mt-6 w-full py-2 text-sm text-[var(--color-danger)]">Delete event</button>

      <AddAttendeeModal
        open={showAdd}
        eventId={event.id}
        alreadyCheckedInIds={checkedInMemberIds}
        onClose={() => setShowAdd(false)}
        onAdded={load}
      />
    </div>
  );
}
```

- [ ] **Step 4: Create `app/events/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/lib/types';
import { CheckInPanel } from './check-in-panel';

export const dynamic = 'force-dynamic';

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from('events').select('*').eq('id', id).single();
  if (!data) notFound();
  return <CheckInPanel event={data as Event} />;
}
```

- [ ] **Step 5: Manually verify the full flow**

```bash
npm run dev
```

1. http://localhost:3000/members — add three members (e.g., John Doe, Maria Alvarez, Robert Park).
2. http://localhost:3000 — tap "+ New Event", create one.
3. On the event detail page — tap "+ Add attendee" → Member tab → search "Mar" → tap Maria → row appears with current time.
4. Tap "+ Add attendee" again → Member tab → confirm Maria is hidden, only the other two appear.
5. Add John → confirm two rows.
6. Tap the Guest tab → type "Walk-in Bob" → Add → confirm guest row with "guest" badge.
7. Tap a row → confirm dialog → confirm → row gone.
8. Go back to `/` — confirm the event's attendee count matches.
9. From the event page tap "Delete event" → confirm → returns to events list and the event is gone.

- [ ] **Step 6: Commit**

```bash
git add app/events components/AttendeeRow.tsx components/AddAttendeeModal.tsx
git commit -m "feat: event detail check-in flow with guest support"
```

---

## Task 8: Polish + seed data + README

**Files:**
- Modify: `app/page.tsx` (optional empty-state CTA), root `README.md`
- Create: `scripts/seed.sql` (optional seed for demo)

- [ ] **Step 1: Create `scripts/seed.sql` for quick demo data**

```sql
insert into members (name, email, role) values
  ('John Doe', 'john@example.com', 'President'),
  ('Maria Alvarez', 'maria@example.com', 'Secretary'),
  ('Robert Park', 'robert@example.com', 'Member'),
  ('Sarah Kim', 'sarah@example.com', 'Member'),
  ('Elena Garcia', 'elena@example.com', 'Member')
on conflict do nothing;

insert into events (name, event_date, location, event_type) values
  ('Weekly Lunch Meeting', current_date, 'Downtown Club', 'Weekly'),
  ('Board Meeting', current_date - 7, 'Conference Room', 'Board');
```

You can paste this into Supabase SQL Editor anytime to populate demo data.

- [ ] **Step 2: Write `README.md`**

```md
# Rotary Attendance

Local prototype for tracking Rotary event attendance.

## Setup

1. `cp .env.local.example .env.local` — fill in Supabase URL + anon key
2. Apply `supabase/migrations/0001_init.sql` in the Supabase SQL Editor
3. Run `notify pgrst, 'reload schema';` after the migration
4. (Optional) Apply `scripts/seed.sql` for demo data
5. `npm install && npm run dev`
6. Open http://localhost:3000

## Pages

- `/` — Events list, create new event
- `/events/[id]` — Check-in screen (search & add members, add guests, remove)
- `/members` — Roster (create, edit, delete)

No auth — anyone with access to the URL can read/write.
```

- [ ] **Step 3: Final smoke pass on mobile width**

```bash
npm run dev
```

Open Chrome DevTools, toggle device mode → iPhone 14. Walk through all three pages. Confirm:
- Tab bar sits at bottom on mobile, top on desktop
- Modals open from the bottom on mobile, centered on desktop
- All text is readable, no horizontal scroll, taps register on small touch targets

- [ ] **Step 4: Commit**

```bash
git add README.md scripts/
git commit -m "docs: add readme + seed script"
```

---

## Self-Review Notes

- Spec coverage: events list ✓, event detail with search/add/guest/remove ✓, members CRUD ✓, three tables with constraints ✓, Apple visuals ✓, 640px max width ✓, mobile-first responsive ✓, PostgREST reload step included ✓.
- No placeholders.
- Type consistency: `Member`, `Event`, `Attendance`, `AttendanceWithMember`, `MemberRole`, `EventType` defined once in `lib/types.ts` and reused.
- Auth is intentionally absent per spec — RLS disabled explicitly so the anon key works for writes.
