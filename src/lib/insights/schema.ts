import { z } from 'zod'

const text = (min: number, max: number) => z.string().trim().min(min).max(max).refine(v => !/[<>]/.test(v), 'HTML is not allowed')
export const articleSchema = z.object({
  title: text(15, 180), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  excerpt: text(60, 320), category: z.enum(['AI', 'Software', 'Design', 'Technology']),
  sections: z.array(z.object({ heading: text(5, 150), paragraphs: z.array(text(50, 3000)).min(1).max(5) })).min(4).max(8),
  takeaways: z.array(text(15, 400)).min(3).max(5),
}).strict()
export type ArticleBody = z.infer<typeof articleSchema>
export type Article = ArticleBody & { id: string; published_at: string; source_url: string; source_title: string; source_name: string; source_published_at: string; reading_minutes: number }

export function validateArticle(input: unknown): ArticleBody {
  const article = articleSchema.parse(input)
  const prose = [article.title, article.excerpt, ...article.sections.flatMap(s => [s.heading, ...s.paragraphs]), ...article.takeaways].join(' ')
  const letters = prose.match(/\p{L}/gu) ?? []
  const sinhala = prose.match(/[\u0D80-\u0DFF]/g) ?? []
  if (sinhala.length / Math.max(letters.length, 1) < 0.55) throw new Error('quality_language')
  const words = prose.split(/\s+/).length
  if (words < 450 || words > 1600) throw new Error('quality_length')
  return article
}

export function publicationSlot(now = new Date()) {
  const local = new Date(now.getTime() + 330 * 60_000)
  if (local.getUTCDay() !== 6) return null
  const date = local.toISOString().slice(0, 10)
  const publishAt = `${date}T03:30:00.000Z`
  const delta = now.getTime() - Date.parse(publishAt)
  if (delta < -15 * 60_000 || delta > 60 * 60_000) return null
  return { week: date, publishAt }
}

export function overlapsSource(article: ArticleBody, source: string) {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  const sourceWords = normalize(source)
  const runs = new Set(sourceWords.slice(0, -11).map((_, i) => sourceWords.slice(i, i + 12).join(' ')))
  const words = normalize(article.sections.flatMap(s => s.paragraphs).join(' '))
  return words.some((_, i) => runs.has(words.slice(i, i + 12).join(' ')))
}
