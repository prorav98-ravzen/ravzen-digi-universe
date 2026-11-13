import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_CONFIG } from '@/config/site'

const route = '/services/logo-design'
export const metadata: Metadata = {
  title: { absolute: 'Logo Design Sri Lanka | RAVZEN' },
  description: 'Custom logo design, brand identity concepts and professional branding artwork for Sri Lankan businesses. Explore the RAVZEN portfolio and request a quote.',
  alternates: { canonical: route },
  openGraph: { title: 'Logo Design in Sri Lanka | RAVZEN', description: 'Professional logo design and brand identity artwork for Sri Lankan businesses. Explore RAVZEN Creative Studio and request a custom logo quote.', url: new URL(route, SITE_CONFIG.url).toString(), type: 'website' },
}

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-[#03040a] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Creative Services</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Logo Design</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/65">Distinctive logos and brand identities, created for your business.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/#contact" className="rounded-full bg-orange-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-300">Get a Quote</Link>
          <Link href="/#work" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/50">View Our Work</Link>
        </div>
        <section aria-labelledby="service-details" className="mt-16 space-y-7 text-white/75">
          <h2 id="service-details" className="text-2xl font-semibold text-white">What our logo design service covers</h2>
          <p className="leading-8">A strong logo helps customers recognise your business across packaging, signage, social media and printed materials. RAVZEN develops custom visual identities with attention to clarity, typography and practical everyday use.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Custom logo concepts</h3>
              <p className="mt-2 text-sm leading-7">Distinctive logo directions designed around your business name, audience and visual preferences.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Brand identity essentials</h3>
              <p className="mt-2 text-sm leading-7">Coordinated typography, colour direction and visual consistency for your business.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.025] p-5">
              <h3 className="font-semibold text-white">Practical applications</h3>
              <p className="mt-2 text-sm leading-7">Logo artwork considered for social media profiles, print materials, packaging and signage.</p>
            </div>
          </div>
          <p className="leading-8">Whether you are launching a new venture or refreshing an existing identity, share your business name, industry and preferred style to discuss a suitable design direction.</p>
        </section>
        <section className="mt-12 space-y-4 text-white/75" aria-label="Design planning guidance">
          <h2 className="text-xl font-semibold text-white">Planning your design brief</h2>
          <p className="leading-8">Logo design decisions start with understanding where a mark will appear: a small social profile image, a printed label, a storefront sign or a business card. Readability at different sizes, balanced lettering and recognisable shapes are practical considerations when reviewing concepts. Before requesting a design, prepare your preferred business name, audience, competitors, reference styles and any existing brand colours. A clear brief makes it easier to discuss a direction that fits both digital and print use.</p>
        </section>
        <div className="mt-24 border-t border-white/10 pt-6">
          <Link href="/explore" className="text-sm text-white/60 transition-colors hover:text-orange-400">← Explore more services</Link>
        </div>
      </div>
    </main>
  )
}
