import 'server-only'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Article } from './schema'
export function insightsClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300 }, signal: AbortSignal.timeout(12_000) }) } })
}
export const listArticles = cache(async (limit = 24) => {
  const { data, error } = await insightsClient().from('tech_articles').select('*').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(limit)
  if (error) throw new Error('Articles temporarily unavailable')
  return (data ?? []) as Article[]
})

/** Lightweight public article metadata for the sitemap; avoids downloading full article bodies. */
export const listSitemapArticles = cache(async () => {
  const { data, error } = await insightsClient().from('tech_articles').select('slug,published_at').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).limit(1000)
  if (error) throw new Error('Sitemap articles temporarily unavailable')
  return data ?? []
})
export const getArticle = cache(async (slug: string) => {
  const { data, error } = await insightsClient().from('tech_articles').select('*').eq('slug', slug).lte('published_at', new Date().toISOString()).maybeSingle()
  if (error) throw new Error('Article temporarily unavailable')
  return data as Article | null
})
