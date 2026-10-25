'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { ClientStory } from './ClientStories'

export default function ProjectShowcase({title,slug,description,category,images,stories}:{title:string;slug:string;description:string|null;category:string;images:string[];stories:ClientStory[]}) {
  const [open,setOpen]=useState(false)
  const [tab,setTab]=useState<'overview'|'feedback'|'process'>('overview')
  return <div className="mt-4 rounded-xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[.07] to-cyan-400/[.035]">
    <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-fuchsia-200 hover:text-white">
      <span>✦ Explore this project</span><span aria-hidden="true">{open?'−':'+'}</span>
    </button>
    {open&&<div className="border-t border-white/10 px-4 pb-5 pt-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={title+' showcase'}>
        {(['overview','feedback','process'] as const).map(value=><button key={value} role="tab" type="button" aria-selected={tab===value} onClick={()=>setTab(value)} className={'rounded-full px-3 py-2 text-xs font-semibold capitalize '+(tab===value?'bg-fuchsia-400 text-black':'border border-white/15 text-white/70 hover:border-fuchsia-400')}>{value==='feedback'?('Feedback'+(stories.length?' ('+stories.length+')':'')):value==='process'?'Working together':value}</button>)}
      </div>
      {tab==='overview'&&<div role="tabpanel" className="mt-5 space-y-3 text-sm leading-7 text-white/70">
        <p className="font-bold text-white">{title}</p>
        <p>{description||'Explore the project gallery to discover the visual direction and creative execution.'}</p>
        <p><span className="text-fuchsia-300">Category:</span> {category}</p>
        <p><span className="text-fuchsia-300">Gallery:</span> {images.length} {images.length===1?'image':'images'} available</p>
        <Link href={'/projects/'+encodeURIComponent(slug)} className="inline-block text-fuchsia-200 underline underline-offset-4">Open full project gallery ↗</Link>
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
}
