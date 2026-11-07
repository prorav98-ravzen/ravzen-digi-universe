import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/services/logo-design'
export const metadata: Metadata = {
  title: 'Logo Design in Sri Lanka | RAVZEN Creative Studio',
  description: 'Professional logo design and brand identity artwork for Sri Lankan businesses. Explore RAVZEN Creative Studio and request a custom logo quote.',
  alternates: { canonical: route },
  openGraph: { title: 'Logo Design in Sri Lanka | RAVZEN', description: 'Professional logo design and brand identity artwork for Sri Lankan businesses. Explore RAVZEN Creative Studio and request a custom logo quote.', url: new URL(route, SITE_CONFIG.url).toString(), type: 'website' },
}

export default function ServicePage() {
  return <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-4xl">
    <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>\n        <Link href="/explore" className="ml-5 text-sm text-orange-400 hover:underline">Explore all services & resources</Link>
    <p className="mt-14 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Creative Services · Sri Lanka</p>
    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Logo Design in Sri Lanka</h1>
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">Build a memorable visual identity with distinctive logo design tailored to your business.</p>
    <Link href="/#contact" className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">Request a design quote</Link>
    <section className="mt-20" aria-labelledby="offerings"><h2 id="offerings" className="text-2xl font-semibold">What we offer</h2>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2"><li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Custom logo concepts</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Visual directions developed around your business identity.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Brand identity</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Consistent colors, typography and supporting brand visuals.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Logo applications</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Artwork suited to digital and print brand touchpoints.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Final artwork</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Delivery specifications discussed based on your usage needs.</p></li></ul></section>
    <section className="mt-16 max-w-2xl"><h2 className="text-2xl font-semibold">Start your project</h2><p className="mt-4 leading-relaxed text-gray-300">Tell us about your business, goals, preferred style and required formats. We can discuss the scope and provide a quote based on your needs.</p><Link href="/#contact" className="mt-6 inline-block font-semibold text-orange-400 hover:underline">Contact RAVZEN →</Link></section>
  </div></main>
}
