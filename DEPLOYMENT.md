# RAVZEN DIGI UNIVERSE — Vercel Deployment Guide

Complete step-by-step guide to get the site live on Vercel.

---

## Prerequisites

- [ ] A Supabase account and project (free tier works)
- [ ] A Vercel account (free tier works)
- [ ] A GitHub / GitLab / Bitbucket account (Vercel connects to a git repo)
- [ ] Node.js 20+ installed locally
- [ ] Your WhatsApp number (international format) and contact email ready

---

## Step 1 — Set up Supabase

Follow all steps in [`supabase/SETUP.md`](./supabase/SETUP.md):

1. Create a Supabase project
2. Run the 3 migrations in order
3. Create the `media` storage bucket (public)
4. Configure auth redirect URLs
5. Create the first admin user

---

## Step 2 — Push code to a git repository

```bash
git init                          # if not already a git repo
git add .
git commit -m "chore: initial production build"
git remote add origin <your-repo-url>
git push -u origin main
```

> `.env.local` is in `.gitignore` and will NOT be pushed. This is intentional.

---

## Step 3 — Import project on Vercel

1. Log in to <https://vercel.com>.
2. Click **Add New → Project**.
3. Connect your git provider and select this repository.
4. Vercel auto-detects **Next.js** — the framework preset is correct.
5. **Do NOT deploy yet** — set environment variables first (Step 4).

---

## Step 4 — Add environment variables on Vercel

In the Vercel project settings → **Environment Variables**, add every
variable from the table below. Set them for **Production**, **Preview**,
and **Development** as noted.

| Variable | Env | Value |
|----------|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | Supabase service_role key ⚠️ |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://your-domain.com` |
| `NEXT_PUBLIC_SITE_URL` | Preview | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_ACTIVITY_MULTIPLIER` | All | `3` |
| `NEXT_PUBLIC_WHATSAPP` | All | Your number (e.g. `919876543210`) |
| `NEXT_PUBLIC_EMAIL` | All | Your email |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is a **secret** — mark it as sensitive in
> Vercel so it is never visible in build logs.

---

## Step 5 — Deploy

1. Click **Deploy** in Vercel.
2. The build will run `npm ci && next build`.
3. Expected output: **22 routes, 0 errors, 0 warnings**.
4. Once deployed, Vercel provides a `.vercel.app` preview URL.

---

## Step 6 — Connect a custom domain (optional)

1. In the Vercel project → **Domains**, add your domain.
2. Follow the DNS instructions (CNAME or A record).
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to the custom domain.
4. Update Supabase → Auth → URL Configuration with the new domain.

---

## Step 7 — Post-deployment smoke test

Run through this checklist after every production deploy:

### Public website
- [ ] `https://your-domain.com` loads without errors
- [ ] Intro animation plays (letter reveal + portal door)
- [ ] Universe Hub renders with all 4 zone cards
- [ ] Activity counter increments / shows a number
- [ ] Design zone opens → project cards display (real data from Supabase)
- [ ] Android zone opens → app cards display
- [ ] Software zone opens → product cards display
- [ ] System zone opens → system cards display
- [ ] Closing experience appears → WhatsApp / Email CTAs work
- [ ] "Request a Project" opens WhatsApp with correct number
- [ ] Contact email link opens mail client with correct address

### Admin panel
- [ ] `https://your-domain.com/admin` redirects to `/admin/login`
- [ ] Login with admin credentials works
- [ ] Dashboard loads with analytics data
- [ ] Can create / edit / delete a project card
- [ ] Media upload works (image appears in Supabase Storage)
- [ ] Ad slot management shows default slots
- [ ] Settings page saves a value

### SEO / Meta
- [ ] Page `<title>` is "RAVZEN DIGI UNIVERSE"
- [ ] Open Graph image is set (check with <https://opengraph.xyz>)
- [ ] `https://your-domain.com/robots.txt` disallows `/admin/` and `/api/`
- [ ] `https://your-domain.com/sitemap.xml` returns valid XML

### Performance
- [ ] Run Lighthouse on the production URL — target score ≥ 90 Performance
- [ ] Check mobile layout on iOS Safari and Android Chrome

---

## Rollback procedure

If a deploy breaks production:

```bash
# In Vercel dashboard → Deployments → select the last good deploy → Promote to Production
# OR via CLI:
vercel rollback
```

---

## Environment variable audit

Run this locally to confirm no secrets are embedded in the client bundle:

```bash
# Search the built client chunks for the service role key substring
# (should return no results)
Select-String -Path ".next/static/**/*.js" -Pattern "service_role" -Recurse
```

---

## Build commands reference

```powershell
# Local development
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Production build (same as Vercel runs)
npm run build
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Build fails: `NEXT_PUBLIC_SUPABASE_URL` undefined | Env var not set on Vercel | Add it in Project → Settings → Env Vars |
| Admin login fails | Supabase auth redirect URL not set | Add domain in Supabase → Auth → URL Config |
| Images broken after deploy | `picsum.photos` blocked in prod | Upload real images to Supabase Storage via admin panel |
| Activity count shows 0 | Migrations not run | Run the 3 SQL files in Supabase SQL editor |
| 500 on `/api/admin/*` | Service role key missing or wrong | Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars |
| WhatsApp button opens wrong number | `NEXT_PUBLIC_WHATSAPP` not set | Add the env var in Vercel (no spaces, international format) |
