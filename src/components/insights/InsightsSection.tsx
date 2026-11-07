import Link from 'next/link'
import { listArticles } from '@/lib/insights/data'
export default async function InsightsSection() {
  let articles: Awaited<ReturnType<typeof listArticles>> = []
  let unavailable = false
  try { articles = await listArticles(3) } catch { unavailable = true }
  return <section id="tech-insights" className="mx-auto max-w-7xl px-5 py-24 md:px-10">
    <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Ideas for what comes next</p>
    <div className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-5"><h2 className="text-3xl font-black md:text-5xl">RAVZEN Tech Insights<span className="text-fuchsia-400">.</span></h2><Link href="/tech-insights" className="rounded-full border border-white/25 px-5 py-3 text-sm hover:bg-white/10">සියලු ලිපි බලන්න ↗</Link></div>
    <p lang="si" className="mb-8 max-w-2xl leading-8 text-white/65">තාක්ෂණය, AI සහ නිර්මාණශීලීත්වය ගැන විශ්වාසදායක මූලාශ්‍ර ඇසුරින් සකස් කරන සිංහල ලිපි.</p>
    <div className="grid gap-5 md:grid-cols-3">{articles.map(article => <Link key={article.id} href={`/tech-insights/${article.slug}`} className="rounded-2xl border border-white/10 bg-white/[.03] p-6 transition hover:border-[var(--studio-accent)]"><p className="text-xs uppercase tracking-widest text-fuchsia-300">{article.category} · {article.reading_minutes} min</p><h3 lang="si" className="mt-4 text-xl font-bold leading-relaxed">{article.title}</h3><p lang="si" className="mt-3 text-sm leading-7 text-white/60">{article.excerpt}</p><span className="mt-5 inline-block text-sm text-fuchsia-300">ලිපිය කියවන්න ↗</span></Link>)}</div>
    {!articles.length && <p lang="si" className="rounded-2xl border border-white/10 p-6 leading-8 text-white/60">{unavailable ? 'ලිපි ලබාගැනීමට තාවකාලික බාධාවක් තිබෙනවා. නැවත උත්සාහ කරන්න.' : 'පළමු Tech Insights ලිපිය ළඟදීම මෙහි පළ වේ.'}</p>}
  </section>
}
