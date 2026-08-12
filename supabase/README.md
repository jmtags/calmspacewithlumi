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
