import { z } from 'zod'

export const RESOURCE_KEY = 'digital_resources_catalog'
export const categories = ['PDF Course', 'eBook', 'Template', 'Digital Product'] as const
export function isHttpsUrl(value: string) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}
const optionalUrl = z.string().trim().max(2000).refine(v => !v || isHttpsUrl(v), 'Use a valid HTTPS link')
export const ResourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, 'Add a title').max(160),
  description: z.string().trim().min(1, 'Add a description').max(1200),
  category: z.enum(categories),
  access: z.enum(['free', 'paid']),
  status: z.enum(['available', 'coming-soon']),
  price: z.number().finite().min(0).max(10000000),
  coverUrl: optionalUrl,
  downloadUrl: optionalUrl,
}).superRefine((item, ctx) => {
  if (item.access === 'free' && item.status === 'available' && !item.downloadUrl) ctx.addIssue({code: 'custom', path: ['downloadUrl'], message: 'An available free resource needs a download link'})
  if (item.access === 'paid' && item.downloadUrl) ctx.addIssue({code: 'custom', path: ['downloadUrl'], message: 'Paid download links must stay private. Send them after payment through WhatsApp.'})
  if (item.access === 'paid' && item.status === 'available' && item.price <= 0) ctx.addIssue({code: 'custom', path: ['price'], message: 'Enter the paid product price in LKR'})
})
export const CatalogSchema = z.array(ResourceSchema).max(100).refine(items => new Set(items.map(i => i.id)).size === items.length, 'Duplicate product IDs')
export type Resource = z.infer<typeof ResourceSchema>
export function parseCatalog(raw: string | null | undefined): Resource[] {
  if (!raw) return []
  try { const result = CatalogSchema.safeParse(JSON.parse(raw)); return result.success ? result.data : [] } catch { return [] }
}
export function resourceAction(item: Resource, phone: string): string | null {
  if (item.status !== 'available') return null
  if (item.access === 'free') return isHttpsUrl(item.downloadUrl) ? item.downloadUrl : null
  const digits = phone.replace(/\D/g, '')
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null
  const message = `ආයුබෝවන් RAVZEN! මට "${item.title}" මිලදී ගැනීමට අවශ්‍යයි. මිල: LKR ${item.price.toLocaleString('en-LK')}. ගෙවීම් සහ ලබාගැනීමේ විස්තර එවන්න. (Product: ${item.id})`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
