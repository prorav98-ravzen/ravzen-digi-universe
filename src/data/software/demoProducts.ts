/**
 * Software Zone — structured demo data.
 *
 * ISOLATION CONTRACT:
 *   SoftwareZone.tsx imports from '@/data/software/demoProducts' TODAY.
 *   Phase 6 replaces this with a Supabase data-access call returning SoftwareProduct[].
 *   Nothing in the UI changes — only the import source.
 *
 * IMAGES: picsum.photos deterministic seeds for stable previews.
 *   Replace with Supabase Storage public URLs in Phase 6.
 *
 * Five products — one per SoftwareCategory.
 */

import type { SoftwareProduct } from '@/types/software'

function price(amount: number | null, currency = 'USD'): SoftwareProduct['price'] {
  if (amount === null) return { amount: null, currency, label: 'Contact for quote' }
  if (amount === 0)    return { amount: 0,    currency, label: 'Free'              }
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' }
  return { amount, currency, label: `${sym[currency] ?? currency}${amount}` }
}

const WA    = '2348000000000'
const EMAIL = 'software@ravzen.com'

export const DEMO_SOFTWARE_PRODUCTS: SoftwareProduct[] = [

  // ── Desktop ─────────────────────────────────────────────────────────────────
  {
    id:          'sw-001',
    slug:        'screenflow-studio',
    name:        'ScreenFlow Studio',
    tagline:     'Professional screen recording and annotation for creators.',
    category:    'desktop',
    shortDesc:   'Lightweight screen recorder with annotation, zoom, and multi-track export.',
    fullDesc:    'ScreenFlow Studio is a professional-grade screen recording application for Windows and macOS. Capture any region of your screen at up to 4K60, annotate in real time with arrows, highlights, and callouts, apply zoom-and-pan focus effects, and export to MP4, GIF, or WebM. Designed for software documentation, tutorial creators, and QA engineers who need more than a basic screen capture tool.',
    coverImage:  'https://picsum.photos/seed/screenflow-cover/800/500',
    gallery:     [
      'https://picsum.photos/seed/screenflow-g1/800/500',
      'https://picsum.photos/seed/screenflow-g2/800/500',
      'https://picsum.photos/seed/screenflow-g3/800/500',
    ],
    videoUrl:    null,
    version:     '2.4.1',
    supportedOS: ['Windows 10/11', 'macOS 12 Monterey+'],
    requirements:'4 GB RAM · 500 MB disk space · DirectX 11 (Windows) / Metal (macOS)',
    features:    [
      '4K60 screen capture (any region or full screen)',
      'Real-time annotations: arrows, callouts, highlights',
      'Zoom-and-pan focus effects',
      'Multi-track timeline editor',
      'Export: MP4, GIF, WebM, APNG',
      'Webcam overlay with background blur',
      'Hotkey-driven workflow',
      'Batch export queue',
    ],
    downloadUrl: null,
    demoUrl:     null,
    price:       price(49),
    isFree:      false,
    changelog:   [
      {
        version: '2.4.1',
        date:    '2024-11-20',
        notes:   ['Fixed crash on Windows 11 24H2', 'Improved GIF export quality', 'Added APNG output format'],
      },
      {
        version: '2.4.0',
        date:    '2024-10-05',
        notes:   ['New multi-track timeline', 'Zoom-and-pan focus mode', 'Webcam background blur'],
      },
    ],
    whatsapp:    WA,
    email:       EMAIL,
    isFeatured:  true,
    isNew:       false,
    publishedAt: '2024-11-20',
  },

  // ── Web Tool ────────────────────────────────────────────────────────────────
  {
    id:          'sw-002',
    slug:        'colorlens',
    name:        'ColorLens',
    tagline:     'AI-powered colour palette generator and accessibility checker.',
    category:    'web-tool',
    shortDesc:   'Generate, export, and WCAG-check colour palettes in your browser.',
    fullDesc:    'ColorLens is a browser-based colour design tool used by designers, developers, and product teams. Upload an image and extract a dominant palette with one click, build harmonious palettes from a seed colour using HSL/OKLch math, and instantly check every pair for WCAG 2.1 contrast compliance. Export to CSS custom properties, Tailwind config, Figma tokens, or plain hex. No login required.',
    coverImage:  'https://picsum.photos/seed/colorlens-cover/800/500',
    gallery:     [
      'https://picsum.photos/seed/colorlens-g1/800/500',
      'https://picsum.photos/seed/colorlens-g2/800/500',
    ],
    videoUrl:    null,
    version:     '1.6.0',
    supportedOS: ['Browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)'],
    requirements:'Modern browser · No installation required',
    features:    [
      'AI palette extraction from images',
      'Harmony generator: complementary, triadic, analogous, split-comp',
      'OKLch colour space support',
      'WCAG 2.1 AA/AAA contrast checker',
      'Export: CSS vars, Tailwind config, Figma tokens, JSON, hex',
      'Palette history and bookmarks',
      'Dark / light mode preview',
      'Shareable palette URLs',
    ],
    downloadUrl: null,
    demoUrl:     null,
    price:       price(0),
    isFree:      true,
    changelog:   [
      {
        version: '1.6.0',
        date:    '2024-12-01',
        notes:   ['Added OKLch colour space support', 'New Figma token export', 'Shareable palette URLs'],
      },
      {
        version: '1.5.2',
        date:    '2024-09-14',
        notes:   ['WCAG 3.0 APCA preview mode', 'Performance improvements on large palettes'],
      },
    ],
    whatsapp:    WA,
    email:       EMAIL,
    isFeatured:  true,
    isNew:       false,
    publishedAt: '2024-12-01',
  },

  // ── SaaS ────────────────────────────────────────────────────────────────────
  {
    id:          'sw-003',
    slug:        'feedpulse',
    name:        'FeedPulse',
    tagline:     'Unified social media inbox and scheduled publishing platform.',
    category:    'saas',
    shortDesc:   'Manage all your social channels from one smart dashboard.',
    fullDesc:    'FeedPulse connects Instagram, X/Twitter, LinkedIn, Facebook, and TikTok into a single smart inbox. Respond to comments and DMs without switching tabs, schedule posts with an AI-assisted optimal-time engine, and track performance with a unified analytics dashboard. Supports up to 25 social accounts per workspace. Designed for marketing teams, social media managers, and agencies managing multiple clients.',
    coverImage:  'https://picsum.photos/seed/feedpulse-cover/800/500',
    gallery:     [
      'https://picsum.photos/seed/feedpulse-g1/800/500',
      'https://picsum.photos/seed/feedpulse-g2/800/500',
      'https://picsum.photos/seed/feedpulse-g3/800/500',
    ],
    videoUrl:    null,
    version:     '3.1.2',
    supportedOS: ['Web (any modern browser)', 'iOS 16+', 'Android 10+'],
    requirements:'Internet connection · Modern browser or mobile app',
    features:    [
      'Unified inbox: Instagram, X, LinkedIn, Facebook, TikTok',
      'Scheduled publishing with AI optimal-time engine',
      'Post recycling and content calendar',
      'Team collaboration with role-based access',
      'Unified analytics dashboard',
      'Hashtag performance tracker',
      'Client workspace separation',
      'White-label reports (PDF export)',
    ],
    downloadUrl: null,
    demoUrl:     null,
    price:       price(null),
    isFree:      false,
    changelog:   [
      {
        version: '3.1.2',
        date:    '2024-11-30',
        notes:   ['TikTok DM integration', 'Fixed scheduling timezone bug', 'Improved mobile app performance'],
      },
      {
        version: '3.1.0',
        date:    '2024-10-18',
        notes:   ['New white-label report generator', 'AI content suggestions in composer', 'Client workspace feature'],
      },
    ],
    whatsapp:    WA,
    email:       EMAIL,
    isFeatured:  false,
    isNew:       true,
    publishedAt: '2024-11-30',
  },

  // ── Automation ──────────────────────────────────────────────────────────────
  {
    id:          'sw-004',
    slug:        'databridge',
    name:        'DataBridge',
    tagline:     'No-code ETL automation between 80+ data sources.',
    category:    'automation',
    shortDesc:   'Connect, transform, and sync data between any two systems without writing code.',
    fullDesc:    "DataBridge is a no-code ETL (Extract, Transform, Load) automation platform that connects 80+ data sources including spreadsheets, databases, REST APIs, CRMs, and cloud storage. Build transformation pipelines using a visual drag-and-drop canvas, schedule syncs from every 5 minutes to monthly, and monitor data flow health with real-time alerts. Used by operations teams to eliminate copy-paste workflows and by engineers to prototype data integrations before committing to custom code.",
    coverImage:  'https://picsum.photos/seed/databridge-cover/800/500',
    gallery:     [
      'https://picsum.photos/seed/databridge-g1/800/500',
      'https://picsum.photos/seed/databridge-g2/800/500',
    ],
    videoUrl:    null,
    version:     '4.0.1',
    supportedOS: ['Web (any modern browser)'],
    requirements:'Internet connection · No installation required',
    features:    [
      '80+ pre-built connectors (Sheets, Airtable, Postgres, REST APIs, S3, Salesforce…)',
      'Visual drag-and-drop transformation canvas',
      'Filter, map, join, and aggregate data without code',
      'Schedule sync: every 5 min → monthly',
      'Real-time error alerts and retry logic',
      'Run history and audit log',
      'Webhook triggers for event-driven pipelines',
      'Team collaboration with version history',
    ],
    downloadUrl: null,
    demoUrl:     null,
    price:       price(null),
    isFree:      false,
    changelog:   [
      {
        version: '4.0.1',
        date:    '2024-12-05',
        notes:   ['Added Notion and Linear connectors', 'Webhook trigger improvements', 'Fixed date transformation edge case'],
      },
      {
        version: '4.0.0',
        date:    '2024-11-01',
        notes:   ['Complete UI redesign', 'New visual transformation canvas', 'Run history and audit log'],
      },
    ],
    whatsapp:    WA,
    email:       EMAIL,
    isFeatured:  true,
    isNew:       false,
    publishedAt: '2024-12-05',
  },

  // ── Data & Analytics ────────────────────────────────────────────────────────
  {
    id:          'sw-005',
    slug:        'metricboard',
    name:        'MetricBoard',
    tagline:     'Real-time business dashboards from any data source in minutes.',
    category:    'data-analytics',
    shortDesc:   'Build live business dashboards without SQL or BI expertise.',
    fullDesc:    'MetricBoard lets any team member build real-time business dashboards by connecting to spreadsheets, databases, or SaaS tools — no SQL or BI expertise required. Choose from 40+ chart types, set threshold alerts, embed dashboards into internal tools, and share public read-only links with stakeholders. Trusted by sales, operations, and finance teams who need visibility without depending on their engineering team.',
    coverImage:  'https://picsum.photos/seed/metricboard-cover/800/500',
    gallery:     [
      'https://picsum.photos/seed/metricboard-g1/800/500',
      'https://picsum.photos/seed/metricboard-g2/800/500',
      'https://picsum.photos/seed/metricboard-g3/800/500',
    ],
    videoUrl:    null,
    version:     '2.2.0',
    supportedOS: ['Web (any modern browser)', 'iOS 15+', 'Android 9+'],
    requirements:'Internet connection · Modern browser or mobile app',
    features:    [
      '40+ chart types including Sankey, heatmap, waterfall',
      'Live refresh (1-minute intervals)',
      'Threshold alerts via email and Slack',
      'Drag-and-drop dashboard builder',
      'Embeddable dashboard widgets',
      'Public shareable links',
      'Row-level data permissions',
      'CSV and PDF dashboard export',
    ],
    downloadUrl: null,
    demoUrl:     null,
    price:       price(null),
    isFree:      false,
    changelog:   [
      {
        version: '2.2.0',
        date:    '2024-11-25',
        notes:   ['New Sankey and waterfall chart types', 'Slack alert integration', 'Embeddable dashboard widgets'],
      },
      {
        version: '2.1.0',
        date:    '2024-09-30',
        notes:   ['Row-level data permissions', 'Public shareable links', 'Mobile app refresh'],
      },
    ],
    whatsapp:    WA,
    email:       EMAIL,
    isFeatured:  false,
    isNew:       true,
    publishedAt: '2024-11-25',
  },
]

export const DEMO_SOFTWARE_MAP = Object.fromEntries(
  DEMO_SOFTWARE_PRODUCTS.map((p) => [p.slug, p])
)
