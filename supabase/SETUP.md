# Supabase Production Setup

Run these steps **once** in your production Supabase project before the first
Vercel deployment.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Note the **Project URL** and **API keys** (Settings → API).

---

## 2. Run migrations in order

Open the **SQL Editor** in your Supabase dashboard and execute each file in
sequence. Do NOT skip steps or change the order — each migration depends on
the previous one.

| Order | File | What it does |
|-------|------|--------------|
| 1 | `migrations/001_initial_schema.sql` | Creates all 12 tables and indexes |
| 2 | `migrations/002_rls_policies.sql` | Enables Row Level Security on every table |
| 3 | `migrations/003_seed_ad_slots.sql` | Seeds the default ad slot positions |

> **Tip:** Paste the entire file content into the SQL editor and click
> **Run**.  Fix any errors before moving to the next file.

---

## 3. Create the Storage bucket

1. Go to **Storage** in the Supabase dashboard.
2. Click **New bucket**, name it exactly: `media`
3. Set it to **Public** (so uploaded images are served over CDN).
4. Under **Policies**, allow authenticated uploads:

```sql
-- Allow authenticated users to upload to media bucket
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow public reads
CREATE POLICY "Public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated deletes
CREATE POLICY "Authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

---

## 4. Configure Auth redirect URLs

1. Go to **Authentication → URL Configuration**.
2. Add your production domain to **Redirect URLs**:
   - `https://your-domain.com/**`
   - `https://your-domain.vercel.app/**` (if using Vercel preview domain)
3. Set **Site URL** to `https://your-domain.com`.

---

## 5. Create the first admin user

The admin login uses Supabase Auth.  Create the initial account via the
**Authentication → Users** panel:

1. Click **Invite user** (or **Add user → Create new user**).
2. Enter the admin email and a strong password.
3. The user is immediately active — no email confirmation required for
   manually created accounts.

---

## 6. Verify RLS is active

Run this query in the SQL editor to confirm RLS is enabled on all tables:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Every row in the `rowsecurity` column should show `true`.

---

## 7. Environment variables checklist

Copy `.env.example` → `.env.local` for local dev, and add every variable to
Vercel under **Project → Settings → Environment Variables**:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret |
| `NEXT_PUBLIC_SITE_URL` | Your production domain (no trailing slash) |
| `NEXT_PUBLIC_ACTIVITY_MULTIPLIER` | `3` (or your preferred multiplier) |
| `NEXT_PUBLIC_WHATSAPP` | Your WhatsApp number (international format, no spaces) |
| `NEXT_PUBLIC_EMAIL` | Your contact email |
