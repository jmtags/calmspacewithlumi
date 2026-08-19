drop policy if exists "Anyone can read public feedback reviews" on public.feedback_submissions;

create policy "Anyone can read public feedback reviews"
on public.feedback_submissions
for select
to anon, authenticated
using (show_on_website = true);
