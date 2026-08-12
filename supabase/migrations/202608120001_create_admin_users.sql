create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can verify their own allowlist row" on public.admin_users;

create policy "Admins can verify their own allowlist row"
on public.admin_users
for select
to authenticated
using (lower(email) = lower((auth.jwt() ->> 'email')));

create index if not exists admin_users_email_idx
on public.admin_users (lower(email));

-- After creating a Supabase Auth user, add your admin email:
-- insert into public.admin_users (email) values ('you@example.com');
