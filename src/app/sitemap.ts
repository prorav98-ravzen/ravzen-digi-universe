import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_CONFIG.url
  const now  = new Date()

  return [
    // Root — the universe entry
    {
      url:             base,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        1.0,
    },
    // The zone routes all lead back to the experience (SPA),
    // but listing them helps crawlers understand the content structure
    {
      url:             `${base}/zones/design`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${base}/zones/android`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${base}/zones/software`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${base}/zones/system`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
  ]
}
