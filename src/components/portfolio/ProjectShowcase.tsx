'use client'
import { useId, useState } from 'react'
import Link from 'next/link'
import ShareArtwork from './ShareArtwork'
import BeforeAfterSlider from './BeforeAfterSlider'
import type { ClientStory } from './ClientStories'

export default function ProjectShowcase({artworkId,title,slug,description,category,images,stories}:{artworkId:string;title:string;slug:string;description:string|null;category:string;images:string[];stories:ClientStory[]}) {
  const panelId=useId()
  const [open,setOpen]=useState(false)
  const [tab,setTab]=useState<'overview'|'story'|'compare'|'feedback'|'process'>('overview')
  return <div className="mt-4 border-t border-white/10 pt-2">
    <div className="grid grid-cols-3 items-start gap-1">
      <Link href={'/projects/'+encodeURIComponent(slug)} aria-label={'View details for '+title} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-fuchsia-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400">Details <span aria-hidden="true">↗</span></Link>
      <button type="button" aria-label={'Explore '+title} aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(v=>!v)} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-fuchsia-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400">
        <span>Explore</span><span aria-hidden="true">{open?'−':'+'}</span>
      </button>
      <ShareArtwork artworkId={artworkId} title={title}/>
    </div>
    <div id={panelId} hidden={!open}>
    {open&&<div className="mt-2 rounded-xl border border-white/10 bg-white/[.025] px-4 pb-5 pt-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={title+' showcase'}>
        {(['overview','story','compare','feedback','process'] as const).map(value=><button key={value} role="tab" type="button" aria-selected={tab===value} onClick={()=>setTab(value)} className={'rounded-full px-3 py-2 text-xs font-semibold capitalize '+(tab===value?'bg-fuchsia-400 text-black':'border border-white/15 text-white/70 hover:border-fuchsia-400')}>{value==='feedback'?('Feedback'+(stories.length?' ('+stories.length+')':'')):value==='process'?'Working together':value==='story'?'Project story':value==='compare'?'Before & after':value}</button>)}
      </div>
      {tab==='overview'&&<div role="tabpanel" className="mt-5 space-y-3 text-sm leading-7 text-white/70">
        <p className="font-bold text-white">{title}</p>
        <p>{description||'Explore the project gallery to discover the visual direction and creative execution.'}</p>
        <p><span className="text-fuchsia-300">Category:</span> {category}</p>
        <p><span className="text-fuchsia-300">Gallery:</span> {images.length} {images.length===1?'image':'images'} available</p>
        <Link href={'/projects/'+encodeURIComponent(slug)} className="inline-block text-fuchsia-200 underline underline-offset-4">Open full project gallery ↗</Link>
      </div>}
      {tab==='story'&&<div role="tabpanel" className="mt-5 space-y-3 text-sm leading-7 text-white/75">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E9A46B]">The creative story</p>
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <p><strong className="text-white">Project focus:</strong> {category}</p>
        <p>{description?.trim() || 'A detailed project brief has not been published yet.'}</p>
        <p className="text-xs text-white/50">Project-specific challenge, design decisions and measured outcomes will appear when verified details are provided.</p>
        <Link href={'/projects/'+encodeURIComponent(slug)} className="text-[#E9A46B] underline underline-offset-4">Explore the complete project ↗</Link>
      </div>}
      {tab==='compare'&&<div role="tabpanel" className="mt-5">
        <BeforeAfterSlider before={null} after={null} title={title} />
      </div>}
      {tab==='feedback'&&<div role="tabpanel" className="mt-5 space-y-4">
        {stories.length?stories.map(story=><blockquote key={story.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-amber-300" aria-label={story.rating+' out of 5 stars'}>{'★'.repeat(Math.max(1,Math.min(5,story.rating)))}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/80">“{story.quote}”</p>
          <footer className="mt-3 text-xs text-white/55">{story.name}{story.verified?' · ✓ Verified client':''}</footer>
          {story.adminReply&&<p className="mt-3 border-l-2 border-cyan-400/50 pl-3 text-xs leading-6 text-white/60">Studio response: {story.adminReply}</p>}
        </blockquote>):<p className="text-sm leading-6 text-white/60">No approved feedback for this project yet. You can read or leave a review using the gallery feedback option below.</p>}
      </div>}
      {tab==='process'&&<div role="tabpanel" className="mt-5 space-y-3 text-sm leading-6 text-white/70">
        <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">Our typical design workflow</p>
        <ol className="space-y-3">{['Discovery & brief — we learn about your goals, references and audience','Creative direction — we agree on the visual approach and deliverables','Design & feedback — we refine the selected direction within the agreed revision scope','Final delivery — we provide the agreed output formats'].map((item,i)=><li key={item} className="flex gap-3"><span className="font-bold text-fuchsia-300">0{i+1}</span><span>{item}</span></li>)}</ol>
        <p className="text-xs text-white/45">General studio workflow; not a historical record of this specific project.</p>
        <a href="#inquiry" className="inline-block text-fuchsia-200 underline underline-offset-4">Discuss a similar project ↗</a>
      </div>}
    </div>}
    </div>
  </div>
}
