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
        <div className="mt-24 border-t border-white/10 pt-6">
          <Link href="/explore" className="text-sm text-white/60 transition-colors hover:text-orange-400">← Explore more services</Link>
        </div>
      </div>
    </main>
  )
}
