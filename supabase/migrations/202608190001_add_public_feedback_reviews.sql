alter table public.feedback_submissions
add column if not exists show_on_website boolean not null default false;

drop policy if exists "Anyone can read public feedback reviews" on public.feedback_submissions;

create policy "Anyone can read public feedback reviews"
on public.feedback_submissions
for select
to anon, authenticated
using (show_on_website = true);

create index if not exists feedback_submissions_public_reviews_idx
on public.feedback_submissions (show_on_website, created_at desc)
where show_on_website = true;
