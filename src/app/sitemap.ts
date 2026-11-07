import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site'

/** Only list confirmed, canonical public pages. Add individual artwork URLs
 * when stable server-rendered routes are available. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: SITE_CONFIG.url,
    changeFrequency: 'weekly',
    priority: 1,
  }]
}
