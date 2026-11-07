import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Explore Design Services & Free Resources',
  description: 'Explore RAVZEN Creative Studio packaging design, logo design, social media graphics and free Sinhala font resources in Sri Lanka.',
  alternates: { canonical: '/explore' },
}

const links = [
  { href: '/services/packaging-design', name: 'Packaging Design', description: 'Product labels, boxes and print-ready packaging artwork.' },
  { href: '/services/logo-design', name: 'Logo Design', description: 'Distinctive logos and brand identity visuals.' },
  { href: '/services/social-media-design', name: 'Social Media Design', description: 'Facebook, Instagram and promotional graphics.' },
  { href: '/resources/free-sinhala-fonts', name: 'Free Sinhala Fonts', description: 'Explore Sinhala, English and Tamil font resources.' },
]

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <h1 className="mt-14 text-4xl font-bold tracking-tight sm:text-6xl">Explore RAVZEN</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">Creative design services and free resources for brands, businesses and designers in Sri Lanka.</p>
        <nav aria-label="Explore RAVZEN pages" className="mt-12 grid gap-4 sm:grid-cols-2">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="group rounded-xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
              <h2 className="text-xl font-semibold group-hover:text-orange-400">{link.name} →</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{link.description}</p>
            </Link>
          ))}
        </nav>
        <p className="mt-12 text-gray-300">Ready to discuss a design project? <Link href="/#contact" className="font-semibold text-orange-400 hover:underline">Get in touch with RAVZEN</Link>.</p>
      </div>
    </main>
  )
}
