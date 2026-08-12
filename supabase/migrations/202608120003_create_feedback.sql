create extension if not exists pgcrypto;

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rating integer not null check (rating between 1 and 5),
  category text not null check (category in ('app', 'website', 'both')),
  comment text not null check (char_length(comment) between 10 and 1000),
  page_path text not null default '/',
  session_id text not null
);

create table if not exists public.feedback_rate_limits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null
);

alter table public.feedback_submissions enable row level security;
alter table public.feedback_rate_limits enable row level security;

drop policy if exists "Allowlisted admins can read feedback" on public.feedback_submissions;

create policy "Allowlisted admins can read feedback"
on public.feedback_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower(auth.jwt() ->> 'email')
  )
);

create or replace function public.submit_feedback(
  p_session_id text,
  p_rating integer,
  p_category text,
  p_comment text,
  p_page_path text,
  p_honeypot text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  clean_comment text;
begin
  if coalesce(trim(p_honeypot), '') <> '' then
    return jsonb_build_object('ok', true);
  end if;

  clean_comment := trim(coalesce(p_comment, ''));

  if coalesce(trim(p_session_id), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Missing session.');
  end if;

  if p_rating < 1 or p_rating > 5 then
    return jsonb_build_object('ok', false, 'error', 'Choose a rating from 1 to 5.');
  end if;

  if p_category not in ('app', 'website', 'both') then
    return jsonb_build_object('ok', false, 'error', 'Choose what your feedback is about.');
  end if;

  if char_length(clean_comment) < 10 or char_length(clean_comment) > 1000 then
    return jsonb_build_object('ok', false, 'error', 'Feedback must be 10 to 1000 characters.');
  end if;

  delete from public.feedback_rate_limits
  where created_at < now() - interval '1 hour';

  select count(*)
  into recent_count
  from public.feedback_rate_limits
  where session_id = left(p_session_id, 160)
    and created_at > now() - interval '10 minutes';

  if recent_count >= 3 then
    return jsonb_build_object('ok', false, 'error', 'Please wait a few minutes before sending more feedback.');
  end if;

  insert into public.feedback_rate_limits (session_id)
  values (left(p_session_id, 160));

  insert into public.feedback_submissions (session_id, rating, category, comment, page_path)
  values (
    left(p_session_id, 160),
    p_rating,
    p_category,
    left(clean_comment, 1000),
    left(coalesce(p_page_path, '/'), 160)
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_feedback(text, integer, text, text, text, text) from public;
grant execute on function public.submit_feedback(text, integer, text, text, text, text) to anon, authenticated;

create index if not exists feedback_submissions_created_at_idx
on public.feedback_submissions (created_at desc);

create index if not exists feedback_submissions_rating_idx
on public.feedback_submissions (rating);
