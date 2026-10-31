'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export type ClientStory = {
  id:string; name:string; quote:string; rating:number; verified:boolean;
  projectTitle:string|null; projectSlug:string|null; adminReply:string|null; date:string|null
}
export default function ClientStories({stories}:{stories:ClientStory[]}) {
  const [active,setActive]=useState(0)
  const [paused,setPaused]=useState(false)
  useEffect(()=>{
    if(stories.length<2||paused)return
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    if(media.matches)return
    const timer=window.setInterval(()=>setActive(i=>(i+1)%stories.length),6500)
    return ()=>window.clearInterval(timer)
  },[stories.length,paused])
  if(!stories.length)return null
  const current=stories[active%stories.length]
  const navigate=(delta:number)=>{setActive(i=>(i+delta+stories.length)%stories.length)}
  return <section id="testimonials" aria-labelledby="client-stories-title" className="mx-auto max-w-7xl px-5 pb-16 md:px-10">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Real feedback · Approved reviews</p>
        <h2 id="client-stories-title" className="mt-3 text-3xl font-black md:text-4xl">Client stories<span className="text-fuchsia-400">.</span></h2>
      </div>
      <p className="text-xs text-white/50">{stories.length} approved client {stories.length===1?'story':'stories'}</p>
    </div>
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-400/25 bg-gradient-to-br from-[#2d1c13] via-[#151420] to-[#101b29] p-6 shadow-[0_15px_70px_rgba(249,115,22,.10)] sm:p-10" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setPaused(false)}}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" aria-hidden="true"/>
      <div className="relative min-h-56" aria-live="off">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-amber-300" role="img" aria-label={current.rating+' out of 5 stars'}>{'★'.repeat(Math.min(5,Math.max(1,current.rating)))}</span>
          {current.verified&&<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">✓ Verified client</span>}
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/55">Approved review</span>
        </div>
        <blockquote className="mt-6 max-w-4xl whitespace-pre-line text-lg font-medium leading-relaxed text-white/90 sm:text-2xl">“{current.quote}”</blockquote>
        <p className="mt-6 text-sm font-bold text-white">{current.name}</p>
        {current.projectTitle&&<p className="mt-2 text-sm text-white/60">Project: {current.projectSlug?<Link href={'/projects/'+encodeURIComponent(current.projectSlug)} className="text-fuchsia-200 underline decoration-fuchsia-400/50 underline-offset-4 hover:text-white">{current.projectTitle} ↗</Link>:current.projectTitle}</p>}
        {current.adminReply&&<div className="mt-5 max-w-3xl rounded-xl border-l-2 border-cyan-400/60 bg-white/[.04] px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Studio response</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">{current.adminReply}</p></div>}
      </div>
      {stories.length>1&&<div className="relative mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="flex gap-2" aria-label="Choose a testimonial">{stories.map((story,i)=><button key={story.id} type="button" onClick={()=>setActive(i)} aria-label={'Show testimonial '+(i+1)} aria-current={i===active?'true':undefined} className={'h-2.5 rounded-full transition-all '+(i===active?'w-9 bg-fuchsia-400':'w-2.5 bg-white/30 hover:bg-white/60')}/>)}</div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Play testimonial slideshow':'Pause testimonial slideshow'} aria-pressed={paused} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-fuchsia-300">{paused?'▶ Play':'Ⅱ Pause'}</button>
          <button type="button" onClick={()=>navigate(-1)} aria-label="Previous testimonial" className="rounded-full border border-white/20 px-4 py-2 text-white hover:border-fuchsia-300">←</button>
          <button type="button" onClick={()=>navigate(1)} aria-label="Next testimonial" className="rounded-full border border-white/20 px-4 py-2 text-white hover:border-fuchsia-300">→</button>
        </div>
      </div>}
    </div>
  </section>
}
