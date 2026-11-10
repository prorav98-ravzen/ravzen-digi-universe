import { listSitemapArticles } from '@/lib/insights/data'
import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site'

/** Only include real, public, canonical routes. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: Awaited<ReturnType<typeof listSitemapArticles>> = []
  try { articles = await listSitemapArticles() } catch { /* Existing routes stay available during database outages. */ }
  return [
    { url: new URL('/tech-insights', SITE_CONFIG.url).toString(), changeFrequency: 'weekly', priority: 0.8 },
    ...articles.map(article => ({ url: new URL(`/tech-insights/${article.slug}`, SITE_CONFIG.url).toString(), lastModified: article.published_at, changeFrequency: 'monthly' as const, priority: 0.7 })),
    { url: SITE_CONFIG.url, changeFrequency: 'weekly', priority: 1 },
    { url: new URL('/explore', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.9 },
    ...['packaging-design', 'logo-design', 'social-media-design'].map(slug => ({
      url: new URL(`/services/${slug}`, SITE_CONFIG.url).toString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: new URL('/resources/free-sinhala-fonts', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
