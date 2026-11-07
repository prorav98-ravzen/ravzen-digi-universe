import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const path = '/services/packaging-design'

export const metadata: Metadata = {
  title: 'Packaging Design in Sri Lanka | RAVZEN Creative Studio',
  description: 'Custom packaging design, product labels, box artwork and print-ready packaging layouts for Sri Lankan brands. Explore RAVZEN Creative Studio and request a quote.',
  alternates: { canonical: path },
  openGraph: {
    title: 'Packaging Design in Sri Lanka | RAVZEN',
    description: 'Packaging, labels and print-ready box artwork for Sri Lankan businesses.',
    url: new URL(path, SITE_CONFIG.url).toString(),
    type: 'website',
  },
}

export default function PackagingDesignPage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <p className="mt-14 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Design Services · Sri Lanka</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Packaging Design in Sri Lanka</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">Distinctive packaging and product labels that help your brand stand out, with careful attention to print production.</p>
        <Link href="/#contact" className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">Request a design quote</Link>
        <section className="mt-20" aria-labelledby="services-title">
          <h2 id="services-title" className="text-2xl font-semibold">What we design</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ['Product labels', 'Clear, attractive label layouts for products and retail packaging.'],
              ['Box packaging', 'Custom artwork for cartons, boxes and product presentation.'],
              ['Food packaging', 'Packaging visuals designed around your product and audience.'],
              ['Print-ready artwork', 'Layouts prepared with print specifications and supplier requirements in mind.'],
            ].map(([name, description]) => (
              <li key={name} className="rounded-xl border border-white/15 bg-white/5 p-5">
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{description}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-16 max-w-2xl" aria-labelledby="process-title">
          <h2 id="process-title" className="text-2xl font-semibold">How to get started</h2>
          <p className="mt-4 leading-relaxed text-gray-300">Share your product type, packaging dimensions, logo, required text and any printer or cutting-machine specifications. We can discuss the design direction and prepare a quote based on your requirements.</p>
          <Link href="/#contact" className="mt-6 inline-block font-semibold text-orange-400 hover:underline">Contact RAVZEN to discuss your packaging →</Link>
        </section>
      </div>
    </main>
  )
}
