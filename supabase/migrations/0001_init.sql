-- Rotary Attendance — schema + auth allowlist + RLS

-- ============================================================
-- Tables
-- ============================================================

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  airtable_id text unique,
  name text not null,
  title text,
  classification text,
  email text,
  phone text,
  status text not null default 'Active' check (status in ('Active','Inactive','Honorary')),
  clla_2026_status text check (clla_2026_status in ('Confirmed','Paid','Declined')),
  clla_2026_amount_paid numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  airtable_id text unique,
  name text not null,
  event_date date not null,
  type text,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  airtable_id text unique,
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  guest_name text,
  checked_in_at timestamptz not null default now(),
  constraint member_xor_guest check (
    (member_id is not null and guest_name is null)
    or (member_id is null and guest_name is not null)
  )
);

create unique index if not exists attendance_event_member_uniq
  on attendance (event_id, member_id) where member_id is not null;

create index if not exists attendance_event_idx on attendance (event_id);
create index if not exists attendance_member_idx on attendance (member_id);
create index if not exists events_date_idx on events (event_date desc);
create index if not exists members_name_idx on members (name);

-- ============================================================
-- Auth allowlist
-- ============================================================

create table if not exists allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into allowed_emails (email) values ('villaromangavin@gmail.com')
  on conflict (email) do nothing;

-- Helper to check if the current user's email is allowed.
create or replace function is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- ============================================================
-- Row-level security
-- ============================================================

alter table members enable row level security;
alter table events enable row level security;
alter table attendance enable row level security;
alter table allowed_emails enable row level security;

-- Members: allowlisted users can do everything
drop policy if exists members_select on members;
drop policy if exists members_insert on members;
drop policy if exists members_update on members;
drop policy if exists members_delete on members;
create policy members_select on members for select using (is_allowed());
create policy members_insert on members for insert with check (is_allowed());
create policy members_update on members for update using (is_allowed()) with check (is_allowed());
create policy members_delete on members for delete using (is_allowed());

-- Events
drop policy if exists events_select on events;
drop policy if exists events_insert on events;
drop policy if exists events_update on events;
drop policy if exists events_delete on events;
create policy events_select on events for select using (is_allowed());
create policy events_insert on events for insert with check (is_allowed());
create policy events_update on events for update using (is_allowed()) with check (is_allowed());
create policy events_delete on events for delete using (is_allowed());

-- Attendance
drop policy if exists attendance_select on attendance;
drop policy if exists attendance_insert on attendance;
drop policy if exists attendance_update on attendance;
drop policy if exists attendance_delete on attendance;
create policy attendance_select on attendance for select using (is_allowed());
create policy attendance_insert on attendance for insert with check (is_allowed());
create policy attendance_update on attendance for update using (is_allowed()) with check (is_allowed());
create policy attendance_delete on attendance for delete using (is_allowed());

-- allowed_emails: only readable to the user themselves, no public write
drop policy if exists allowed_emails_select on allowed_emails;
create policy allowed_emails_select on allowed_emails for select using (
  lower(email) = lower(auth.jwt() ->> 'email')
);

-- Reload PostgREST schema so the client picks up the new tables/policies.
notify pgrst, 'reload schema';
