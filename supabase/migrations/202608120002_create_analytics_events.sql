create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null check (event_type in ('page_view', 'section_view', 'download_click', 'session_end')),
  session_id text not null,
  page_path text not null default '/',
  section_id text,
  duration_seconds integer,
  country text,
  region text,
  city text,
  user_agent text
);

alter table public.analytics_events enable row level security;

drop policy if exists "Anyone can record analytics events" on public.analytics_events;
drop policy if exists "Allowlisted admins can read analytics events" on public.analytics_events;

create policy "Anyone can record analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

create policy "Allowlisted admins can read analytics events"
on public.analytics_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower(auth.jwt() ->> 'email')
  )
);

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_event_type_idx
on public.analytics_events (event_type);

create index if not exists analytics_events_section_id_idx
on public.analytics_events (section_id);
