/**
 * Design Zone — domain types.
 *
 * These are the VIEW MODEL shapes used by UI components.
 * When Supabase is wired in (Phase 4+) the data-access layer
 * maps DbDesignProject → DesignProject before returning.
 *
 * Nothing in the UI layer ever imports from Supabase directly.
 */

export type DesignCategory =
  | 'logo-design'
  | 'branding'
  | 'social-media'
  | 'posters'
  | 'product-design'
  | 'ui-ux'
  | 'illustration'
  | 'artwork'
  | 'marketing'
  | 'other'

export const DESIGN_CATEGORIES: { key: DesignCategory; label: string }[] = [
  { key: 'logo-design',    label: 'Logo Design'      },
  { key: 'branding',       label: 'Branding'         },
  { key: 'social-media',   label: 'Social Media'     },
  { key: 'posters',        label: 'Posters'          },
  { key: 'product-design', label: 'Product Design'   },
  { key: 'ui-ux',          label: 'UI/UX'            },
  { key: 'illustration',   label: 'Illustration'     },
  { key: 'artwork',        label: 'Artwork'          },
  { key: 'marketing',      label: 'Marketing Design' },
  { key: 'other',          label: 'Other'            },
]

/** Price representation shown to visitors */
export interface PriceInfo {
  amount:   number | null   // null = contact for quote
  currency: string          // 'USD' | 'NGN' | 'free' etc.
  label:    string          // pre-formatted: "Free" | "$120" | "Contact"
}

/**
 * DesignProject — the UI view model.
 * Shape is intentionally identical to the planned Supabase row
 * so the mapper layer is a trivial field rename, not a restructure.
 */
export interface DesignProject {
  id:           string
  slug:         string
  title:        string
  category:     DesignCategory
  shortDesc:    string
  fullDesc:     string
  coverImage:   string        // URL (demo: placeholder service; real: Supabase Storage)
  gallery:      string[]      // additional image URLs
  year:         number | null
  client:       string | null
  price:        PriceInfo
  whatsapp:     string | null // phone number string, no formatting
  email:        string | null
  externalUrl:  string | null
  isFeatured:   boolean
  tags:         string[]
}
