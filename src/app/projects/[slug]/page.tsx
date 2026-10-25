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
  return { title: project ? `${project.title} | RAVZEN Creative Studio` : 'Project | RAVZEN', description: project?.short_description || 'Explore RAVZEN premium creative work.' }
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
