import DigitalResources from '@/components/resources/DigitalResources'
import { parseCatalog, RESOURCE_KEY } from '@/lib/resources/catalog'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/config/site'
import Image from 'next/image'
import PortfolioExplorer from '@/components/portfolio/PortfolioExplorer'
import VisitorCounters from '@/components/analytics/VisitorCounters'
import ProjectInquiry from '@/components/portfolio/ProjectInquiry'
import StudioFAQ from '@/components/portfolio/StudioFAQ'
import ClientStories, { type ClientStory } from '@/components/portfolio/ClientStories'
import CredentialsSection from '@/components/portfolio/CredentialsSection'
import StudioMotion from '@/components/portfolio/StudioMotion'
import SwipeSectionNav from '@/components/navigation/SwipeSectionNav'

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
  const { data: approvedRatings } = await supabase.from('artwork_reviews').select('rating').eq('status', 'approved')
  const ratings = (approvedRatings ?? []).map(row => Number(row.rating)).filter(rating => Number.isFinite(rating) && rating >= 1 && rating <= 5)
  const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null

  const { data: approvedStories } = await supabase.from('artwork_reviews')
    .select('id,reviewer_name,rating,body,admin_reply,verified_client,created_at,artwork_id')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(18)
  const projectById = new Map(projects.map(project => [project.id, project]))
  const clientStories: (ClientStory & {artworkId:string})[] = (approvedStories ?? [])
    .filter(review => typeof review.body === 'string' && review.body.trim().length > 0)
    .map(review => {
      const related = projectById.get(review.artwork_id)
      return {
        id: review.id, artworkId: review.artwork_id, name: review.reviewer_name || 'Client',
        quote: review.body, rating: Number(review.rating) || 5,
        verified: review.verified_client === true,
        projectTitle: related?.title ?? null, projectSlug: related?.slug ?? null,
        adminReply: review.admin_reply ?? null, date: review.created_at ?? null,
      }
    })

  const { data: settingRows } = await supabase.from('site_settings').select('key,value').in('key', [RESOURCE_KEY,'studio_hero_title','studio_hero_description','studio_accent_color','studio_background_color','studio_font_scale','email_primary','whatsapp_primary','social_instagram','social_facebook','studio_completed_projects','studio_experience_years','studio_client_count','studio_upcoming_projects','studio_upcoming_features', ...[1, 2, 3].flatMap(i => [`studio_review_${i}_name`, `studio_review_${i}_quote`, `studio_review_${i}_rating`])])
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
    <main className="studio-home relative isolate min-h-screen text-white selection:bg-fuchsia-500/40" style={{ backgroundColor: background, ["--studio-font-scale" as string]: fontScale / 100, ["--studio-accent" as string]: accent }}>
      <StudioMotion />
      <div className="studio-aurora" aria-hidden="true" />
      <header className="studio-site-header fixed inset-x-0 top-0 z-[80] border-b border-white/10 bg-[#090910]/95 shadow-lg shadow-black/20 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3 md:flex-nowrap md:px-10 md:py-5" aria-label="Main navigation">
          <a href="#home" className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-base font-black tracking-[.2em]" aria-label="RAVZEN — Home"><Image src="/images/ravzen-header-emblem.svg" alt="" width={26} height={21} className="h-[21px] w-[26px] shrink-0 object-contain" unoptimized /> <span>RAVZEN<span className="text-fuchsia-400">.</span></span></a>
          <SwipeSectionNav />
        </nav>
      </header>
      <div aria-hidden="true" className="h-[113px] md:h-[82px]" />

      <section id="home" data-studio-reveal className="relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 pt-24 md:px-10 md:pb-36 md:pt-36">
        <div className="pointer-events-none absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-fuchsia-700/15 blur-3xl" aria-hidden="true" />
        <p className="mb-7 text-xs font-bold uppercase tracking-[.35em] text-fuchsia-300">Independent creative studio · Sri Lanka</p>
        <h1 className="studio-gradient-heading max-w-5xl text-5xl font-black leading-[1.08] tracking-tight md:text-7xl lg:text-8xl">
          {settings.studio_hero_title ?? "Design that makes an impression."}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
          {settings.studio_hero_description ?? "Distinctive identities, premium packaging and striking visuals for brands ready to stand apart."}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#work" className="rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-fuchsia-100">Explore the work ↗</a>
          <a href="#inquiry" className="rounded-full border border-white/25 px-7 py-3 text-sm font-bold hover:border-fuchsia-400">Start a project</a>
        </div>
      </section>

      {stats.length > 0 && <section data-studio-reveal aria-label="Studio experience" className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 sm:grid-cols-3 md:px-10">
        {stats.map(stat => <div key={stat.label} className="border-l border-fuchsia-400/50 pl-6">
          <p className="text-4xl font-black text-fuchsia-300 md:text-5xl">{stat.value}</p>
          <p className="mt-3 text-sm text-white/60">{stat.label}</p>
        </div>)}
      </section>}

      <VisitorCounters />
      <section data-studio-reveal aria-label="Overall client rating" className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-fuchsia-400/20 bg-white/[.035] px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-300">Overall client rating</p>
            <p className="mt-2 text-sm text-white/55">{ratings.length ? `Based on ${ratings.length} approved ${ratings.length === 1 ? 'review' : 'reviews'}` : 'No approved ratings yet'}</p>
          </div>
          {averageRating !== null ? <div className="flex flex-col items-center gap-1 sm:items-end">
            <p className="text-3xl font-black tabular-nums text-white">{averageRating.toFixed(1)} <span className="text-lg font-semibold text-white/50">/ 5.0</span></p>
            <div className="flex gap-1" role="img" aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map(star => <span key={star} className="relative inline-block text-2xl leading-none text-white/20" aria-hidden="true">★<span className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${Math.max(0, Math.min(1, averageRating - star + 1)) * 100}%` }}>★</span></span>)}
            </div>
          </div> : <p className="text-sm text-white/50">Ratings will appear after reviews are approved.</p>}
        </div>
      </section>

      <ClientStories stories={clientStories} />

      <section id="work" data-studio-reveal className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Selected work</p>
        <div className="mb-10 mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-black md:text-5xl">The portfolio<span className="text-fuchsia-400">.</span></h2>
          <p className="text-sm text-white/50">{projects.length} published projects</p>
        </div>
        {projects.length ? <PortfolioExplorer projects={projects} stories={clientStories} whatsapp={settings.whatsapp_primary || SITE_CONFIG.whatsapp || ''} /> : <p className="rounded-2xl border border-white/10 p-10 text-white/60">Portfolio projects will appear here once published.</p>}
      </section>

      <section aria-label="Featured RAVZEN Freelancing eBook advertisement" data-studio-reveal className="mx-auto max-w-7xl px-5 pb-16 md:px-10">
        <a href="#resources" aria-label="Explore the RAVZEN Freelancing eBook in Digital Resources" className="group relative isolate block overflow-hidden rounded-2xl border border-[#d9bc86]/35 bg-[#0b1020] shadow-[0_18px_55px_rgba(0,0,0,.3)] transition duration-300 hover:border-[#e6c991]/70 hover:shadow-[0_20px_70px_rgba(169,126,75,.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e6c991] md:aspect-[5/1]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_82%_45%,rgba(139,92,246,.23),transparent_48%),linear-gradient(110deg,#0b1020_10%,#18162c_55%,#281a37_100%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#e6c991]/20 md:h-96 md:w-96" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full border border-[#e6c991]/15 md:h-72 md:w-72" />
          <div className="relative flex min-h-[210px] items-center justify-between gap-3 px-5 py-6 sm:px-8 md:h-full md:min-h-0 md:px-[5%] md:py-4">
            <div className="min-w-0 max-w-[76%] md:max-w-[72%]">
              <p className="mb-3 text-[9px] font-bold uppercase tracking-[.23em] text-[#e6c991] sm:text-[10px] md:mb-[2%]">RAVZEN DIGITAL LEARNING <span className="mx-1 text-white/30">/</span> FEATURED EBOOK</p>
              <h2 className="text-[clamp(1.25rem,4.4vw,2.9rem)] font-black leading-[1.07] tracking-[-.035em] text-white">Turn your skills into <span className="text-[#e6c991]">opportunity.</span></h2>
              <p className="mt-2 max-w-xl text-[10px] font-medium leading-relaxed tracking-[.015em] text-[#d3d2de] sm:text-xs md:mt-[2%] md:text-[clamp(.65rem,1.05vw,.95rem)]">Your practical guide to starting a freelance journey and connecting with global clients.</p>
              <span className="mt-4 inline-flex items-center gap-2 border-b border-[#e6c991] pb-1 text-[10px] font-bold uppercase tracking-[.15em] text-[#f2d6a1] transition group-hover:gap-3 sm:text-xs md:mt-[3%]">Discover the eBook <span aria-hidden="true">↗</span></span>
            </div>
            <div aria-hidden="true" className="relative flex w-[23%] max-w-[190px] shrink-0 justify-center md:w-[20%]">
              <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-2xl" />
              <div className="relative aspect-[3/4] w-full max-w-[135px] rotate-[8deg] overflow-hidden rounded-r-md rounded-l-sm border border-[#e6c991]/45 bg-gradient-to-br from-[#342c4f] via-[#151a31] to-[#0a1022] p-[9%] shadow-[9px_12px_20px_rgba(0,0,0,.5)] transition-transform duration-300 group-hover:rotate-[4deg]">
                <div className="absolute inset-y-0 left-[5%] w-[3%] bg-white/10" />
                <p className="text-[clamp(4px,.6vw,9px)] font-extrabold tracking-[.15em] text-[#e6c991]">RAVZEN</p>
                <div className="mt-[23%] text-[clamp(9px,1.6vw,22px)] font-black leading-[.96] tracking-tight text-white">FREE<br/><span className="text-[#e6c991]">LANCING</span></div>
                <div className="mt-[16%] h-px w-[45%] bg-[#e6c991]/65" />
                <p className="mt-[9%] text-[clamp(4px,.55vw,8px)] font-semibold uppercase tracking-wider text-white/70">THE DIGITAL GUIDE</p>
              </div>
            </div>
          </div>
        </a>
      </section>

      <section id="services" data-studio-reveal className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3 md:px-10">
          {['Brand Identity & Logos', 'Packaging & Product Labels', 'Social & Marketing Design'].map((name, i) => (
            <div key={name} className="border-l border-fuchsia-400/50 pl-5">
              <span className="text-xs text-fuchsia-300">0{i + 1}</span>
              <h2 className="mt-2 text-lg font-semibold">{name}</h2>
            </div>
          ))}
        </div>
      </section>

      <DigitalResources items={parseCatalog(settings[RESOURCE_KEY])} whatsapp={settings.whatsapp_primary || SITE_CONFIG.whatsapp || "94781556575"} />

      <section aria-label="Winco Super City sponsored advertisement" className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <a href="https://www.facebook.com/share/1E4q2qEGG8/" target="_blank" rel="noopener noreferrer sponsored" aria-label="Advertisement: Winco Super City — visit Facebook" className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_18px_55px_rgba(0,0,0,.28)] transition hover:border-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-400">
          <img src="https://vcgmxsbckiodxzxpmiay.supabase.co/storage/v1/object/public/media/portfolio/bb6e5c82-a8bc-4b49-a06f-377644bfc185/c0f8f3d2-f182-4813-8e1d-a25dbf80b854.webp" alt="Winco Super City supermarket promotional advertisement" loading="lazy" className="block h-auto w-full" />
          <span className="absolute right-2 top-2 z-10 rounded bg-black/90 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white shadow-md sm:right-4 sm:top-4">Ads</span>
        </a>
      </section>

      <CredentialsSection />


      {upcoming.length > 0 && <section aria-label="What's next" className="mx-auto grid max-w-7xl gap-7 px-5 pb-24 md:grid-cols-2 md:px-10">
        {upcoming.map(group => <div key={group.title} className="rounded-2xl border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[.3em] text-fuchsia-300">On the horizon</p>
          <h2 className="mt-4 text-2xl font-bold">{group.title}</h2>
          <ul className="mt-6 space-y-4 text-white/65">{group.items.map((item: string, index: number) => <li key={index} className="border-t border-white/10 pt-4">{item}</li>)}</ul>
        </div>)}
      </section>}

      <StudioFAQ />
      <ProjectInquiry whatsapp={settings.whatsapp_primary || SITE_CONFIG.whatsapp || ""} email={settings.email_primary || SITE_CONFIG.email || ""} />

      <div className="studio-contact-dock" aria-label="Quick contact">
        <details className="studio-contact-menu">
          <summary aria-label="Open quick contact options">Let&apos;s Talk <span aria-hidden="true">✦</span></summary>
          <div className="studio-contact-options">
            <a href="tel:+94781556575" aria-label="Call RAVZEN at +94 78 155 6575">Call Us ↗</a>
            {(settings.whatsapp_primary || SITE_CONFIG.whatsapp) && <a href={`https://wa.me/${(settings.whatsapp_primary || SITE_CONFIG.whatsapp).replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
            {(settings.email_primary || SITE_CONFIG.email) && <a href={`mailto:${settings.email_primary || SITE_CONFIG.email}`}>Email ↗</a>}
          </div>
        </details>
      </div>
      <footer id="contact" data-studio-reveal className="border-t border-white/10 bg-[#101018] px-5 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[.3em] text-fuchsia-300">Have a project in mind?</p>
          <h2 className="mt-4 text-4xl font-black md:text-6xl">Let&apos;s make it memorable.</h2>
          <div className="mt-8 flex flex-wrap gap-5 text-sm">
            <a className="underline underline-offset-4" href="tel:+94781556575">Call Us · +94 78 155 6575 ↗</a>
            {(settings.email_primary || SITE_CONFIG.email) && <a className="underline underline-offset-4" href={`mailto:${settings.email_primary || SITE_CONFIG.email}`}>Email the studio ↗</a>}
            {(settings.whatsapp_primary || SITE_CONFIG.whatsapp) && <a className="underline underline-offset-4" href={`https://wa.me/${(settings.whatsapp_primary || SITE_CONFIG.whatsapp).replace(/\D/g, '')}`}>WhatsApp ↗</a>}
          </div>
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Social &amp; Professional Profiles</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { label: 'Instagram', url: settings.social_instagram || 'https://www.instagram.com/ravzen_graphic/' },
                { label: 'Facebook', url: settings.social_facebook || 'https://www.facebook.com/share/1DmiMk4N5Q/' },
              ].filter(link => /^https:\/\//i.test(link.url)).map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[.045] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-fuchsia-400 hover:bg-fuchsia-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400">
                <span aria-hidden="true" className="text-fuchsia-300">↗</span>{link.label}
              </a>)}
            </div>
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
