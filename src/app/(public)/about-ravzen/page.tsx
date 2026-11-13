import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

export const metadata: Metadata = {
  title: { absolute: 'About RAVZEN Graphic | RAVZEN DiGi Universe Sri Lanka' },
  description: 'Meet RAVZEN Graphic (RAVZEN DiGi Universe), an independent graphic design studio in Bibile, Sri Lanka offering branding, logos, packaging and social media design.',
  alternates: { canonical: '/about-ravzen' },
  openGraph: { title: 'About RAVZEN Graphic — Sri Lankan Design Studio', description: 'RAVZEN Graphic, also known as RAVZEN DiGi Universe, is an independent graphic design studio based in Bibile, Sri Lanka.', url: '/about-ravzen' },
}
const identity = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_CONFIG.url}/about-ravzen#about`,
  url: `${SITE_CONFIG.url}/about-ravzen`,
  name: 'About RAVZEN Graphic',
  mainEntity: { '@type': 'Organization', '@id': `${SITE_CONFIG.url}/#organization`, name: 'RAVZEN Graphic', alternateName: ['RAVZEN', 'RAVZEN DiGi Universe', 'RAVZEN Graphic Design'], url: SITE_CONFIG.url },
}
export default function AboutRavzenPage() {
  return <main className="min-h-screen bg-[#090910] px-5 py-20 text-white sm:py-28">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(identity) }} />
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-orange-300 hover:underline">← RAVZEN Graphic homepage</Link>
      <p className="mt-12 text-sm font-semibold uppercase tracking-[.2em] text-orange-300">Independent creative studio · Bibile, Sri Lanka</p>
      <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">About RAVZEN Graphic</h1>
      <p className="mt-8 text-lg leading-9 text-white/80">RAVZEN Graphic is an independent graphic design studio in Bibile, Sri Lanka. The studio also uses the name RAVZEN DiGi Universe. These names refer to the same creative portfolio and design services presented on this website.</p>
      <h2 className="mt-12 text-2xl font-bold">What RAVZEN Graphic does</h2>
      <p className="mt-5 leading-8 text-white/75">The studio creates visual communication for businesses, products and promotional campaigns. Work includes logo design, brand identity, packaging and product labels, social media artwork, print-ready marketing materials and other graphic design projects. Browse the portfolio to see actual artwork and the range of styles.</p>
      <h2 className="mt-12 text-2xl font-bold">Design services in Sri Lanka</h2>
      <p className="mt-5 leading-8 text-white/75">Based in Bibile, RAVZEN Graphic works on design briefs for businesses and individuals in Sri Lanka. A useful project inquiry includes the intended audience, brand name, required sizes, language, reference materials, deadline and printing or digital publishing requirements.</p>
      <nav aria-label="Explore RAVZEN services" className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-full border border-white/25 px-5 py-3 hover:border-orange-300" href="/services/logo-design">Logo design</Link>
        <Link className="rounded-full border border-white/25 px-5 py-3 hover:border-orange-300" href="/services/packaging-design">Packaging design</Link>
        <Link className="rounded-full border border-white/25 px-5 py-3 hover:border-orange-300" href="/services/social-media-design">Social media design</Link>
        <Link className="rounded-full border border-white/25 px-5 py-3 hover:border-orange-300" href="/explore">Explore the portfolio</Link>
      </nav>
      <h2 className="mt-12 text-2xl font-bold">Find the official RAVZEN Graphic website</h2>
      <p className="mt-5 leading-8 text-white/75">The official portfolio is <a href={SITE_CONFIG.url} className="text-orange-300 underline">ravzen.vercel.app</a>. For new projects, use the contact options on the homepage. You can also follow the studio's <a className="text-orange-300 underline" href="https://www.instagram.com/ravzen_graphic/" target="_blank" rel="noopener noreferrer">Instagram profile</a> for design updates.</p>
    </div>
  </main>
}
