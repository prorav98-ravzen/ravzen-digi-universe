import { listSitemapArticles } from '@/lib/insights/data'
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/config/site'

/** Only include real, public, canonical routes. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fail independently so either content source can remain discoverable.
  const [articleResult, projectResult] = await Promise.allSettled([
    listSitemapArticles(),
    listSitemapProjects(),
  ])
  const articles = articleResult.status === 'fulfilled' ? articleResult.value : []
  const projects = projectResult.status === 'fulfilled' ? projectResult.value : []
  return [
    { url: new URL('/tech-insights', SITE_CONFIG.url).toString(), changeFrequency: 'weekly', priority: 0.8 },
    ...articles.map(article => ({ url: new URL(`/tech-insights/${article.slug}`, SITE_CONFIG.url).toString(), lastModified: article.published_at, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...projects.map(project => ({
      url: new URL(`/projects/${encodeURIComponent(project.slug)}`, SITE_CONFIG.url).toString(),
      ...(project.updated_at ? { lastModified: project.updated_at } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: new URL('/', SITE_CONFIG.url).toString(), changeFrequency: 'weekly', priority: 1 },
    { url: new URL('/about-ravzen', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.9 },
    { url: new URL('/explore', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.9 },
    ...['packaging-design', 'logo-design', 'social-media-design'].map(slug => ({
      url: new URL(`/services/${slug}`, SITE_CONFIG.url).toString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: new URL('/resources/free-sinhala-fonts', SITE_CONFIG.url).toString(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}

/** Use the public client's existing RLS, and never advertise draft projects. */
async function listSitemapProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('design_projects')
    .select('slug,updated_at')
    .eq('status', 'published')
    .order('slug')
    .limit(1000)
    .abortSignal(AbortSignal.timeout(12_000))
  if (error) throw new Error('Sitemap projects temporarily unavailable')
  return data ?? []
}
