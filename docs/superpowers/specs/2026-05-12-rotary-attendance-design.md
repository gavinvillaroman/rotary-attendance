# Rotary Attendance Tracker — Design

**Date:** 2026-05-12
**Status:** Approved for planning

## Purpose

A local prototype app for tracking attendance at Rotary events. Two people (Gavin + one other) use it during meetings to log who showed up. No auth, no deployment — runs on `localhost:3000`. Apple-clean visual treatment.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (hosted free tier) — Postgres + JS client
- **Auth:** None (open access on localhost)
- **Hosting:** Local only (`localhost:3000`)

## Data Model

Three tables in Supabase.

### `members`
| column | type | notes |
|---|---|---|
| `id` | uuid (pk) | default `gen_random_uuid()` |
| `name` | text, not null | |
| `email` | text | nullable |
| `phone` | text | nullable |
| `role` | text | enum: `President`, `Secretary`, `Member`, `Guest` |
| `created_at` | timestamptz | default `now()` |

### `events`
| column | type | notes |
|---|---|---|
| `id` | uuid (pk) | default `gen_random_uuid()` |
| `name` | text, not null | e.g. "Weekly Lunch Meeting" |
| `event_date` | date, not null | |
| `location` | text | nullable |
| `event_type` | text | enum: `Weekly`, `Board`, `Fundraiser`, `Social` |
| `created_at` | timestamptz | default `now()` |

### `attendance`
| column | type | notes |
|---|---|---|
| `id` | uuid (pk) | default `gen_random_uuid()` |
| `event_id` | uuid (fk → events.id, cascade delete) | not null |
| `member_id` | uuid (fk → members.id, cascade delete) | nullable (null when guest) |
| `guest_name` | text | nullable (set when `member_id` is null) |
| `checked_in_at` | timestamptz | default `now()` |

Constraints:
- Unique `(event_id, member_id)` where `member_id` is not null (prevent double check-in).
- Check: exactly one of `member_id` or `guest_name` is non-null.

Note: PostgREST schema reload after DDL — run `NOTIFY pgrst, 'reload schema';` after table changes so the JS client can see them.

## Pages

### `/` — Events List
- Header: "Events" title, "+ New Event" primary button (top right desktop, bottom-fixed mobile)
- Grid of event cards (newest first): event name, date, type badge, attendee count
- Tap a card → navigate to `/events/[id]`
- "+ New Event" → modal: name, date, location, type → creates event → navigate to its detail page

### `/events/[id]` — Event Detail (the core check-in screen)
Layout matches mockup B (Search & Add):
- Top: event type label (caps, gray), event name + date (large, bold), attendee count (blue subtitle)
- Search input: filters members by name as you type
- When search has results: dropdown of matching members; tap to check in
- Below search: list of current attendees (sorted newest-first by `checked_in_at`), each row shows avatar (initials), name, check-in time
- Tap an attendee row → confirm modal → removes attendance
- `+ Add attendee` button at bottom: opens modal with two tabs:
  - **Member** tab: same search-and-tap flow
  - **Guest** tab: text input for guest name → adds attendance row with `member_id=null`, `guest_name=<input>`
- Header has a small menu: "Edit event" / "Delete event"

### `/members` — Member Roster
- Header: "Members" title, "+ Add Member" button
- List of all members, sorted alphabetically by name
- Each row: avatar (initials), name, role badge, email/phone (muted)
- Tap a row → edit modal (name, email, phone, role, delete)
- "+ Add Member" → modal: same fields

### Navigation
- Single tab bar at bottom (mobile) / top (desktop): **Events** · **Members**
- Apple-style: SF-system fonts, subtle separators, blue (`#0071e3`) primary, system grays for muted text

## Visual System

- Font: `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- Background: `#f5f5f7` (page), `#ffffff` (cards)
- Primary: `#0071e3` (blue)
- Success: `#34c759` (green) — used for checked-in state
- Text: `#1d1d1f` (primary), `#86868b` (secondary)
- Border radius: 14px for cards, 10px for inputs/buttons
- Shadows: very subtle (`0 1px 3px rgba(0,0,0,0.06)`)
- Max content width: 640px on desktop (centered, app-feel not dashboard-feel)

## Project Structure

```
~/Projects/rotary-attendance/
├── app/
│   ├── layout.tsx              # Root layout, tab bar
│   ├── page.tsx                # Events list
│   ├── events/[id]/page.tsx    # Event detail (check-in)
│   └── members/page.tsx        # Roster
├── components/
│   ├── EventCard.tsx
│   ├── AttendeeRow.tsx
│   ├── MemberSearch.tsx
│   ├── AddAttendeeModal.tsx
│   ├── NewEventModal.tsx
│   ├── MemberFormModal.tsx
│   └── TabBar.tsx
├── lib/
│   ├── supabase.ts             # Client init
│   └── types.ts                # Shared types
├── supabase/
│   └── migrations/
│       └── 0001_init.sql       # Tables + constraints
└── .env.local                  # SUPABASE_URL, SUPABASE_ANON_KEY
```

## Out of Scope (Prototype)

- Authentication / RLS
- Multi-club support
- CSV export, attendance reports, charts
- Member photos (use initials avatars)
- Recurring events
- Email/SMS reminders
- Mobile native app
- Deployment to Vercel

## Open Questions

None — ready for plan.
