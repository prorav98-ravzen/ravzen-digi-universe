# Security review — 16 November 2026

Reviewed application routes, authentication, dependency advisories, deployed Supabase RLS and storage permissions. This is a targeted review, not a guarantee that all vulnerabilities have been found.

## Changes

- Removed anonymous access to reviewer phone/email; authenticated non-admin users no longer receive raw approved review rows. Public homepage uses a limited, approved/published review feed containing public fields only.
- Added restrictive active-user checks to media Storage writes.
- Added constrained session heartbeat/count RPCs to replace public raw session table access. After application rollout, remove public session table policies and permissions.
- Allowlisted login redirect paths and editor roles; require same-origin mutation requests on admin APIs.
- Validate image signatures and HTTP(S) content URLs, bound JSON bodies before parsing, and escape JSON-LD script data.
- Restricted optimized Supabase image sources to this project, disabled framework identification and added base/object/frame/form CSP directives. This is not a complete script-src CSP.
- Updated Next.js, Supabase client, Zod and tooling. Pinned patched PostCSS and scoped minimatch override; retain overrides until upstream dependencies incorporate these fixes.
- Preserved the existing touch bubble effect and website content. Fixed existing lint blockers while validating the update.

## Validation

- npm audit: 15 findings before (including 1 critical and 3 high); 0 after dependency updates.
- `node scripts/security-checks.cjs`: malicious redirects, cross-origin requests, role checks, false image types, oversized/invalid JSON and unsafe URL schemes.
- TypeScript type checking and ESLint; image optimization warnings are non-security warnings.
- Existing Tech Insights tests checked for compatibility with updated Zod.
- Production build/deployment and live HTTP checks are verified separately during rollout.

## Database rollout records

Applied remote migrations: `security_safe_review_feed`, `protect_reviewer_contact_details`, `bounded_session_access_functions`. Final rollout migration: `protect_session_table_access` (apply after the app uses the new RPCs). Database migrations are recorded in Supabase migration history.

Existing profile privilege trigger protects roles/activation, new accounts default inactive, and all inspected public tables have RLS enabled. No user contact values or secret credentials were included in this report.

## Remaining limits

- Supabase leaked-password protection is disabled on the current Free plan; enabling it requires a paid plan. No paid upgrade was made.
- The advisor flags pg_net in public; the extension is not relocatable. Do not drop/recreate it casually because scheduled publishing depends on it.
- Public analytics, heartbeat and guest-review intake remain susceptible to fabricated submissions. UUID tokens prevent enumeration after table lockdown but do not prove unique humans. Existing review throttling is not a complete anti-bot solution.
- Public SECURITY DEFINER functions are deliberate API boundaries; denied raw-table access and explicit function grants are necessary. Tables intentionally without policies remain deny-by-default.
