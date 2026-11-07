import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site'

/** Only include real, public, canonical routes. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_CONFIG.url, changeFrequency: 'weekly', priority: 1 },
    { url: new URL('/services/packaging-design', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
