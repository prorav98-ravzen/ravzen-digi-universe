import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticle } from '@/lib/insights/data'
import { SITE_CONFIG } from '@/config/site'
import ArticleShare from '@/components/insights/ArticleShare'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).slug)
  if (!article) return { title: 'ලිපිය හමු නොවුණි', robots: { index: false, follow: false } }
  const url = `/tech-insights/${article.slug}`
  return { title: article.title, description: article.excerpt, alternates: { canonical: url }, authors: [{ name: 'RAVZEN Tech Insights' }], openGraph: { type: 'article', locale: 'si_LK', title: article.title, description: article.excerpt, url, publishedTime: article.published_at, images: [SITE_CONFIG.ogImage] }, twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt, images: [SITE_CONFIG.ogImage] } }
}
export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).slug)
  if (!article) notFound()
  const url = new URL(`/tech-insights/${article.slug}`, SITE_CONFIG.url).toString()
  const schema = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.excerpt, inLanguage: 'si-LK', datePublished: article.published_at, dateModified: article.published_at, mainEntityOfPage: url, url, image: new URL(SITE_CONFIG.ogImage, SITE_CONFIG.url).toString(), author: { '@type': 'Organization', name: 'RAVZEN Tech Insights', url: SITE_CONFIG.url }, publisher: { '@type': 'Organization', name: 'RAVZEN', url: SITE_CONFIG.url }, citation: article.source_url }
  return <article className="mx-auto max-w-3xl [overflow-wrap:anywhere]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <Link href="/tech-insights" className="inline-block py-2 text-sm text-white/60">← සියලු ලිපි</Link>
    <p className="mt-8 text-xs uppercase tracking-widest text-fuchsia-300">{article.category} · {article.reading_minutes} min read</p><h1 className="mt-5 text-3xl font-black leading-relaxed sm:text-5xl sm:leading-snug">{article.title}</h1>
    <p className="mt-6 text-lg leading-9 text-white/65">{article.excerpt}</p><p className="mt-6 text-sm text-white/50"><time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo', dateStyle: 'long' })}</time> · RAVZEN Tech Insights</p>
    <ArticleShare title={article.title} url={url} />
    <aside className="my-10 rounded-2xl border border-white/10 bg-white/[.03] p-6"><h2 className="font-bold">ලිපියේ අන්තර්ගතය</h2><ol className="mt-4 space-y-3 text-sm leading-7 text-white/70">{article.sections.map((section, i) => <li key={i}><a href={`#section-${i}`} className="hover:underline">{i + 1}. {section.heading}</a></li>)}</ol></aside>
    {article.sections.map((section, i) => <section key={i} id={`section-${i}`} className="mt-10 scroll-mt-8"><h2 className="mb-5 text-2xl font-bold leading-relaxed">{section.heading}</h2>{section.paragraphs.map((paragraph, j) => <p key={j} className="mb-5 text-base leading-[2.15] text-white/80 sm:text-lg">{paragraph}</p>)}</section>)}
    <section className="my-12 rounded-2xl border border-white/15 p-6 sm:p-8"><h2 className="text-xl font-bold text-fuchsia-300">මතක තබාගත යුතු දේ</h2><ul className="mt-5 list-disc space-y-4 pl-5 leading-8 text-white/80">{article.takeaways.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
    <aside className="border-t border-white/10 pt-8"><h2 className="text-lg font-bold">මුල් මූලාශ්‍රය</h2><a href={article.source_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block leading-8 text-fuchsia-300 underline">{article.source_title} ↗</a><p className="mt-3 text-sm text-white/55">{article.source_name} · {new Date(article.source_published_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' })}</p><p className="mt-5 text-sm leading-7 text-white/50">මූලාශ්‍රයේ තොරතුරු ඇසුරින් RAVZEN සඳහා ස්වාධීනව සකස් කළ AI සහාය ලැබූ සිංහල විග්‍රහයකි. ස්වයංක්‍රීය කරුණු පරීක්ෂාවක් භාවිත කර ඇත; මානව සංස්කාරක පරීක්ෂාවක් සිදු කළ බව මෙයින් අදහස් නොවේ.</p></aside>
    <ArticleShare title={article.title} url={url} />
  </article>
}
