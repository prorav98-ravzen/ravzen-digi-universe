/**
 * Data-access layer — content (all zones).
 *
 * Architecture:
 *   - All DB queries live here. Components never import Supabase directly.
 *   - These functions run on the SERVER (Server Components / Route Handlers).
 *   - Each function maps the raw DbRow → UI view model before returning.
 *   - The UI types (DesignProject, AndroidApp, etc.) are unchanged from Phase 3–6.
 *   - Swapping from demo data to real data only required updating these functions.
 *
 * Public read: uses the anon client (respects RLS — only published rows).
 * Admin read:  uses the admin client (bypasses RLS — all rows).
 */

import { createClient }         from '../server'
import { getAdminClient }       from '../admin'
import type { DesignProject }   from '@/types/design'
import type { AndroidApp }      from '@/types/android'
import type { SoftwareProduct } from '@/types/software'
import type { SystemProject }   from '@/types/system'
import type {
  DbDesignProject, DbAndroidApp,
  DbSoftwareProduct, DbSystem,
} from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function priceLabel(amount: number | null, currency: string | null): string {
  if (amount === null || currency === null) return 'Contact for quote'
  if (amount === 0 || currency === 'free')  return 'Free'
  const sym: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', AED: 'AED ', INR: '₹' }
  return `${sym[currency] ?? currency}${amount.toLocaleString()}`
}

// ── Design Projects ───────────────────────────────────────────────────────────

function mapDesignProject(r: DbDesignProject & { category?: { name: string } | null }): DesignProject {
  return {
    id:          r.id,
    slug:        r.slug,
    title:       r.title,
    category:    (r.category?.name ?? 'other') as DesignProject['category'],
    shortDesc:   r.short_description ?? '',
    fullDesc:    r.full_description  ?? '',
    coverImage:  r.cover_image_url   ?? '',
    gallery:     r.gallery_urls      ?? [],
    year:        r.year,
    client:      r.client_name,
    price:       { amount: r.price, currency: r.currency ?? 'USD', label: priceLabel(r.price, r.currency) },
    whatsapp:    r.whatsapp_number,
    email:       r.email_contact,
    externalUrl: r.external_url,
    isFeatured:  r.is_featured,
    tags:        [],
  }
}

export async function getPublishedDesignProjects(opts?: { limit?: number; categoryId?: string }): Promise<DesignProject[]> {
  const supabase = await createClient()
  let q = supabase
    .from('design_projects')
    .select('*, category:categories(name)')
    .eq('status', 'published')
    .order('sort_order').order('created_at', { ascending: false })

  if (opts?.categoryId) q = q.eq('category_id', opts.categoryId)
  if (opts?.limit)      q = q.limit(opts.limit)

  const { data, error } = await q
  if (error) throw new Error(`getPublishedDesignProjects: ${error.message}`)
  return (data ?? []).map(mapDesignProject)
}

export async function getAllDesignProjects(): Promise<(DesignProject & { status: string; sortOrder: number })[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('design_projects')
    .select('*, category:categories(name)')
    .order('sort_order').order('created_at', { ascending: false })
  if (error) throw new Error(`getAllDesignProjects: ${error.message}`)
  return (data ?? []).map((r) => ({
    ...mapDesignProject(r),
    status:    r.status,
    sortOrder: r.sort_order,
  }))
}

// ── Android Apps ──────────────────────────────────────────────────────────────

function mapAndroidApp(r: DbAndroidApp & { category?: { name: string } | null }): AndroidApp {
  return {
    id:            r.id,
    slug:          r.slug,
    name:          r.name,
    tagline:       r.short_description ?? '',
    category:      (r.category?.name ?? 'custom') as AndroidApp['category'],
    shortDesc:     r.short_description ?? '',
    fullDesc:      r.full_description  ?? '',
    iconUrl:       r.icon_url          ?? '',
    coverImage:    r.cover_image_url   ?? '',
    screenshots:   r.screenshot_urls   ?? [],
    videoUrl:      r.video_url,
    version:       r.version           ?? '',
    minAndroid:    r.min_android_version    ?? '',
    targetAndroid: r.target_android_version ?? '',
    fileSizeMb:    r.file_size_mb      ?? 0,
    permissions:   r.permissions       ?? [],
    features:      r.features          ?? [],
    apkUrl:        r.apk_url,
    playStoreUrl:  r.play_store_url,
    demoUrl:       null,
    price:         { amount: r.price, currency: r.currency ?? 'USD', label: priceLabel(r.price, r.currency) },
    isFree:        r.is_free,
    changelog:     [],
    whatsapp:      r.whatsapp_number,
    email:         r.email_contact,
    isFeatured:    r.is_featured,
    isNew:         false,
    publishedAt:   r.created_at,
  }
}

export async function getPublishedAndroidApps(opts?: { limit?: number }): Promise<AndroidApp[]> {
  const supabase = await createClient()
  let q = supabase
    .from('android_apps')
    .select('*, category:categories(name)')
    .eq('status', 'published')
    .order('sort_order').order('created_at', { ascending: false })

  if (opts?.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(`getPublishedAndroidApps: ${error.message}`)
  return (data ?? []).map(mapAndroidApp)
}

export async function getAllAndroidApps(): Promise<(AndroidApp & { status: string })[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('android_apps')
    .select('*, category:categories(name)')
    .order('sort_order').order('created_at', { ascending: false })
  if (error) throw new Error(`getAllAndroidApps: ${error.message}`)
  return (data ?? []).map((r) => ({ ...mapAndroidApp(r), status: r.status }))
}

// ── Software Products ─────────────────────────────────────────────────────────

function mapSoftware(r: DbSoftwareProduct & { category?: { name: string } | null }): SoftwareProduct {
  return {
    id:           r.id,
    slug:         r.slug,
    name:         r.name,
    tagline:      r.short_description ?? '',
    category:     (r.category?.name ?? 'desktop') as SoftwareProduct['category'],
    shortDesc:    r.short_description ?? '',
    fullDesc:     r.full_description  ?? '',
    coverImage:   r.cover_image_url   ?? '',
    gallery:      r.gallery_urls      ?? [],
    videoUrl:     r.video_url,
    version:      r.version           ?? '',
    supportedOS:  r.supported_os      ?? [],
    requirements: r.requirements      ?? '',
    features:     r.features          ?? [],
    downloadUrl:  r.download_url,
    demoUrl:      r.demo_url,
    price:        { amount: r.price, currency: r.currency ?? 'USD', label: priceLabel(r.price, r.currency) },
    isFree:       r.is_free,
    changelog:    [],
    whatsapp:     r.whatsapp_number,
    email:        r.email_contact,
    isFeatured:   r.is_featured,
    isNew:        false,
    publishedAt:  r.created_at,
  }
}

export async function getPublishedSoftwareProducts(opts?: { limit?: number }): Promise<SoftwareProduct[]> {
  const supabase = await createClient()
  let q = supabase
    .from('software_products')
    .select('*, category:categories(name)')
    .eq('status', 'published')
    .order('sort_order').order('created_at', { ascending: false })

  if (opts?.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(`getPublishedSoftwareProducts: ${error.message}`)
  return (data ?? []).map(mapSoftware)
}

export async function getAllSoftwareProducts(): Promise<(SoftwareProduct & { status: string })[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('software_products')
    .select('*, category:categories(name)')
    .order('sort_order').order('created_at', { ascending: false })
  if (error) throw new Error(`getAllSoftwareProducts: ${error.message}`)
  return (data ?? []).map((r) => ({ ...mapSoftware(r), status: r.status }))
}

// ── Systems ───────────────────────────────────────────────────────────────────

function mapSystem(r: DbSystem & { category?: { name: string } | null }): SystemProject {
  return {
    id:              r.id,
    slug:            r.slug,
    name:            r.name,
    tagline:         r.short_description ?? '',
    category:        (r.category?.name ?? 'custom') as SystemProject['category'],
    shortDesc:       r.short_description ?? '',
    fullDesc:        r.full_description  ?? '',
    coverImage:      r.cover_image_url   ?? '',
    screenshots:     r.screenshot_urls   ?? [],
    diagrams:        r.diagram_urls      ?? [],
    videoUrl:        r.video_url,
    techStack:       r.tech_stack        ?? [],
    features:        r.features          ?? [],
    requirements:    null,
    status:          (r.project_status   ?? 'active') as SystemProject['status'],
    serviceModel:    (r.service_model    ?? 'custom') as SystemProject['serviceModel'],
    clientIndustry:  null,
    projectYear:     null,
    demoUrl:         null,
    contactUrl:      null,
    price:           { amount: r.price, currency: r.currency ?? 'USD', label: priceLabel(r.price, r.currency) },
    contactForQuote: r.contact_for_quote,
    changelog:       [],
    whatsapp:        r.whatsapp_number,
    email:           r.email_contact,
    isFeatured:      r.is_featured,
    isNew:           false,
    publishedAt:     r.created_at,
  }
}

export async function getPublishedSystems(opts?: { limit?: number }): Promise<SystemProject[]> {
  const supabase = await createClient()
  let q = supabase
    .from('systems')
    .select('*, category:categories(name)')
    .eq('status', 'published')
    .order('sort_order').order('created_at', { ascending: false })

  if (opts?.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(`getPublishedSystems: ${error.message}`)
  return (data ?? []).map(mapSystem)
}

export async function getAllSystems(): Promise<(SystemProject & { status: string })[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('systems')
    .select('*, category:categories(name)')
    .order('sort_order').order('created_at', { ascending: false })
  if (error) throw new Error(`getAllSystems: ${error.message}`)
  return (data ?? []).map((r) => ({ ...mapSystem(r), status: r.status }))
}
