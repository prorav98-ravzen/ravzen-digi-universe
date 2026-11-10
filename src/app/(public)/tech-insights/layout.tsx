import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
export default async function InsightsLayout({ children }: { children: React.ReactNode }) {
  const db = await createClient()
  const { data } = await db.from('site_settings').select('key,value').in('key',['studio_accent_color','studio_background_color','studio_font_scale'])
  const settings = Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
  const color = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
  return <div className="studio-home min-h-screen text-white" style={{ backgroundColor: color(settings.studio_background_color, '#090910'), ['--studio-font-scale' as string]: Math.max(80, Math.min(125, Number(settings.studio_font_scale) || 100)) / 100, ['--studio-accent' as string]: color(settings.studio_accent_color, '#ff5200') }}>
    <header className="border-b border-white/10"><nav aria-label="Tech Insights navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6"><Link href="/" className="text-lg font-black tracking-[.2em]">RAVZEN<span className="text-[#FF9A62]">.</span></Link><div className="flex gap-6 text-sm text-white/75"><Link href="/">← Studio</Link><Link href="/tech-insights">Tech Insights</Link></div></nav></header>
    <main lang="si" className="mx-auto max-w-6xl px-5 py-12 sm:py-20">{children}</main>
    <footer className="mx-auto max-w-6xl border-t border-white/10 px-5 py-8 text-sm text-white/75">RAVZEN Tech Insights · <Link href="/" className="hover:text-white">Creative Studio ↗</Link></footer>
  </div>
}
