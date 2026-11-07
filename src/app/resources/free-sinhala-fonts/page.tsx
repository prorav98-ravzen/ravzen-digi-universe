import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/resources/free-sinhala-fonts'
export const metadata: Metadata = {
  title: 'Free Sinhala Fonts Collection | RAVZEN',
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
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>\n        <Link href="/explore" className="ml-5 text-sm text-orange-400 hover:underline">Explore all services & resources</Link>
        <p className="mt-14 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Free Design Resources</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Free Sinhala Fonts Collection</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">Discover font resources for Sinhala typography and creative design, alongside English and Tamil collections available through RAVZEN.</p>
        <Link href="/#resources" className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">Explore font downloads on RAVZEN</Link>
        <section className="mt-20" aria-labelledby="font-collections">
          <h2 id="font-collections" className="text-2xl font-semibold">Explore the collections</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ['Sinhala fonts', 'Typography options for Sinhala-language design projects.'],
              ['English fonts', 'Display and editorial typefaces for creative layouts.'],
              ['Tamil fonts', 'Fonts for Tamil-language artwork and communication.'],
            ].map(([name, description]) => (
              <li key={name} className="rounded-xl border border-white/15 bg-white/5 p-5">
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{description}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-16 max-w-2xl" aria-labelledby="font-help">
          <h2 id="font-help" className="text-2xl font-semibold">Using fonts responsibly</h2>
          <p className="mt-4 leading-relaxed text-gray-300">Before using a font for client work, branding or commercial printing, check the license provided by its original creator. Free downloads do not always grant commercial-use rights.</p>
          <p className="mt-5 leading-relaxed text-gray-300">Need custom typography or artwork for your brand? <Link href="/#contact" className="font-semibold text-orange-400 hover:underline">Contact RAVZEN Creative Studio</Link>.</p>
        </section>
      </div>
    </main>
  )
}
