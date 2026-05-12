# Rotary Attendance

Local prototype for tracking attendance at Rotary meetings. Apple-clean visual treatment, mobile-first, runs on `localhost:3000`. No auth — just two people logging check-ins during meetings.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Airtable (via server-side REST)

## Setup

1. Copy the env example and paste in your Airtable personal access token:

   ```bash
   cp .env.local.example .env.local
   # then edit .env.local
   ```

   ```
   AIRTABLE_TOKEN=patXXXXXXXXXXXXX
   AIRTABLE_BASE_ID=appjrCXmKfLR6MLGL
   ```

   The token needs `data.records:read`, `data.records:write`, and `schema.bases:read` scopes on the **Rotary** base. It is server-side only — never exposed to the browser.

2. Install deps and start dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open <http://localhost:3000>.

## Pages

- `/` — Events list. `+ New Event` opens a modal.
- `/events/[id]` — Event detail with check-in flow. Add member (search) or guest (free text). Remove with confirm. Delete event removes all check-ins too.
- `/members` — Read-only roster (the underlying Airtable table is shared with dues tracking).

## Airtable schema

Three tables in base `appjrCXmKfLR6MLGL`:

- **Members** (`tblKR99JLmo85ER7R`) — existing RC Cabanatuan North roster
- **Events** (`tblUS7a8PKhSj8CFG`)
- **Attendance** (`tblRMKKZ168TgPAC7`) — linked to Events + Members

Field IDs are centralised in `lib/fields.ts`. All Airtable calls go through `/api/*` route handlers in `app/api/`.
