# Supabase setup

Run SQL files in `supabase/migrations/` in filename order using the Supabase SQL Editor.

## Admin login

1. Enable Email provider in Supabase Auth.
2. Create an Auth user for your admin email.
3. Run `202608120001_create_admin_users.sql`.
4. Add your admin email to the allowlist:

```sql
insert into public.admin_users (email)
values ('you@example.com');
```

The `/admin` page lets a signed-in user access the dashboard only when their email exists in `public.admin_users`.

## Analytics dashboard

Run `202608120002_create_analytics_events.sql` to enable the dashboard metrics.

The website records:

- page views
- section views
- APK download clicks
- approximate session duration
- country/region/city when deployment headers provide them

Local development and some hosts may show location as `Unknown`. On Vercel, the API reads Vercel geo headers when available.

## Anonymous feedback

Run `202608120003_create_feedback.sql` to enable anonymous ratings and comments.

The feedback form does not ask for names, email addresses, or accounts. It stores:

- rating from 1 to 5
- whether the feedback is about the app, website, or both
- the comment or suggestion
- an anonymous browser session id for rate limiting

Spam and abuse protections:

- hidden honeypot field
- strict rating/category/comment validation
- 10 to 1000 character comment limit
- server-side rate limit of 3 submissions per 10 minutes per anonymous session
- public users can submit through the `submit_feedback` function, but only allowlisted admins can read feedback rows

## Environment variables

For local development, the current project supports:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

For Vercel, add:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
