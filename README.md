# RAVZEN DIGI UNIVERSE

> **"Where Ideas Come Alive."**

An interactive digital universe — cinematic portfolio, product showcase, and creative technology experience built for RAVZEN.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Animation | GSAP 3 + Framer Motion |
| 3D | React Three Fiber + Three.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Validation | Zod |
| Icons | Lucide React |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required values:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # Server-only, never exposed to client
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_ACTIVITY_MULTIPLIER=3
```

### 3. Run database migrations

In your Supabase project dashboard, go to **SQL Editor** and run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_ad_slots.sql`

### 4. Create Supabase Storage bucket

In Supabase Storage, create a bucket named `media` with public access for uploaded images.

### 5. Create admin user

In Supabase Auth, create the first user. Then in SQL Editor, set their role:

```sql
UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'your@email.com';
```

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
src/
├── app/
│   ├── (public)/          # Public experience (intro → portal → hub → zones)
│   │   ├── page.tsx        # Root experience entry point
│   │   ├── zones/          # Deep-linkable zone pages
│   │   └── contact/        # Contact experience
│   ├── admin/              # Protected admin panel (role-based access)
│   │   ├── dashboard/
│   │   ├── projects/[zone]/
│   │   ├── advertisements/
│   │   ├── analytics/
│   │   ├── media/
│   │   ├── settings/
│   │   └── users/
│   └── api/                # Route handlers
│       ├── analytics/
│       ├── sessions/
│       ├── contact/
│       └── upload/
├── components/
│   ├── universe/           # Core experience components
│   ├── portal/             # Portal door animation
│   ├── zones/              # Zone transitions + content + shared
│   ├── admin/              # Admin panel components
│   └── contact/            # Contact experience
├── hooks/                  # Reusable React hooks
├── lib/
│   ├── supabase/           # DB client, server, admin, data-access layers
│   ├── utils/              # cn(), formatPrice(), session utils
│   └── validation/         # Zod schemas
├── config/                 # Site config, zone definitions
├── types/                  # TypeScript interfaces + Zod-derived types
└── styles/                 # Global CSS + design tokens
```

---

## Universe Experience Flow

```
INTRO (white screen, letter reveal)
  ↓ click/tap
PORTAL DOOR (4-panel GSAP animation)
  ↓ panels split
UNIVERSE HUB (dark space, 4 zone cards, stars, nebula)
  ↓ select zone
ZONE TRANSITION (unique cinematic for each zone)
  ↓ animation completes
ZONE CONTENT (database-driven projects/apps/software/systems)
  ↓ back button
UNIVERSE HUB
```

---

## Zones

| Zone | Color | Content |
|---|---|---|
| DESIGN | Purple/Pink | Logos, branding, UI/UX, illustrations |
| ANDROID | Green/Cyan | Android apps, APKs |
| SOFTWARE | Blue/Violet | Desktop/web software, SaaS |
| SYSTEM | Gold/Orange | POS, business, management systems |

---

## Admin Panel

Access at `/admin/login`. Three role levels:

- **SUPER_ADMIN** — full access including user management and settings
- **ADMIN** — content, media, advertisements, analytics
- **EDITOR** — content read/write and media management

---

## Universe Activity

The public "Universe Activity" counter displays `rawActiveSessions × multiplier` (default: 3). This is a **presentation transformation only** — no fake records are created. The raw count and the multiplier are both visible in the admin analytics dashboard.

---

## Deployment

```bash
npm run build
npm start
```

Or deploy to Vercel — connect the repository and set environment variables.

---

## Key Features

- Cinematic intro with letter-reveal animation and portal door
- Space environment with R3F Three.js (falls back to CSS stars on low-end devices)
- Four zone-specific activation animations (GSAP timelines)
- Fully database-driven content — no hard-coded project data
- 10-slot advertisement system (2 per zone + 2 for hub)
- Privacy-conscious analytics (no PII stored)
- Protected admin panel with Supabase Auth + Row Level Security
- Reduced-motion support throughout
- Touch/keyboard/mouse interaction
- SEO: Open Graph, Twitter cards, sitemap, robots.txt
- Zero lint errors, zero TypeScript errors, clean Next.js build
