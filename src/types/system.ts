/**
 * System Zone — domain types.
 *
 * VIEW MODEL shapes used by all UI components.
 * When Supabase is wired (Phase 7+) the data-access layer
 * maps DbSystem → SystemProject before returning here.
 *
 * Nothing in the UI layer ever imports from Supabase directly.
 */

// ── Categories ────────────────────────────────────────────────────────────────

export type SystemCategory =
  | 'pos'
  | 'business'
  | 'management'
  | 'web-system'
  | 'automation'
  | 'custom'
  | 'special'

export const SYSTEM_CATEGORIES: { key: SystemCategory; label: string }[] = [
  { key: 'pos',        label: 'POS Systems'        },
  { key: 'business',   label: 'Business Systems'   },
  { key: 'management', label: 'Management Systems' },
  { key: 'web-system', label: 'Web Systems'        },
  { key: 'automation', label: 'Automation'         },
  { key: 'custom',     label: 'Custom Systems'     },
  { key: 'special',    label: 'Special Projects'   },
]

// ── Price ─────────────────────────────────────────────────────────────────────

export interface PriceInfo {
  amount:   number | null   // null = contact for quote
  currency: string
  label:    string          // "₦1,200,000" | "Contact" | "Free"
}

// ── Project status ────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'active'
  | 'beta'
  | 'coming-soon'
  | 'archived'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'active':       'Active',
  'beta':         'Beta',
  'coming-soon':  'Coming Soon',
  'archived':     'Archived',
}

// ── Service model ─────────────────────────────────────────────────────────────

export type ServiceModel = 'one-time' | 'saas' | 'custom'

// ── Changelog ─────────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  version: string
  date:    string
  notes:   string[]
}

// ── SystemProject — UI view model ─────────────────────────────────────────────
// Shape mirrors the planned Supabase row — mapper is a trivial field rename.

export interface SystemProject {
  id:            string
  slug:          string
  name:          string
  tagline:       string          // one-line pitch
  category:      SystemCategory
  shortDesc:     string
  fullDesc:      string

  // Media
  coverImage:    string          // hero image URL
  screenshots:   string[]        // ordered screenshot URLs
  diagrams:      string[]        // architecture diagram URLs
  videoUrl:      string | null   // demo video URL

  // Technical
  techStack:     string[]        // tech tags: ['React', 'Node.js', 'PostgreSQL', …]
  features:      string[]        // bullet-point feature list
  requirements:  string | null   // system requirements or deployment notes

  // Project metadata
  status:        ProjectStatus
  serviceModel:  ServiceModel
  clientIndustry:string | null   // e.g. "Retail", "Healthcare", "Finance"
  projectYear:   number | null

  // Distribution / contact
  demoUrl:       string | null
  contactUrl:    string | null

  // Pricing
  price:         PriceInfo
  contactForQuote: boolean       // when true, show "Contact for quote" regardless of price

  // Changelog
  changelog:     ChangelogEntry[]

  // Contact
  whatsapp:      string | null
  email:         string | null

  // Flags
  isFeatured:    boolean
  isNew:         boolean
  publishedAt:   string          // ISO date
}
