/**
 * Zod validation schemas — server-side security boundaries.
 *
 * Used by:
 *   - API Route Handlers (validate request bodies before DB writes)
 *   - Admin form submissions (client-side pre-validation)
 *
 * Every schema that is used server-side also acts as an injection barrier.
 * Nothing from the client is trusted without parsing through these.
 */

import { z } from 'zod'

// ── Shared primitives ─────────────────────────────────────────────────────────

const SlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')

const UrlSchema   = z.string().url().nullable().optional().or(z.literal('').transform(() => null))
const PriceSchema = z.number().min(0).max(999_999_999).nullable()
const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'NGN', 'AED', 'INR', 'free']).nullable()
const PublishSchema  = z.enum(['draft', 'published', 'archived']).default('draft')

// ── Design Project ────────────────────────────────────────────────────────────

export const DesignProjectSchema = z.object({
  title:            z.string().min(1).max(200),
  slug:             SlugSchema,
  category_id:      z.string().uuid().nullable().optional(),
  short_description:z.string().max(500).nullable().optional(),
  full_description: z.string().max(20_000).nullable().optional(),
  cover_image_url:  UrlSchema,
  gallery_urls:     z.array(z.string().url()).max(30).nullable().optional(),
  screenshot_urls:  z.array(z.string().url()).max(30).nullable().optional(),
  video_url:        UrlSchema,
  price:            PriceSchema,
  currency:         CurrencySchema,
  year:             z.number().int().min(1990).max(2100).nullable().optional(),
  client_name:      z.string().max(200).nullable().optional(),
  external_url:     UrlSchema,
  whatsapp_number:  z.string().max(20).nullable().optional(),
  email_contact:    z.string().email().nullable().optional().or(z.literal('').transform(() => null)),
  is_featured:      z.boolean().default(false),
  status:           PublishSchema,
  sort_order:       z.number().int().min(0).default(0),
})

export type DesignProjectInput = z.infer<typeof DesignProjectSchema>

// ── Android App ───────────────────────────────────────────────────────────────

export const AndroidAppSchema = z.object({
  name:                   z.string().min(1).max(200),
  slug:                   SlugSchema,
  category_id:            z.string().uuid().nullable().optional(),
  short_description:      z.string().max(500).nullable().optional(),
  full_description:       z.string().max(20_000).nullable().optional(),
  icon_url:               UrlSchema,
  cover_image_url:        UrlSchema,
  screenshot_urls:        z.array(z.string().url()).max(30).nullable().optional(),
  video_url:              UrlSchema,
  apk_url:                UrlSchema,
  play_store_url:         UrlSchema,
  version:                z.string().max(30).nullable().optional(),
  min_android_version:    z.string().max(20).nullable().optional(),
  target_android_version: z.string().max(10).nullable().optional(),
  file_size_mb:           z.number().min(0).max(5000).nullable().optional(),
  features:               z.array(z.string().max(500)).max(50).nullable().optional(),
  permissions:            z.array(z.string().max(200)).max(50).nullable().optional(),
  price:                  PriceSchema,
  currency:               CurrencySchema,
  is_free:                z.boolean().default(true),
  is_featured:            z.boolean().default(false),
  status:                 PublishSchema,
  sort_order:             z.number().int().min(0).default(0),
  whatsapp_number:        z.string().max(20).nullable().optional(),
  email_contact:          z.string().email().nullable().optional().or(z.literal('').transform(() => null)),
  demo_request_enabled:   z.boolean().default(false),
})

export type AndroidAppInput = z.infer<typeof AndroidAppSchema>

// ── Software Product ──────────────────────────────────────────────────────────

export const SoftwareProductSchema = z.object({
  name:                 z.string().min(1).max(200),
  slug:                 SlugSchema,
  category_id:          z.string().uuid().nullable().optional(),
  short_description:    z.string().max(500).nullable().optional(),
  full_description:     z.string().max(20_000).nullable().optional(),
  cover_image_url:      UrlSchema,
  screenshot_urls:      z.array(z.string().url()).max(30).nullable().optional(),
  gallery_urls:         z.array(z.string().url()).max(30).nullable().optional(),
  video_url:            UrlSchema,
  download_url:         UrlSchema,
  demo_url:             UrlSchema,
  version:              z.string().max(30).nullable().optional(),
  supported_os:         z.array(z.string().max(100)).max(20).nullable().optional(),
  requirements:         z.string().max(2000).nullable().optional(),
  features:             z.array(z.string().max(500)).max(50).nullable().optional(),
  installation_info:    z.string().max(5000).nullable().optional(),
  price:                PriceSchema,
  currency:             CurrencySchema,
  is_free:              z.boolean().default(false),
  is_featured:          z.boolean().default(false),
  status:               PublishSchema,
  sort_order:           z.number().int().min(0).default(0),
  whatsapp_number:      z.string().max(20).nullable().optional(),
  email_contact:        z.string().email().nullable().optional().or(z.literal('').transform(() => null)),
  demo_request_enabled: z.boolean().default(false),
})

export type SoftwareProductInput = z.infer<typeof SoftwareProductSchema>

// ── System ────────────────────────────────────────────────────────────────────

export const SystemSchema = z.object({
  name:              z.string().min(1).max(200),
  slug:              SlugSchema,
  category_id:       z.string().uuid().nullable().optional(),
  short_description: z.string().max(500).nullable().optional(),
  full_description:  z.string().max(20_000).nullable().optional(),
  cover_image_url:   UrlSchema,
  screenshot_urls:   z.array(z.string().url()).max(30).nullable().optional(),
  diagram_urls:      z.array(z.string().url()).max(20).nullable().optional(),
  video_url:         UrlSchema,
  features:          z.array(z.string().max(500)).max(50).nullable().optional(),
  tech_stack:        z.array(z.string().max(100)).max(50).nullable().optional(),
  service_model:     z.enum(['saas', 'one-time', 'custom']).nullable().optional(),
  project_status:    z.enum(['active', 'beta', 'coming-soon', 'archived']).nullable().optional(),
  price:             PriceSchema,
  currency:          CurrencySchema,
  external_url:      UrlSchema,
  is_featured:       z.boolean().default(false),
  status:            PublishSchema,
  sort_order:        z.number().int().min(0).default(0),
  whatsapp_number:   z.string().max(20).nullable().optional(),
  email_contact:     z.string().email().nullable().optional().or(z.literal('').transform(() => null)),
  contact_for_quote: z.boolean().default(false),
})

export type SystemInput = z.infer<typeof SystemSchema>

// ── Advertisement ─────────────────────────────────────────────────────────────

export const AdvertisementSchema = z.object({
  slot_id:        z.string().uuid(),
  title:          z.string().min(1).max(200),
  body_text:      z.string().max(500).nullable().optional(),
  media_url:      UrlSchema,
  media_type:     z.enum(['image', 'video', 'text']).default('image'),
  cta_text:       z.string().max(100).nullable().optional(),
  cta_url:        UrlSchema,
  animation_type: z.enum(['fade', 'slide', 'none']).default('fade'),
  priority:       z.number().int().min(0).max(100).default(0),
  is_active:      z.boolean().default(true),
  starts_at:      z.string().datetime().nullable().optional(),
  ends_at:        z.string().datetime().nullable().optional(),
})

export type AdvertisementInput = z.infer<typeof AdvertisementSchema>

// ── Site settings update ──────────────────────────────────────────────────────

export const SiteSettingsUpdateSchema = z.object({
  key:   z.string().min(1).max(100),
  value: z.string().max(5000),
})

export type SiteSettingsInput = z.infer<typeof SiteSettingsUpdateSchema>

// ── Media upload ──────────────────────────────────────────────────────────────

export const MediaUploadSchema = z.object({
  entity_type: z.enum(['design', 'android', 'software', 'system', 'advertisement', 'profile']).optional(),
  entity_id:   z.string().uuid().optional(),
  alt_text:    z.string().max(300).optional(),
})

// ── Login ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>
