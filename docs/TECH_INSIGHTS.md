# RAVZEN Tech Insights operations

Public routes: `/tech-insights` and `/tech-insights/[slug]`. The homepage adds one section and one navigation link. Existing layout, settings, portfolio, reviews and contact features are preserved.

## Current activation status

The UI and publisher can be deployed independently of Gemini credentials. The database scheduler is initially **disabled**. Do not mark automatic publication operational until the live dry run succeeds and the jobs are enabled.

1. In the existing Vercel project's **Settings → Environment Variables**, add `GEMINI_API_KEY` as a **Sensitive**, **Production** variable. Never use a `NEXT_PUBLIC_` prefix or paste the value into a GitHub file/chat/log.
2. `TECH_INSIGHTS_SECRET` is already provisioned as a sensitive Production variable and in Supabase Vault. A SHA-256 hash in a private database table authorizes only the narrowly scoped publishing RPC. Do not rotate only one of these copies.
3. Optional `GEMINI_MODEL` defaults to `gemini-3.8-flash`, verified against Google's model documentation on 2026-11-07. Model availability and quota depend on the Google project. Generation uses the Google Gemini REST API and two model calls (draft and evidence check), with bounded retries.
4. Redeploy production so the new environment variable reaches the application.
5. Call `POST /api/cron/tech-insights?dryRun=1` with `Authorization: Bearer <TECH_INSIGHTS_SECRET>` from a trusted server environment. Use environment variables, not command-line literals. Expect `validated_not_published`. This validates current source discovery, article generation, Sinhala/length/shape checks and the second-pass evidence review without publishing anything.
6. Only after a successful dry run, enable both jobs using SQL:

```sql
select cron.alter_job(job_id := jobid, active := true)
from cron.job
where jobname in ('ravzen-tech-insights-saturday','ravzen-tech-insights-retry');
```

## Schedule and reliability

Supabase pg_cron invokes the Vercel server endpoint at **08:45 Saturday Asia/Colombo** (03:15 UTC), with retries through 09:45. Articles prepared before 09:00 stay invisible through RLS until their 09:00 publication timestamp. Successful retries after 09:00 appear late; outages and model failures cannot guarantee exact-time availability. Never publish unsupported content just to meet the deadline.

No duplicate ChatGPT reminder or GitHub Actions publishing schedule is needed. GitHub holds the application and migrations, Vercel serves the site and Gemini integration, and Supabase stores articles and schedules the work.

The scheduler signs a timestamp with HMAC-SHA256. Its queue contains only a signature valid for 60 seconds, never the reusable publisher token. Signed scheduler requests cannot run the manual dry-run endpoint. This matters because Supabase pg_net queue grants cannot be relied on to hide request headers from database roles.

One database row per Sri Lankan Saturday, an advisory transaction lock, a six-minute lease, a maximum of eight claimed attempts and unique source URL/content hash constraints prevent overlapping runs and repeat publication. At most one article is published per week. A failed/expired run can retry; a successful run exits before calling Gemini again.

Sources are recent (previous 14 days), dated entries from curated Google Blog AI, GitHub Engineering and Microsoft Research feeds. Select the newest unused source with enough accessible evidence; skip inaccessible/short pages. Fetches are restricted to exact HTTPS publisher hostnames, bounded in size/time, and validate redirects. Additional publishers require editorial review of the allowlist.

Articles are original Sinhala analysis rather than translations, with source title, publisher, date and outbound link. Prompt and validation gates reject HTML, insufficient Sinhala, invalid structure, implausible length and exact copied passages. A second model review checks factual support. Automated checks are not equivalent to human editorial verification; the UI discloses AI assistance.

## Monitoring and recovery

```sql
select week, status, attempts, started_at, finished_at, error_code
from ravzen_private.tech_publish_runs order by week desc limit 20;
select jobname, schedule, active from cron.job where jobname like 'ravzen-tech-insights%';
select count(*) from public.tech_articles;
```

Read Vercel logs for `tech_insights_run_failed` (run UUID and safe error code only). Missing Gemini configuration, model quota/availability failures, source outages, validation failures and database failures return non-success responses and never publish partial content. A hard function timeout leaves a lease that a later retry can reclaim. Supabase's HTTP response table can diagnose scheduler delivery errors; never query or export queue headers unnecessarily.

Pause by setting both jobs inactive. Existing published articles remain readable. Removing a faulty article is an authorized database-admin operation; no anonymous or ordinary authenticated client can modify articles. For code rollback, restore the prior Vercel deployment and leave additive tables in place.

## Validation

- `npm run type-check`
- `npm run build`
- `node --experimental-strip-types --test tests/tech-insights.test.ts`
- Run `tests/tech-insights-database.sql` through an authorized SQL connection; it rolls all fixtures back.
- Live checks: homepage/insights/sitemap return 200, nonexistent article returns 404, unauthenticated publisher POST returns 401, GET returns 405, missing-key dry run returns 503 without a draft.
- Actual Gemini generation, source factual quality, article sharing and automatic publication require a valid Gemini key and a successful live dry run. No fabricated test article should be published to production.
