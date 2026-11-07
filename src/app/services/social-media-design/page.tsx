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
  return <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-4xl">
    <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <Link href="/explore" className="ml-5 text-sm text-orange-400 hover:underline">Explore all services & resources</Link>
    <p className="mt-14 text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">Creative Services · Sri Lanka</p>
    <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Social Media Post Design in Sri Lanka</h1>
    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">Make your brand stand out with purposeful social media graphics for campaigns, products and promotions.</p>
    <Link href="/#contact" className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">Request a design quote</Link>
    <section className="mt-20" aria-labelledby="offerings"><h2 id="offerings" className="text-2xl font-semibold">What we offer</h2>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2"><li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Facebook posts</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Clear promotional designs for your Facebook audience.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Instagram graphics</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Feed and story artwork tailored to your message.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Advertising creatives</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Campaign visuals built around your offer and brand.</p></li>
<li className="rounded-xl border border-white/15 bg-white/5 p-5"><h3 className="text-lg font-semibold">Promotional artwork</h3><p className="mt-2 text-sm leading-relaxed text-gray-300">Graphics for launches, events and seasonal promotions.</p></li></ul></section>
    <section className="mt-16 max-w-2xl"><h2 className="text-2xl font-semibold">Start your project</h2><p className="mt-4 leading-relaxed text-gray-300">Tell us about your business, goals, preferred style and required formats. We can discuss the scope and provide a quote based on your needs.</p><Link href="/#contact" className="mt-6 inline-block font-semibold text-orange-400 hover:underline">Contact RAVZEN →</Link></section>
  </div></main>
}
