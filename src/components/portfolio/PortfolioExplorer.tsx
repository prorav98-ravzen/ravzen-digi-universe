'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import GalleryFeedback from '@/components/reviews/GalleryFeedback'
import ShareArtwork from '@/components/portfolio/ShareArtwork'
import ProjectShowcase from '@/components/portfolio/ProjectShowcase'
import type { ClientStory } from '@/components/portfolio/ClientStories'

type Project = { id:string; title:string; slug:string; short_description:string|null; cover_image_url:string|null; gallery_urls:string[]|null; price:number|null; currency:string|null; category:{name:string}|null }
const STORAGE_KEY = 'ravzen-portfolio-favorites-v1'
const readFavorites = ():string[] => {
  try { const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(data)?data.filter((id):id is string=>typeof id==='string').slice(0,100):[] } catch { return [] }
}
export default function PortfolioExplorer({projects,whatsapp,stories=[]}:{projects:Project[];whatsapp:string;stories?: (ClientStory & {artworkId:string})[]}) {
  const [search,setSearch]=useState('')
  const [category,setCategory]=useState('All')
  const [favorites,setFavorites]=useState<string[]>([])
  const [onlySaved,setOnlySaved]=useState(false)
  const [sort,setSort]=useState('featured')
  useEffect(()=>{setFavorites(readFavorites())},[])
  const categories=useMemo(()=>['All',...Array.from(new Set(projects.map(p=>p.category?.name||'Creative design'))).sort()], [projects])
  const visible=useMemo(()=>{
    const query=search.trim().toLocaleLowerCase()
    const result=projects.filter(p=>(category==='All'||(p.category?.name||'Creative design')===category)&&(!onlySaved||favorites.includes(p.id))&&(!query||[p.title,p.short_description,p.category?.name].some(v=>v?.toLocaleLowerCase().includes(query))))
    if(sort==='title') result.sort((a,b)=>a.title.localeCompare(b.title))
    if(sort==='price') result.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity))
    return result
  },[projects,search,category,onlySaved,favorites,sort])
  const toggle=(id:string)=>{
    const next=favorites.includes(id)?favorites.filter(v=>v!==id):[...favorites,id]
    setFavorites(next)
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}catch{}
  }
  const selected=projects.filter(p=>favorites.includes(p.id))
  const phone=whatsapp.replace(/\D/g,'')
  const moodboardText='Hello RAVZEN! I like these portfolio projects and would like to discuss a design:\n'+selected.map((p,i)=>(i+1)+'. '+p.title+' — '+'https://ravzen-digi-universe.vercel.app/projects/'+encodeURIComponent(p.slug)).join('\n')
  return <div>
    <div className="mb-8 rounded-2xl border border-fuchsia-400/20 bg-white/[.035] p-4 sm:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="block"><span className="mb-2 block text-xs font-semibold text-white/65">Find your inspiration</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logos, labels, catalogues..." type="search" className="w-full rounded-xl border border-white/20 bg-[#11111b] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-400 focus:outline-none" />
        </label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-white/65">Category</span>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-white/20 bg-[#11111b] px-4 py-3 text-sm text-white focus:border-fuchsia-400 md:min-w-40">{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label className="block"><span className="mb-2 block text-xs font-semibold text-white/65">Sort by</span>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full rounded-xl border border-white/20 bg-[#11111b] px-4 py-3 text-sm text-white focus:border-fuchsia-400"><option value="featured">Featured order</option><option value="title">Name A–Z</option><option value="price">Lowest listed price</option></select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-white/55">{visible.length} of {projects.length} projects</p>
        <button type="button" onClick={()=>setOnlySaved(v=>!v)} aria-pressed={onlySaved} className={'rounded-full border px-4 py-2 text-sm font-semibold '+(onlySaved?'border-fuchsia-300 bg-fuchsia-500/20 text-white':'border-white/20 text-white/75 hover:border-fuchsia-300')}>♡ Saved moodboard ({selected.length})</button>
      </div>
      {selected.length>0 && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/[.06] p-3">
        <span className="text-sm text-white/70">{selected.length} saved inspiration{selected.length===1?'':'s'} on this device</span>
        {phone && <a href={'https://wa.me/'+phone+'?text='+encodeURIComponent(moodboardText)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-bold text-black">Discuss moodboard on WhatsApp ↗</a>}
        <button type="button" onClick={()=>{setFavorites([]);try{localStorage.removeItem(STORAGE_KEY)}catch{}}} className="text-xs text-white/60 underline underline-offset-4">Clear saved</button>
      </div>}
    </div>
    {visible.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {visible.map(project=>{
        const images=[...new Set([project.cover_image_url,...(project.gallery_urls??[])].filter((x):x is string=>Boolean(x)))]
        const saved=favorites.includes(project.id)
        return <article key={project.id} id={'artwork-'+project.id} className="studio-glow-card scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 bg-[#15151e]">
          <div className="relative aspect-[4/3] bg-[#242431]">
            {images[0]&&<Image src={images[0]} alt={project.title} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 33vw"/>}
            <button type="button" onClick={()=>toggle(project.id)} aria-pressed={saved} aria-label={(saved?'Remove ':'Save ')+project.title+(saved?' from':' to')+' favorites'} className={'absolute right-3 top-3 z-10 rounded-full border px-3 py-2 text-lg shadow-lg backdrop-blur-md '+(saved?'border-fuchsia-300 bg-fuchsia-500/90 text-white':'border-white/30 bg-black/70 text-white hover:bg-fuchsia-500/60')}>{saved?'♥':'♡'}</button>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-widest text-fuchsia-300">{project.category?.name??'Creative design'}</p>
            <h3 className="mt-2 text-xl font-bold">{project.title}</h3>
            {project.short_description&&<p className="mt-3 text-sm leading-6 text-white/55">{project.short_description}</p>}
            {project.price!==null&&<p className="mt-4 text-sm font-semibold text-white/80">{project.currency??'LKR'} {Number(project.price).toLocaleString('en-LK')}</p>}
            <Link href={'/projects/'+encodeURIComponent(project.slug)} className="mt-5 inline-flex rounded-full border border-fuchsia-400/35 px-4 py-2 text-xs font-semibold text-fuchsia-200 transition hover:border-fuchsia-300 hover:bg-fuchsia-400/10">View project details ↗</Link>
            <ProjectShowcase title={project.title} slug={project.slug} description={project.short_description} category={project.category?.name??'Creative design'} images={images} stories={stories.filter(story=>story.artworkId===project.id)} />
            <ShareArtwork artworkId={project.id} title={project.title}/>
            <GalleryFeedback artworkId={project.id} title={project.title} images={images}/>
          </div>
        </article>
      })}
    </div>:<div className="rounded-2xl border border-white/15 p-10 text-center text-white/60">No matching projects. Try a different search or category. <button type="button" onClick={()=>{setSearch('');setCategory('All');setOnlySaved(false)}} className="ml-2 text-fuchsia-300 underline">Reset filters</button></div>}
  </div>
}
