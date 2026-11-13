import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/services/social-media-design'
export const metadata: Metadata = {
  title: { absolute: 'Social Media Design Sri Lanka | RAVZEN' },
  description: 'Custom Facebook and Instagram post designs, promotional graphics and campaign artwork for Sri Lankan businesses. Explore RAVZEN designs and request a quote.',
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
        <section aria-labelledby="service-details" className="mt-16 space-y-7 text-white/75">
          <h2 id="service-details" className="text-2xl font-semibold text-white">Social media creative services</h2>
          <p className="leading-8">Clear, consistent social media visuals help businesses present promotions, products and announcements professionally. RAVZEN designs creative artwork suited to the message, brand identity and intended social platform.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Facebook and Instagram posts</h3>
              <p className="mt-2 text-sm leading-7">Branded promotional posts, product highlights and announcement graphics.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Advertising campaign artwork</h3>
              <p className="mt-2 text-sm leading-7">Visual concepts for offers, launches and marketing messages supplied by the business.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Consistent brand presentation</h3>
              <p className="mt-2 text-sm leading-7">Coordinated colours, typography and visual direction across a series of social designs.</p>
            </div>
          </div>
          <p className="leading-8">Tell us the platform, campaign objective, required text, product images and preferred dimensions so the design can be planned around your message.</p>
        </section>
        <section className="mt-12 space-y-4 text-white/75" aria-label="Design planning guidance">
          <h2 className="text-xl font-semibold text-white">Planning your design brief</h2>
          <p className="leading-8">A useful social media brief identifies the platform, audience, message and desired action. A product launch post may prioritise a clear product image and release details, while a promotion needs readable pricing and dates. Consistent typography, spacing and colours help a series of posts feel connected to the same brand. Provide the exact wording, images, logo and publishing dimensions so each design can be prepared for its intended placement.</p>
        </section>
        <div className="mt-24 border-t border-white/10 pt-6">
          <Link href="/explore" className="text-sm text-white/60 transition-colors hover:text-orange-400">← Explore more services</Link>
        </div>
      </div>
    </main>
  )
}
