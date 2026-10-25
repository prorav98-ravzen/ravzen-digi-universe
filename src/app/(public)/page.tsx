import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/config/site'
import Image from 'next/image'
import GalleryFeedback from '@/components/reviews/GalleryFeedback'
import VisitorCounters from '@/components/analytics/VisitorCounters'
import ShareArtwork from '@/components/portfolio/ShareArtwork'
import CredentialsSection from '@/components/portfolio/CredentialsSection'

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
  const { data: settingRows } = await supabase.from('site_settings').select('key,value').in('key', ['studio_hero_title','studio_hero_description','studio_accent_color','studio_background_color','studio_font_scale','email_primary','whatsapp_primary','studio_completed_projects','studio_experience_years','studio_client_count','studio_upcoming_projects','studio_upcoming_features', ...[1, 2, 3].flatMap(i => [`studio_review_${i}_name`, `studio_review_${i}_quote`, `studio_review_${i}_rating`])])
  const settings = Object.fromEntries((settingRows ?? []).map(row => [row.key, row.value]))
  const hex = (value: string | undefined, fallback: string) => value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback
  const accent = hex(settings.studio_accent_color, '#e879f9')
  const background = hex(settings.studio_background_color, '#090910')
  const fontScale = Math.max(80, Math.min(125, Number(settings.studio_font_scale) || 100))
  const stats = [
    { label: 'Projects completed', value: settings.studio_completed_projects ?? '600+' },
    { label: 'Years of experience', value: settings.studio_experience_years ?? '9+' },
    { label: 'Satisfied clients', value: settings.studio_client_count ?? '75+' },
  ].filter(stat => stat.value.trim())
  const reviews = [1, 2, 3].map(i => ({
    name: settings[`studio_review_${i}_name`]?.trim(),
    quote: settings[`studio_review_${i}_quote`]?.trim(),
    rating: Number(settings[`studio_review_${i}_rating`]),
  })).filter(review => review.name && review.quote)
  const upcoming = [
    { title: 'Upcoming projects', value: settings.studio_upcoming_projects },
    { title: 'Coming to the studio', value: settings.studio_upcoming_features },
  ].map(group => ({ ...group, items: (group.value ?? '').split('\n').map((item: string) => item.trim()).filter(Boolean) })).filter(group => group.items.length)
  return (
    <main className="studio-home min-h-screen text-white selection:bg-fuchsia-500/40" style={{ backgroundColor: background, ["--studio-font-scale" as string]: fontScale / 100, ["--studio-accent" as string]: accent }}>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090910]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-4 md:flex-nowrap md:px-10 md:py-5" aria-label="Main navigation">
          <a href="#home" className="shrink-0 whitespace-nowrap text-base font-black tracking-[.2em]">RAVZEN<span className="text-fuchsia-400">.</span></a>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-[11px] font-semibold uppercase tracking-wider text-white/65 sm:gap-x-7 md:w-auto md:justify-end md:border-t-0 md:pt-0 md:text-xs">
            <a className="whitespace-nowrap hover:text-white" href="#work">Work</a>
            <a className="whitespace-nowrap hover:text-white" href="#services">Services</a>
            <a className="whitespace-nowrap hover:text-white" href="#credentials">Credentials</a>
            <a className="whitespace-nowrap hover:text-white" href="#contact">Contact</a>
          </div>
        </nav>
      </header>

      <section id="home" className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 pt-24 md:px-10 md:pb-36 md:pt-36">
        <div className="pointer-events-none absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-fuchsia-700/15 blur-3xl" aria-hidden="true" />
        <p className="mb-7 text-xs font-bold uppercase tracking-[.35em] text-fuchsia-300">Independent creative studio · Sri Lanka</p>
        <h1 className="max-w-5xl text-5xl font-black leading-[1.08] tracking-tight md:text-7xl lg:text-8xl">
          {settings.studio_hero_title ?? "Design that makes an impression."}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
          {settings.studio_hero_description ?? "Distinctive identities, premium packaging and striking visuals for brands ready to stand apart."}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#work" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-fuchsia-100">Explore the work ↗</a>
          <a href="#contact" className="rounded-full border border-white/25 px-7 py-3 text-sm font-bold hover:border-fuchsia-400">Start a project</a>
        </div>
      </section>

      {stats.length > 0 && <section aria-label="Studio experience" className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:grid-cols-3 md:px-10">
        {stats.map(stat => <div key={stat.label} className="border-l border-fuchsia-400/50 pl-6">
          <p className="text-4xl font-black text-fuchsia-300 md:text-5xl">{stat.value}</p>
          <p className="mt-3 text-sm text-white/60">{stat.label}</p>
        </div>)}
      </section>}

      <VisitorCounters />

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

      <CredentialsSection />

      <section id="work" className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Selected work</p>
        <div className="mb-10 mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-black md:text-5xl">The portfolio<span className="text-fuchsia-400">.</span></h2>
          <p className="text-sm text-white/50">{projects.length} published projects</p>
        </div>
        {projects.length ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => {
              const images = [...new Set([project.cover_image_url, ...(project.gallery_urls ?? [])].filter((x): x is string => Boolean(x)))]
              return (
                <article key={project.id} id={`artwork-${project.id}`} className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 bg-[#15151e]">
                  <div className="relative aspect-[4/3] bg-[#242431]">
                    {images[0] && <Image src={images[0]} alt={project.title} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-widest text-fuchsia-300">{project.category?.name ?? 'Creative design'}</p>
                    <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
                    {project.short_description && <p className="mt-3 text-sm leading-6 text-white/55">{project.short_description}</p>}
                    {project.price !== null && <p className="mt-4 text-sm font-semibold text-white/80">{project.currency ?? 'LKR'} {Number(project.price).toLocaleString('en-LK')}</p>}
                    <ShareArtwork artworkId={project.id} title={project.title} />
                    <GalleryFeedback artworkId={project.id} title={project.title} images={images} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : <p className="rounded-2xl border border-white/10 p-10 text-white/60">Portfolio projects will appear here once published.</p>}
      </section>

      {reviews.length > 0 && <section aria-labelledby="feedback-title" className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Client feedback</p>
        <h2 id="feedback-title" className="mt-4 text-4xl font-black">In their words.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">{reviews.map((review, index) => <figure key={index} className="rounded-2xl border border-white/10 bg-white/[.025] p-7">
          {Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 && <p aria-label={`${review.rating} out of 5 stars`} className="text-fuchsia-300">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>}
          <blockquote className="mt-4 whitespace-pre-line text-base leading-8 text-white/80">{review.quote}</blockquote>
          <figcaption className="mt-6 text-sm font-bold">{review.name}</figcaption>
        </figure>)}</div>
      </section>}

      {upcoming.length > 0 && <section aria-label="What's next" className="mx-auto grid max-w-7xl gap-7 px-5 pb-24 md:grid-cols-2 md:px-10">
        {upcoming.map(group => <div key={group.title} className="rounded-2xl border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[.3em] text-fuchsia-300">On the horizon</p>
          <h2 className="mt-4 text-2xl font-bold">{group.title}</h2>
          <ul className="mt-6 space-y-4 text-white/65">{group.items.map((item: string, index: number) => <li key={index} className="border-t border-white/10 pt-4">{item}</li>)}</ul>
        </div>)}
      </section>}

      <footer id="contact" className="border-t border-white/10 bg-[#101018] px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[.3em] text-fuchsia-300">Have a project in mind?</p>
          <h2 className="mt-4 text-4xl font-black md:text-6xl">Let&apos;s make it memorable.</h2>
          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            {(settings.email_primary || SITE_CONFIG.email) && <a className="underline underline-offset-4" href={`mailto:${settings.email_primary || SITE_CONFIG.email}`}>Email the studio ↗</a>}
            {(settings.whatsapp_primary || SITE_CONFIG.whatsapp) && <a className="underline underline-offset-4" href={`https://wa.me/${(settings.whatsapp_primary || SITE_CONFIG.whatsapp).replace(/\D/g, '')}`}>WhatsApp ↗</a>}
          </div>
          <div className="mt-16 flex flex-col items-center gap-3 border-t border-white/10 pt-9 text-center">
            <Image src="/images/ravzen-logo.png" alt="RAVZEN studio logo" width={46} height={46} className="h-12 w-12 object-contain" />
            <p className="text-sm font-bold tracking-[.16em] text-white/90">RAVZEN CREATIVE STUDIO</p>
            <p className="text-xs text-white/55">Crafted with passion. Powered by creativity.</p>
            <p className="text-xs text-white/55">Designed, Developed &amp; Deployed by <span className="font-semibold text-fuchsia-300">Ravindu Zekara</span></p>
            <p className="text-[11px] text-white/35">A RAVZEN Professional Creation · © {new Date().getFullYear()} · All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
