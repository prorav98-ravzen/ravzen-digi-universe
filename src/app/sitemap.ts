import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site'

/** Only include real, public, canonical routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
