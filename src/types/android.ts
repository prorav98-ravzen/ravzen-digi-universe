/**
 * Android Zone — domain types.
 *
 * VIEW MODEL shapes used by all UI components.
 * When Supabase is wired (Phase 5+) the data-access layer
 * maps DbAndroidApp → AndroidApp before returning here.
 *
 * Nothing in the UI layer ever imports from Supabase directly.
 */

// ── Categories ────────────────────────────────────────────────────────────────

export type AndroidCategory =
  | 'productivity'
  | 'business'
  | 'utility'
  | 'entertainment'
  | 'education'
  | 'custom'

export const ANDROID_CATEGORIES: { key: AndroidCategory; label: string }[] = [
  { key: 'productivity',  label: 'Productivity'  },
  { key: 'business',      label: 'Business'      },
  { key: 'utility',       label: 'Utility'       },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'education',     label: 'Education'     },
  { key: 'custom',        label: 'Custom'        },
]

// ── Price ─────────────────────────────────────────────────────────────────────

export interface PriceInfo {
  amount:   number | null   // null = contact for quote
  currency: string          // 'USD' | 'NGN' | 'free'
  label:    string          // pre-formatted: "Free" | "$4.99" | "Contact"
}

// ── Changelog ─────────────────────────────────────────────────────────────────

export interface ChangelogEntry {
  version: string
  date:    string           // ISO date string
  notes:   string[]
}

// ── AndroidApp — UI view model ────────────────────────────────────────────────
// Shape mirrors the planned Supabase row so the mapper is a trivial rename.

export interface AndroidApp {
  id:               string
  slug:             string
  name:             string
  tagline:          string          // one-line pitch
  category:         AndroidCategory
  shortDesc:        string
  fullDesc:         string

  // Media
  iconUrl:          string          // square app icon
  coverImage:       string          // hero/feature graphic
  screenshots:      string[]        // ordered list of screenshot URLs
  videoUrl:         string | null   // demo video URL (YouTube / direct)

  // Technical metadata
  version:          string
  minAndroid:       string          // e.g. "6.0 (Marshmallow)"
  targetAndroid:    string          // e.g. "14"
  fileSizeMb:       number
  permissions:      string[]        // human-readable list
  features:         string[]        // bullet points shown in detail view

  // Distribution
  apkUrl:           string | null   // direct APK download
  playStoreUrl:     string | null
  demoUrl:          string | null   // web demo / preview

  // Pricing
  price:            PriceInfo
  isFree:           boolean

  // Changelog
  changelog:        ChangelogEntry[]

  // Contact
  whatsapp:         string | null
  email:            string | null

  // Flags
  isFeatured:       boolean
  isNew:            boolean
  publishedAt:      string          // ISO date
}
