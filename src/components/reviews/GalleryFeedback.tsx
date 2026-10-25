'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import ArtworkReviews from './ArtworkReviews'

export default function GalleryFeedback({ artworkId, title, images }: { artworkId:string; title:string; images:string[] }) {
  const [selected,setSelected] = useState(0)
  const [open,setOpen] = useState(false)
  const [mounted,setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [active,setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event:KeyboardEvent) => {
      if (event.key==='Escape') setOpen(false)
      if (event.key==='ArrowRight') setActive(v=>(v+1)%images.length)
      if (event.key==='ArrowLeft') setActive(v=>(v-1+images.length)%images.length)
    }
    document.addEventListener('keydown',onKey)
    return ()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;opener.current?.focus()}
  },[open,images.length])
  const show=(index:number)=>{opener.current=document.activeElement as HTMLElement;setActive(index);setSelected(index+1);setOpen(true)}
  return <div className="mt-5">
    {images.length>0 && <button type="button" onClick={()=>show(0)}
      className="relative mb-3 block aspect-video w-full overflow-hidden rounded-xl bg-white/10"
      aria-label={'Open full size '+title+' artwork'}>
      <Image src={images[Math.max(0,selected-1)]} alt={title+' selected artwork'} fill unoptimized className="object-contain" sizes="(max-width: 768px) 100vw, 33vw"/>
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-3 py-1 text-xs text-white">Tap to enlarge</span>
    </button>}
    {images.length>1 && <div className="flex snap-x gap-2 overflow-x-auto pb-2" aria-label={title+' gallery'}>
      {images.map((url,index)=><button key={url+index} type="button" onClick={()=>show(index)}
        aria-label={'Open '+title+' image '+(index+1)} aria-pressed={selected===index+1}
        className={'relative h-20 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-white/10 '+(selected===index+1?'border-fuchsia-400':'border-transparent')}>
        <Image src={url} alt={title+' image '+(index+1)} fill unoptimized className="object-cover" sizes="96px"/>
      </button>)}
    </div>}
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={()=>setSelected(0)} aria-pressed={selected===0}
        className={'rounded-full px-3 py-2 text-xs '+(selected===0?'bg-fuchsia-700 text-white':'bg-white/10 text-white/70')}>Whole project reviews</button>
      {selected>0 && <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/70">Reviewing image {selected}</span>}
    </div>
    <ArtworkReviews key={artworkId+'-'+selected} artworkId={artworkId} imageIndex={selected}/>
    {mounted && open && images.length>0 && createPortal(<div role="dialog" aria-modal="true" aria-label={title+' full size gallery'}
      onTouchStart={event=>{touchStart.current=event.touches[0]?.clientX ?? null}} onTouchEnd={event=>{if(touchStart.current===null || images.length<2)return;const delta=(event.changedTouches[0]?.clientX ?? touchStart.current)-touchStart.current;touchStart.current=null;if(Math.abs(delta)>55){const next=(active+(delta<0?1:-1)+images.length)%images.length;setActive(next);setSelected(next+1)}}} className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-[#050509] px-3 py-4 text-white" style={{ height: "100dvh", width: "100vw", touchAction: "pan-y" }}>
      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between" style={{ top: "max(12px, env(safe-area-inset-top))" }}>
        <span className="rounded bg-black/70 px-3 py-2 text-sm">{active+1} / {images.length}</span>
        <button ref={closeButton} type="button" onClick={()=>setOpen(false)} aria-label="Close gallery" className="rounded-lg bg-white/20 px-4 py-3 text-lg">✕</button>
      </div>
      <div className="relative min-h-0 w-full max-w-6xl flex-1">
        <Image src={images[active]} alt={title+' full size image '+(active+1)} fill unoptimized className="object-contain" sizes="100vw"/>
      </div>
      {images.length>1 && <div className="mb-2 mt-4 flex w-full max-w-sm shrink-0 justify-between gap-4">
        <button type="button" onClick={()=>{const i=(active-1+images.length)%images.length;setActive(i);setSelected(i+1)}} className="rounded-lg bg-white/20 px-6 py-3">← Previous</button>
        <button type="button" onClick={()=>{const i=(active+1)%images.length;setActive(i);setSelected(i+1)}} className="rounded-lg bg-white/20 px-6 py-3">Next →</button>
      </div>}
    </div>, document.body)}
  </div>
}
