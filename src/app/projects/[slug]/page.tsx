import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GalleryFeedback from '@/components/reviews/GalleryFeedback'

type Props = { params: Promise<{ slug: string }> }
type Project = {
  id: string; title: string; slug: string; short_description: string | null;
  cover_image_url: string | null; gallery_urls: string[] | null;
  price: number | null; currency: string | null; category: { name: string } | null
}

async function getProject(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('design_projects')
    .select('id,title,slug,short_description,cover_image_url,gallery_urls,price,currency,category:categories(name)')
    .eq('slug', slug).eq('status', 'published').maybeSingle()
  return data as unknown as Project | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found | RAVZEN', robots: { index: false, follow: false } }
  const summary = project.short_description?.trim() || `Explore ${project.title}, a creative design project by RAVZEN in Sri Lanka.`
  const description = (summary.length < 70 ? `${summary} View the artwork and learn about RAVZEN Graphic design services in Sri Lanka.` : summary).slice(0, 155)
  return {
    title: { absolute: `${project.title.slice(0, 48)} | RAVZEN` },
    description,
    alternates: { canonical: `/projects/${encodeURIComponent(project.slug)}` },
    openGraph: {
      title: `${project.title} | RAVZEN`,
      description,
      url: `/projects/${encodeURIComponent(project.slug)}`,
      type: 'article',
      ...(project.cover_image_url ? { images: [{ url: project.cover_image_url, alt: project.title }] } : {}),
    },
  }
}

export default async function ProjectCaseStudy({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()
  const images = [...new Set([project.cover_image_url, ...(project.gallery_urls ?? [])].filter((url): url is string => Boolean(url)))]
  return <main className="min-h-screen bg-[#090910] text-white">
    <header className="border-b border-white/10 px-5 py-5 md:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4" aria-label="Project navigation">
        <Link href="/" className="font-black tracking-[.2em]">RAVZEN<span className="text-fuchsia-400">.</span></Link>
        <Link href="/#work" className="rounded-full border border-white/20 px-5 py-2 text-sm hover:border-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400">← Back to portfolio</Link>
      </nav>
    </header>
    <article className="mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">{project.category?.name ?? 'Creative design'} · Selected work</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">{project.title}</h1>
      {project.short_description && <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">{project.short_description}</p>}
      {project.price !== null && <p className="mt-6 text-sm font-semibold text-fuchsia-200">From {project.currency ?? 'LKR'} {Number(project.price).toLocaleString('en-LK')}</p>}
      {images[0] && <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <Image src={images[0]} alt={project.title} fill unoptimized className="object-contain" sizes="(max-width: 768px) 100vw, 1100px" priority />
      </div>}
      <section aria-labelledby="project-overview" className="mt-12 max-w-4xl space-y-5 text-white/75">
        <h2 id="project-overview" className="text-2xl font-bold text-white">About this design project</h2>
        <p className="leading-8">This {project.category?.name?.toLowerCase() ?? 'creative design'} project, <strong className="font-semibold text-white">{project.title}</strong>, is featured in the RAVZEN Graphic portfolio. RAVZEN is a graphic design studio based in Bibile, Sri Lanka, showcasing branding, packaging, promotional artwork and visual design.</p>
        {project.short_description ? <p className="leading-8">{project.short_description}</p> : <p className="leading-8">Explore the available artwork below to see the visual direction and presentation of this project. For details about design requirements, formats or a similar commission, contact the studio directly.</p>}
        <h3 className="text-lg font-semibold text-white">Explore the artwork and discuss your project</h3>
        <p className="leading-8">The gallery presents the images available for this project. If you are planning related design work, you can review the portfolio, share your brief and discuss the intended use, preferred style and production requirements with RAVZEN Graphic.</p>
        <p className="text-sm leading-7">Project category: {project.category?.name ?? 'Creative design'} · Studio: RAVZEN Graphic · Location: Bibile, Sri Lanka</p>
      </section>
      <section aria-label="Project artwork gallery" className="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-8">
        <h2 className="text-2xl font-bold">Explore the project</h2>
        <p className="mt-2 text-sm text-white/55">Browse the creative work and leave your feedback.</p>
        <GalleryFeedback artworkId={project.id} title={project.title} images={images} />
      </section>
      <div className="mt-14 border-t border-white/10 pt-8">
        <Link href="/#contact" className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold text-black hover:bg-fuchsia-100">Start a similar project ↗</Link>
      </div>
    </article>
  </main>
}
