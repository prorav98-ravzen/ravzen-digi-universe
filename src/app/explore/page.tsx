import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'Design Services & Resources | RAVZEN' },
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
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-orange-400 hover:underline">← RAVZEN Creative Studio</Link>
        <h1 className="mt-16 text-4xl font-semibold tracking-tight sm:text-5xl">Explore RAVZEN</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/65">Creative design services and free resources for brands, businesses and designers in Sri Lanka.</p>
        <nav aria-label="Explore RAVZEN pages" className="mt-12 grid gap-3 sm:grid-cols-2">
          {links.map(link => (
            <Link key={link.href} href={link.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-orange-400/70 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
              <h2 className="text-lg font-medium group-hover:text-orange-400">{link.name} →</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{link.description}</p>
            </Link>
          ))}
        </nav>
        <section aria-labelledby="explore-studio" className="mt-14 space-y-5 text-white/70">
          <h2 id="explore-studio" className="text-2xl font-semibold text-white">RAVZEN Graphic — Creative Design in Sri Lanka</h2>
          <p className="leading-8">RAVZEN Graphic, also known as RAVZEN DiGi Universe, is a creative studio based in Bibile, Sri Lanka. This directory helps businesses and designers find the studio's main design services, portfolio and educational resources in one place.</p>
          <p className="leading-8">For a new brand, explore logo design and visual identity. For products going to market, explore packaging and label artwork. Businesses preparing Facebook or Instagram campaigns can find social media design services. Designers and students can also browse the available font resources.</p>
          <h3 className="text-lg font-semibold text-white">How to get started</h3>
          <p className="leading-8">Choose the service that matches your project, review the relevant work, and contact RAVZEN with your business name, design requirements, preferred visual style and intended use. This helps the studio understand whether your artwork is for print, digital publishing or both.</p>
        </section>
        <p className="mt-12 text-sm text-white/60">Ready to discuss a design project? <Link href="/#contact" className="font-semibold text-orange-400 hover:underline">Get in touch with RAVZEN</Link>.</p>
      </div>
    </main>
  )
}
