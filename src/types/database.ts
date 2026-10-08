/**
 * Database types — exact mirrors of the Supabase schema.
 *
 * Rules:
 * - These are raw DB row shapes, not domain view models.
 * - Domain models live in design.ts / android.ts / software.ts / system.ts.
 * - Enums and shared scalars are defined here first.
 * - Every field name matches the Postgres column name exactly.
 */

// ── Shared scalars ────────────────────────────────────────────────────────────

export type UserRole      = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'
export type PublishStatus = 'draft' | 'published' | 'archived'
export type ZoneKey       = 'design' | 'android' | 'software' | 'system'
export type Currency      = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'AED' | 'INR' | 'free'
export type AdPosition    = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'custom'
export type AdMediaType   = 'image' | 'video' | 'text'
export type AdAnimType    = 'fade' | 'slide' | 'none'
export type EntityType    = 'design' | 'android' | 'software' | 'system' | 'advertisement'
export type ServiceModel  = 'saas' | 'one-time' | 'custom'
export type ProjectStatus = 'active' | 'beta' | 'coming-soon' | 'archived'

export type AnalyticsEvent =
  | 'zone_visit' | 'project_view' | 'app_view' | 'software_view' | 'system_view'
  | 'download_click' | 'whatsapp_click' | 'email_click' | 'cta_click' | 'ad_click'

// ── Profiles ──────────────────────────────────────────────────────────────────

export interface DbProfile {
  id:         string
  email:      string
  full_name:  string | null
  avatar_url: string | null
  role:       UserRole
  is_active:  boolean
  created_at: string
  updated_at: string
}

// ── Categories ────────────────────────────────────────────────────────────────

export interface DbCategory {
  id:          string
  zone:        ZoneKey
  name:        string
  slug:        string
  description: string | null
  sort_order:  number
  created_at:  string
}

// ── Design Projects ───────────────────────────────────────────────────────────

export interface DbDesignProject {
  id:               string
  title:            string
  slug:             string
  category_id:      string | null
  short_description:string | null
  full_description: string | null
  cover_image_url:  string | null
  gallery_urls:     string[] | null
  screenshot_urls:  string[] | null
  video_url:        string | null
  price:            number | null
  currency:         Currency | null
  year:             number | null
  client_name:      string | null
  external_url:     string | null
  whatsapp_number:  string | null
  email_contact:    string | null
  is_featured:      boolean
  status:           PublishStatus
  sort_order:       number
  metadata:         Record<string, unknown> | null
  created_at:       string
  updated_at:       string
}

// ── Android Apps ──────────────────────────────────────────────────────────────

export interface DbAndroidApp {
  id:                    string
  name:                  string
  slug:                  string
  category_id:           string | null
  short_description:     string | null
  full_description:      string | null
  icon_url:              string | null
  cover_image_url:       string | null
  screenshot_urls:       string[] | null
  video_url:             string | null
  apk_url:               string | null
  play_store_url:        string | null
  version:               string | null
  min_android_version:   string | null
  target_android_version:string | null
  file_size_mb:          number | null
  features:              string[] | null
  permissions:           string[] | null
  changelog:             Record<string, unknown>[] | null
  price:                 number | null
  currency:              Currency | null
  is_free:               boolean
  is_featured:           boolean
  status:                PublishStatus
  sort_order:            number
  whatsapp_number:       string | null
  email_contact:         string | null
  demo_request_enabled:  boolean
  created_at:            string
  updated_at:            string
}

// ── Software Products ─────────────────────────────────────────────────────────

export interface DbSoftwareProduct {
  id:                string
  name:              string
  slug:              string
  category_id:       string | null
  short_description: string | null
  full_description:  string | null
  cover_image_url:   string | null
  screenshot_urls:   string[] | null
  gallery_urls:      string[] | null
  video_url:         string | null
  download_url:      string | null
  demo_url:          string | null
  version:           string | null
  supported_os:      string[] | null
  requirements:      string | null
  features:          string[] | null
  installation_info: string | null
  changelog:         Record<string, unknown>[] | null
  price:             number | null
  currency:          Currency | null
  is_free:           boolean
  is_featured:       boolean
  status:            PublishStatus
  sort_order:        number
  whatsapp_number:   string | null
  email_contact:     string | null
  demo_request_enabled:boolean
  created_at:        string
  updated_at:        string
}

// ── Systems ───────────────────────────────────────────────────────────────────

export interface DbSystem {
  id:                string
  name:              string
  slug:              string
  category_id:       string | null
  short_description: string | null
  full_description:  string | null
  cover_image_url:   string | null
  screenshot_urls:   string[] | null
  diagram_urls:      string[] | null
  video_url:         string | null
  features:          string[] | null
  tech_stack:        string[] | null
  service_model:     ServiceModel | null
  project_status:    ProjectStatus | null
  price:             number | null
  currency:          Currency | null
  external_url:      string | null
  is_featured:       boolean
  status:            PublishStatus
  sort_order:        number
  whatsapp_number:   string | null
  email_contact:     string | null
  contact_for_quote: boolean
  created_at:        string
  updated_at:        string
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface DbMedia {
  id:          string
  uploader_id: string
  bucket:      string
  path:        string
  public_url:  string
  filename:    string
  mime_type:   string
  size_bytes:  number
  width:       number | null
  height:      number | null
  alt_text:    string | null
  entity_type: string | null
  entity_id:   string | null
  created_at:  string
}

// ── Ad Slots ──────────────────────────────────────────────────────────────────

export interface DbAdSlot {
  id:          string
  zone:        string        // 'universe' | ZoneKey
  position:    AdPosition
  label:       string
  description: string | null
  is_active:   boolean
  created_at:  string
}

// ── Advertisements ────────────────────────────────────────────────────────────

export interface DbAdvertisement {
  id:             string
  slot_id:        string
  title:          string
  body_text:      string | null
  media_url:      string | null
  media_type:     AdMediaType
  cta_text:       string | null
  cta_url:        string | null
  animation_type: AdAnimType
  priority:       number
  is_active:      boolean
  starts_at:      string | null
  ends_at:        string | null
  created_at:     string
  updated_at:     string
}

// ── Analytics Events ──────────────────────────────────────────────────────────

export interface DbAnalyticsEvent {
  id:          string
  session_id:  string
  event_type:  AnalyticsEvent
  entity_id:   string | null
  entity_type: EntityType | null
  referrer:    string | null
  created_at:  string
}

// ── Active Sessions ───────────────────────────────────────────────────────────

export interface DbActiveSession {
  id:            string
  session_token: string
  last_seen_at:  string
  created_at:    string
}

// ── Site Settings ─────────────────────────────────────────────────────────────

export interface DbSiteSettings {
  id:          string
  key:         string
  value:       string
  description: string | null
  updated_by:  string | null
  updated_at:  string
}
