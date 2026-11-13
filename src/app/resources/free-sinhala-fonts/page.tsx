import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/resources/free-sinhala-fonts'
export const metadata: Metadata = {
  title: { absolute: 'Free Sinhala Fonts Collection | RAVZEN' },
  description: 'Explore RAVZEN’s free font resources for creative projects, including Sinhala, English and Tamil font collections. Check font licenses before commercial use.',
  alternates: { canonical: route },
  openGraph: {
    title: 'Free Sinhala Fonts Collection | RAVZEN',
    description: 'Discover free Sinhala, English and Tamil font resources at RAVZEN Creative Studio.',
    url: new URL(route, SITE_CONFIG.url).toString(),
    type: 'website',
  },
}

export default function FreeSinhalaFontsPage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Free Resources</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Free Sinhala Fonts</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/65">Explore Sinhala, English and Tamil font resources for your next creative project.</p>
        <Link href="/#resources" className="mt-9 inline-block rounded-full bg-orange-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-300">Explore Fonts</Link>
        <p className="mt-8 max-w-xl text-xs leading-6 text-white/45">Please check each font’s license before commercial use.</p>
        <section className="mt-14 space-y-5 text-white/75" aria-labelledby="font-guide">
          <h2 id="font-guide" className="text-2xl font-semibold text-white">Choosing Sinhala fonts for design</h2>
          <p className="leading-8">Sinhala typography can be used in posters, educational materials, invitations, labels and digital graphics. Before choosing a font, check that its Sinhala letters, vowel signs and combined characters display correctly in your preferred design software. Test a complete sentence rather than only a few individual letters.</p>
          <h3 className="text-lg font-semibold text-white">Font licensing and practical checks</h3>
          <p className="leading-8">A font that is free to download is not necessarily licensed for commercial use. Read the license provided with each font and check whether printing, client projects, embedding or redistribution are permitted. Keep the original license information with downloaded font files.</p>
          <p className="leading-8">For print work, inspect readability at the intended size and confirm that exported PDF artwork preserves the correct glyphs. For websites and digital projects, check language support, loading performance and compatibility across devices. You can browse the font resources available in the RAVZEN website's Resources section.</p>
        </section>
        <div className="mt-24 border-t border-white/10 pt-6"><Link href="/explore" className="text-sm text-white/60 hover:text-orange-400">← Explore more resources</Link></div>
      </div>
    </main>
  )
}
