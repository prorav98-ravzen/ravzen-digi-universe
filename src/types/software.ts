/**
 * Software Zone — domain types.
 *
 * VIEW MODEL shapes used by all UI components.
 * When Supabase is wired (Phase 6+) the data-access layer
 * maps DbSoftwareProduct → SoftwareProduct before returning here.
 *
 * Nothing in the UI layer ever imports from Supabase directly.
 */

// ── Shared changelog (re-used from android pattern) ──────────────────────────
// Defined here to avoid circular imports between android.ts and software.ts.

export interface ChangelogEntry {
  version: string
  date:    string   // ISO date string
  notes:   string[]
}

// ── Categories ────────────────────────────────────────────────────────────────

export type SoftwareCategory =
  | 'desktop'
  | 'web-tool'
  | 'saas'
  | 'automation'
  | 'data-analytics'

export const SOFTWARE_CATEGORIES: { key: SoftwareCategory; label: string }[] = [
  { key: 'desktop',        label: 'Desktop App'    },
  { key: 'web-tool',       label: 'Web Tool'       },
  { key: 'saas',           label: 'SaaS'           },
  { key: 'automation',     label: 'Automation'     },
  { key: 'data-analytics', label: 'Data & Analytics' },
]

// ── Price ─────────────────────────────────────────────────────────────────────

export interface PriceInfo {
  amount:   number | null   // null = contact for quote
  currency: string          // 'USD' | 'NGN' | 'free'
  label:    string          // pre-formatted: "Free" | "$49" | "Contact"
}

// ── SoftwareProduct — UI view model ──────────────────────────────────────────
// Shape mirrors the planned Supabase row — mapper is a trivial rename.

export interface SoftwareProduct {
  id:              string
  slug:            string
  name:            string
  tagline:         string        // one-line pitch
  category:        SoftwareCategory
  shortDesc:       string
  fullDesc:        string

  // Media
  coverImage:      string        // hero image URL
  gallery:         string[]      // additional screenshot/image URLs
  videoUrl:        string | null // demo video URL

  // Technical metadata
  version:         string
  supportedOS:     string[]      // e.g. ['Windows 10+', 'macOS 12+', 'Linux']
  requirements:    string        // system requirements as plain text
  features:        string[]      // bullet point list

  // Distribution
  downloadUrl:     string | null // direct installer download
  demoUrl:         string | null // web demo / live preview

  // Pricing
  price:           PriceInfo
  isFree:          boolean

  // Changelog
  changelog:       ChangelogEntry[]

  // Contact
  whatsapp:        string | null
  email:           string | null

  // Flags
  isFeatured:      boolean
  isNew:           boolean
  publishedAt:     string        // ISO date
}
