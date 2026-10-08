/**
 * Design Zone — structured demo data.
 *
 * PURPOSE: Provide realistic content while Supabase is not yet wired.
 *
 * ISOLATION CONTRACT:
 *   DesignZone.tsx imports from '@/data/design/demoProjects' TODAY.
 *   Phase 4 replaces this import with a call to the data-access layer
 *   that returns the same DesignProject[] shape from Supabase.
 *   Nothing else changes in the UI.
 *
 * IMAGES: Using picsum.photos deterministic seed URLs so the same
 *   image always loads for the same project — no flickering.
 *   Replace with real Supabase Storage URLs in Phase 4.
 *
 * One project per category. Ten total.
 */

import type { DesignProject } from '@/types/design'

// Helper so price objects are concise to write
function price(amount: number | null, currency = 'USD'): DesignProject['price'] {
  if (amount === null) return { amount: null, currency, label: 'Contact for quote' }
  if (amount === 0)    return { amount: 0,    currency, label: 'Free'              }
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' }
  return { amount, currency, label: `${sym[currency] ?? currency}${amount}` }
}

const WHATSAPP = '2348000000000'   // replace with real number in production
const EMAIL    = 'design@ravzen.com'

export const DEMO_DESIGN_PROJECTS: DesignProject[] = [
  // ── Logo Design ────────────────────────────────────────────────────────────
  {
    id:          'ldp-001',
    slug:        'nexus-tech-logo',
    title:       'Nexus Tech — Brand Identity',
    category:    'logo-design',
    shortDesc:   'Minimal wordmark and icon system for a deep-tech startup.',
    fullDesc:    'A complete logo system designed for Nexus Tech. The mark combines a geometric neural-network motif with a clean sans-serif wordmark. Delivered in full colour, monochrome, and reversed variants with a compact brand guide covering spacing, clear space, and incorrect usage rules.',
    coverImage:  'https://picsum.photos/seed/nexus-logo/800/600',
    gallery:     [
      'https://picsum.photos/seed/nexus-logo-2/800/600',
      'https://picsum.photos/seed/nexus-logo-3/800/600',
    ],
    year:        2024,
    client:      'Nexus Tech Ltd',
    price:       price(280),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  true,
    tags:        ['logo', 'tech', 'minimal', 'geometric'],
  },

  // ── Branding ───────────────────────────────────────────────────────────────
  {
    id:          'brn-001',
    slug:        'sol-cafe-brand',
    title:       'Sol Café — Full Brand System',
    category:    'branding',
    shortDesc:   'Warm, artisan café branding from identity to collateral.',
    fullDesc:    'Brand strategy and visual identity for Sol Café — a specialty coffee concept. Scope included logo, colour palette, typography selection, packaging mockups (cups, bags, sleeves), menu design, staff apparel, and social media template pack.',
    coverImage:  'https://picsum.photos/seed/sol-cafe/800/600',
    gallery:     [
      'https://picsum.photos/seed/sol-cafe-2/800/600',
      'https://picsum.photos/seed/sol-cafe-3/800/600',
      'https://picsum.photos/seed/sol-cafe-4/800/600',
    ],
    year:        2024,
    client:      'Sol Café',
    price:       price(750),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  true,
    tags:        ['branding', 'café', 'packaging', 'collateral'],
  },

  // ── Social Media ───────────────────────────────────────────────────────────
  {
    id:          'smd-001',
    slug:        'apex-social-kit',
    title:       'Apex Fitness — Social Media Kit',
    category:    'social-media',
    shortDesc:   '30-template Instagram kit with Reels covers and Stories.',
    fullDesc:    'A complete social media design system for Apex Fitness. Includes 30 editable post templates, 12 Reels cover designs, 8 Stories layouts, a highlight icon set, and a colour-coded content calendar. All files delivered in Canva and Figma formats.',
    coverImage:  'https://picsum.photos/seed/apex-social/800/600',
    gallery:     [
      'https://picsum.photos/seed/apex-social-2/800/600',
      'https://picsum.photos/seed/apex-social-3/800/600',
    ],
    year:        2024,
    client:      'Apex Fitness Hub',
    price:       price(180),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['social-media', 'instagram', 'fitness', 'templates'],
  },

  // ── Posters ────────────────────────────────────────────────────────────────
  {
    id:          'pst-001',
    slug:        'nova-music-poster',
    title:       'NOVA Music Festival — Event Poster Series',
    category:    'posters',
    shortDesc:   'Cinematic poster series for a 3-day electronic music festival.',
    fullDesc:    'A set of six A2 event posters for the NOVA Music Festival. Each night of the 3-day event received two poster variants — a key-art hero version and a lineup announcement version. The design language draws from cosmic energy and analogue synth aesthetics.',
    coverImage:  'https://picsum.photos/seed/nova-poster/800/600',
    gallery:     [
      'https://picsum.photos/seed/nova-poster-2/800/600',
      'https://picsum.photos/seed/nova-poster-3/800/600',
    ],
    year:        2023,
    client:      'NOVA Festival',
    price:       price(320),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['poster', 'music', 'festival', 'print'],
  },

  // ── Product Design ─────────────────────────────────────────────────────────
  {
    id:          'prd-001',
    slug:        'luma-water-bottle',
    title:       'Luma — Smart Water Bottle Packaging',
    category:    'product-design',
    shortDesc:   'Industrial design concept and packaging for a hydration device.',
    fullDesc:    'Product design and packaging concept for the Luma smart water bottle. Work covered form exploration sketches, 3D concept renders, surface graphics system, retail box design (front/back/sides), and unboxing experience design including inner tray and insert card.',
    coverImage:  'https://picsum.photos/seed/luma-bottle/800/600',
    gallery:     [
      'https://picsum.photos/seed/luma-bottle-2/800/600',
      'https://picsum.photos/seed/luma-bottle-3/800/600',
    ],
    year:        2024,
    client:      'Luma Wellness',
    price:       price(null),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['product', 'packaging', '3D', 'consumer'],
  },

  // ── UI/UX ──────────────────────────────────────────────────────────────────
  {
    id:          'uux-001',
    slug:        'finflow-dashboard',
    title:       'FinFlow — Finance Dashboard UI',
    category:    'ui-ux',
    shortDesc:   'Dark-mode fintech dashboard — research, wireframes, hi-fi Figma.',
    fullDesc:    'End-to-end UX for FinFlow, a personal finance SaaS. Scope: user research synthesis, information architecture, low-fi wireframes, interactive prototype, and production-ready Figma components covering 45 screens across dashboard, transactions, budgets, investments, and settings.',
    coverImage:  'https://picsum.photos/seed/finflow-ui/800/600',
    gallery:     [
      'https://picsum.photos/seed/finflow-ui-2/800/600',
      'https://picsum.photos/seed/finflow-ui-3/800/600',
      'https://picsum.photos/seed/finflow-ui-4/800/600',
    ],
    year:        2024,
    client:      'FinFlow Inc.',
    price:       price(1200),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  true,
    tags:        ['ui-ux', 'figma', 'fintech', 'dashboard', 'dark-mode'],
  },

  // ── Illustration ───────────────────────────────────────────────────────────
  {
    id:          'ill-001',
    slug:        'cosmos-illustration',
    title:       'Cosmos — Editorial Illustration Series',
    category:    'illustration',
    shortDesc:   'Six-piece digital illustration series for a science magazine.',
    fullDesc:    'A commissioned editorial illustration series for Cosmos Magazine\'s annual "Future of Space" issue. Six full-page digital illustrations exploring themes of deep space exploration, first contact, and human settlement on Mars. Each piece uses a limited palette of 4 colours for visual coherence.',
    coverImage:  'https://picsum.photos/seed/cosmos-ill/800/600',
    gallery:     [
      'https://picsum.photos/seed/cosmos-ill-2/800/600',
      'https://picsum.photos/seed/cosmos-ill-3/800/600',
    ],
    year:        2023,
    client:      'Cosmos Magazine',
    price:       price(450),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['illustration', 'editorial', 'space', 'digital'],
  },

  // ── Artwork ────────────────────────────────────────────────────────────────
  {
    id:          'art-001',
    slug:        'neon-city-artwork',
    title:       'Neon City — Generative Art Print',
    category:    'artwork',
    shortDesc:   'Limited-edition generative digital art print, signed edition of 50.',
    fullDesc:    'Neon City is a generative digital artwork exploring the hypnotic geometry of fictional urban grids at night. Created using a custom algorithm that builds the composition iteratively. Available as a signed archival print in two sizes (A2 and 50×70cm) and as a digital edition with certificate of authenticity.',
    coverImage:  'https://picsum.photos/seed/neon-city/800/600',
    gallery:     [
      'https://picsum.photos/seed/neon-city-2/800/600',
      'https://picsum.photos/seed/neon-city-3/800/600',
    ],
    year:        2024,
    client:      null,
    price:       price(95),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['artwork', 'generative', 'print', 'limited-edition'],
  },

  // ── Marketing Design ───────────────────────────────────────────────────────
  {
    id:          'mkt-001',
    slug:        'orbit-launch-campaign',
    title:       'Orbit — Product Launch Campaign',
    category:    'marketing',
    shortDesc:   'Full visual campaign for a consumer app launch across 6 channels.',
    fullDesc:    'Integrated marketing design for the launch of Orbit, a habit-tracking app. Deliverables: hero campaign art direction, digital ad creatives in 12 sizes (Meta, Google, LinkedIn), App Store/Play Store graphics (icon, screenshots, feature graphic), landing page design, and email campaign templates.',
    coverImage:  'https://picsum.photos/seed/orbit-campaign/800/600',
    gallery:     [
      'https://picsum.photos/seed/orbit-campaign-2/800/600',
      'https://picsum.photos/seed/orbit-campaign-3/800/600',
    ],
    year:        2024,
    client:      'Orbit Labs',
    price:       price(890),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  true,
    tags:        ['marketing', 'campaign', 'app-store', 'ads'],
  },

  // ── Other ──────────────────────────────────────────────────────────────────
  {
    id:          'oth-001',
    slug:        'ravzen-motion-kit',
    title:       'RAVZEN Internal — Motion Design Kit',
    category:    'other',
    shortDesc:   'Internal animated icon set and motion template library.',
    fullDesc:    'An internal motion design kit built for the RAVZEN team. Includes 80 animated Lottie icons across five semantic categories, a set of transition templates for presentation decks, and a compositing guide for social video content. Available under a commercial licence for external clients on request.',
    coverImage:  'https://picsum.photos/seed/ravzen-motion/800/600',
    gallery:     [
      'https://picsum.photos/seed/ravzen-motion-2/800/600',
    ],
    year:        2024,
    client:      'RAVZEN',
    price:       price(0),
    whatsapp:    WHATSAPP,
    email:       EMAIL,
    externalUrl: null,
    isFeatured:  false,
    tags:        ['motion', 'lottie', 'icons', 'internal'],
  },
]

/** Convenience lookup */
export const DEMO_PROJECT_MAP = Object.fromEntries(
  DEMO_DESIGN_PROJECTS.map((p) => [p.slug, p])
)
