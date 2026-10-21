import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/config/site'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'RAVZEN — Premium Creative Studio',
  description: 'Premium logo design, branding, packaging and visual design by RAVZEN Creative Studio.',
}

type Project = {
  id: string; title: string; slug: string; short_description: string | null;
  cover_image_url: string | null; gallery_urls: string[] | null;
  price: number | null; currency: string | null;
  category: { name: string } | null
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('design_projects')
    .select('id,title,slug,short_description,cover_image_url,gallery_urls,price,currency,category:categories(name)')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  const projects = error ? [] : (data ?? []) as unknown as Project[]
  return (
    <main className="min-h-screen bg-[#090910] text-white selection:bg-fuchsia-500/40">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090910]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10" aria-label="Main navigation">
          <a href="#home" className="text-base font-black tracking-[.2em]">RAVZEN<span className="text-fuchsia-400">.</span></a>
          <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wider text-white/65 md:gap-8">
            <a className="hover:text-white" href="#work">Work</a>
            <a className="hover:text-white" href="#services">Services</a>
            <a className="hover:text-white" href="#contact">Contact</a>
          </div>
        </nav>
      </header>

      <section id="home" className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 pt-24 md:px-10 md:pb-36 md:pt-36">
        <div className="pointer-events-none absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-fuchsia-700/15 blur-3xl" aria-hidden="true" />
        <p className="mb-7 text-xs font-bold uppercase tracking-[.35em] text-fuchsia-300">Independent creative studio · Sri Lanka</p>
        <h1 className="max-w-5xl text-5xl font-black leading-[1.08] tracking-tight md:text-7xl lg:text-8xl">
          Design that makes <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">an impression.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
          Distinctive identities, premium packaging and striking visuals for brands ready to stand apart.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#work" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-fuchsia-100">Explore the work ↗</a>
          <a href="#contact" className="rounded-full border border-white/25 px-7 py-3 text-sm font-bold hover:border-fuchsia-400">Start a project</a>
        </div>
      </section>

      <section id="services" className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3 md:px-10">
          {['Brand Identity & Logos', 'Packaging & Product Labels', 'Social & Marketing Design'].map((name, i) => (
            <div key={name} className="border-l border-fuchsia-400/50 pl-5">
              <span className="text-xs text-fuchsia-300">0{i + 1}</span>
              <h2 className="mt-2 text-lg font-semibold">{name}</h2>
            </div>
          ))}
        </div>
      </section>

      <section id="work" className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Selected work</p>
        <div className="mb-10 mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-black md:text-5xl">The portfolio<span className="text-fuchsia-400">.</span></h2>
          <p className="text-sm text-white/50">{projects.length} published projects</p>
        </div>
        {projects.length ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
              const images = [project.cover_image_url, ...(project.gallery_urls ?? [])].filter((x): x is string => Boolean(x))
              return (
                <article key={project.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151e]">
                  <div className="relative aspect-[4/3] bg-[#242431]">
                    {images[0] && <Image src={images[0]} alt={project.title} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-widest text-fuchsia-300">{project.category?.name ?? 'Creative design'}</p>
                    <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
                    {project.short_description && <p className="mt-3 text-sm leading-6 text-white/55">{project.short_description}</p>}
                    {project.price !== null && <p className="mt-4 text-sm font-semibold text-white/80">{project.currency ?? 'LKR'} {Number(project.price).toLocaleString('en-LK')}</p>}
                    {images.length > 1 && (
                      <div className="mt-5 flex snap-x gap-2 overflow-x-auto pb-2" aria-label={project.title + ' gallery'}>
                        {images.map((url, index) => <div key={url + index} className="relative h-20 w-24 shrink-0 snap-start overflow-hidden rounded-lg bg-white/10"><Image src={url} alt={project.title + ' image ' + (index + 1)} fill unoptimized className="object-cover" sizes="96px" /></div>)}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : <p className="rounded-2xl border border-white/10 p-10 text-white/60">Portfolio projects will appear here once published.</p>}
      </section>

      <footer id="contact" className="border-t border-white/10 bg-[#101018] px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[.3em] text-fuchsia-300">Have a project in mind?</p>
          <h2 className="mt-4 text-4xl font-black md:text-6xl">Let's make it memorable.</h2>
          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            {SITE_CONFIG.email && <a className="underline underline-offset-4" href={`mailto:${SITE_CONFIG.email}`}>Email the studio ↗</a>}
            {SITE_CONFIG.whatsapp && <a className="underline underline-offset-4" href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}`}>WhatsApp ↗</a>}
          </div>
          <p className="mt-16 text-xs text-white/40">© {new Date().getFullYear()} RAVZEN Creative Studio. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
