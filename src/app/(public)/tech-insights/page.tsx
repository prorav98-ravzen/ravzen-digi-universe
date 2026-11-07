import type { Metadata } from 'next'
import Link from 'next/link'
import { listArticles } from '@/lib/insights/data'
import { SITE_CONFIG } from '@/config/site'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'RAVZEN Tech Insights — සිංහල තාක්ෂණික ලිපි', description: 'AI, software සහ නිර්මාණශීලීත්වය ගැන විශ්වාසදායක මූලාශ්‍ර ඇසුරින් සකස් කරන ස්වාධීන සිංහල තාක්ෂණික ලිපි.', alternates: { canonical: '/tech-insights' }, openGraph: { title: 'RAVZEN Tech Insights', description: 'තාක්ෂණය ගැන අලුතින් සිතන්න.', url: '/tech-insights', locale: 'si_LK', type: 'website', images: [SITE_CONFIG.ogImage] } }
export default async function InsightsPage() {
  const articles = await listArticles(100)
  return <><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Technology · Creativity · Possibility</p><h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">RAVZEN Tech Insights<span className="text-fuchsia-400">.</span></h1><p className="mt-6 max-w-2xl text-lg leading-9 text-white/65">තාක්ෂණයේ අලුත් දේ, අපේ වැඩට වැදගත් වෙන විදිහ. විශ්වාසදායක මුල් මූලාශ්‍ර සමඟ ස්වාධීන සිංහල විග්‍රහයන්.</p>
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{articles.map(article => <article key={article.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs tracking-wider text-fuchsia-300">{article.category} · {article.reading_minutes} min</p><h2 className="mt-4 text-xl font-bold leading-relaxed"><Link href={`/tech-insights/${article.slug}`} className="hover:underline">{article.title}</Link></h2><p className="mt-4 text-sm leading-7 text-white/65">{article.excerpt}</p><p className="mt-5 text-xs text-white/45"><time dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' })}</time> · {article.source_name}</p><Link href={`/tech-insights/${article.slug}`} className="mt-6 inline-block py-2 text-sm font-semibold text-fuchsia-300">ලිපිය කියවන්න ↗</Link></article>)}</div>
    {!articles.length && <div className="mt-12 rounded-2xl border border-white/10 p-8"><h2 className="text-xl font-bold">අලුත් අදහස් ළඟදීම</h2><p className="mt-4 leading-8 text-white/65">පළමු ලිපිය මෙහි පළ වූ පසු ඔබට කියවන්නත් මිතුරන් අතර බෙදාගන්නත් පුළුවන්.</p></div>}
    <p className="mt-12 max-w-3xl text-sm leading-7 text-white/50">මෙම ලිපි AI සහායෙන් සකස් කර ස්වයංක්‍රීය පරීක්ෂාවකට ලක් කෙරේ. වැදගත් තීරණයකට පෙර ලිපියේ දක්වා ඇති මුල් මූලාශ්‍රයත් පරීක්ෂා කරන්න.</p>
  </>
}
