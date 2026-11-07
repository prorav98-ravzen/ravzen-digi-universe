import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/services/social-media-design'
export const metadata: Metadata = {
  title: 'Social Media Post Design in Sri Lanka | RAVZEN Creative Studio',
  description: 'Creative Facebook and Instagram post designs, promotional artwork and social media advertising graphics for Sri Lankan businesses by RAVZEN.',
  alternates: { canonical: route },
  openGraph: { title: 'Social Media Post Design in Sri Lanka | RAVZEN', description: 'Creative Facebook and Instagram post designs, promotional artwork and social media advertising graphics for Sri Lankan businesses by RAVZEN.', url: new URL(route, SITE_CONFIG.url).toString(), type: 'website' },
}

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Creative Services</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Social Media Design</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/65">Creative social posts and promotional graphics that make an impression.</p>
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
