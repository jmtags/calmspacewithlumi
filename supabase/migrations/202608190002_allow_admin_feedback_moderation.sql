drop policy if exists "Allowlisted admins can update feedback visibility" on public.feedback_submissions;

create policy "Allowlisted admins can update feedback visibility"
on public.feedback_submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where lower(admin_users.email) = lower(auth.jwt() ->> 'email')
  )
);
