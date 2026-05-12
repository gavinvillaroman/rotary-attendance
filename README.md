# Rotary Attendance

Attendance tracker for RC Cabanatuan North. Apple-clean visuals, mobile-first, gated by magic-link auth + email allowlist.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth)

## Setup

1. Copy the env example:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open <http://localhost:3000>. You will be redirected to `/login` — enter your email (must be in `allowed_emails`) and click the magic link.

## Pages

- `/` — Dashboard (member/event/attendance counts, next event, recent activity)
- `/events` — Events list. `+ New Event` opens a modal.
- `/events/[id]` — Event detail with check-in flow (search-and-add member or guest)
- `/members` — Members roster with CLLA 2026 dues columns. Add / edit / delete from the app.
- `/attendance` — Full check-in log across every event.

## Schema

Four tables in Supabase: `members`, `events`, `attendance`, `allowed_emails`. RLS allows reads/writes only when the signed-in user's email is in `allowed_emails`. Migrations live in `supabase/migrations/`.

## Auth

Magic-link sign-in via Supabase Auth. `app/auth/callback/route.ts` validates that the user's email is in `allowed_emails` and signs them out otherwise. Middleware refreshes the session on every request and gates every route except `/login` and `/auth/*`.
