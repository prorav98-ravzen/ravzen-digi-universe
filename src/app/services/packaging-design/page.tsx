import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const path = '/services/packaging-design'

export const metadata: Metadata = {
  title: { absolute: 'Packaging Design Sri Lanka | RAVZEN' },
  description: 'Product packaging, food labels, box artwork and print-ready packaging layouts for Sri Lankan brands. View RAVZEN projects and request a custom design quote.',
  alternates: { canonical: path },
  openGraph: {
    title: 'Packaging Design in Sri Lanka | RAVZEN',
    description: 'Packaging, labels and print-ready box artwork for Sri Lankan businesses.',
    url: new URL(path, SITE_CONFIG.url).toString(),
    type: 'website',
  },
}

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Creative Services</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Packaging Design</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/65">Premium product labels, boxes and print-ready packaging artwork.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/#contact" className="rounded-full bg-orange-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-300">Get a Quote</Link>
          <Link href="/#work" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/50">View Our Work</Link>
        </div>
        <section aria-labelledby="service-details" className="mt-16 space-y-7 text-white/75">
          <h2 id="service-details" className="text-2xl font-semibold text-white">Packaging and label design services</h2>
          <p className="leading-8">Packaging needs to communicate your product clearly while working within real print and production requirements. RAVZEN creates packaging visuals for brands that need an attractive, consistent presentation across product ranges.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Product labels and wrappers</h3>
              <p className="mt-2 text-sm leading-7">Visual layouts for product names, brand marks, ingredients and other supplied packaging information.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Box and carton artwork</h3>
              <p className="mt-2 text-sm leading-7">Design compositions for packaging panels, product images and promotional messages.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Print-focused layout preparation</h3>
              <p className="mt-2 text-sm leading-7">Attention to layout dimensions, artwork placement and production specifications provided by the printer.</p>
            </div>
          </div>
          <p className="leading-8">For an accurate packaging design discussion, prepare the package dimensions, dieline if available, product information, preferred visual style and printing requirements.</p>
        </section>
        <div className="mt-24 border-t border-white/10 pt-6">
          <Link href="/explore" className="text-sm text-white/60 transition-colors hover:text-orange-400">← Explore more services</Link>
        </div>
      </div>
    </main>
  )
}
