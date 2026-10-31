'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import ArtworkReviews from './ArtworkReviews'

export default function GalleryFeedback({ artworkId, title, images, hideInlineGallery=false, open:controlledOpen, onOpenChange }: { artworkId:string; title:string; images:string[]; hideInlineGallery?:boolean; open?:boolean; onOpenChange?:(open:boolean)=>void }) {
  const [selected,setSelected] = useState(0)
  const [reviewView,setReviewView] = useState<'write'|'read'|null>(null)
  const showReviews = reviewView !== null
  const [internalOpen,setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const setOpenRef = useRef(setOpen)
  useEffect(() => { setOpenRef.current=setOpen }, [setOpen])
  const [mounted,setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [active,setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) return
    opener.current=document.activeElement as HTMLElement
    if (hideInlineGallery) { setActive(0); setSelected(1) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event:KeyboardEvent) => {
      if (event.key==='Escape') setOpenRef.current(false)
      if (event.key==='ArrowRight' || event.key==='ArrowLeft') {
        event.preventDefault()
        setActive(v=>(v+(event.key==='ArrowRight'?1:-1)+images.length)%images.length)
      }
      if (event.key==='Tab') {
        const buttons=dialog.current?.querySelectorAll<HTMLButtonElement>('button')
        const first=buttons?.[0], last=buttons?.[buttons.length-1]
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus()}
      }
    }
    document.addEventListener('keydown',onKey)
    return ()=>{document.removeEventListener('keydown',onKey);document.body.style.overflow=previousOverflow;opener.current?.focus({preventScroll:true})}
  },[open,images.length,hideInlineGallery])
  useEffect(()=>{if(open)setSelected(active+1)},[open,active])
  const show=(index:number)=>{opener.current=document.activeElement as HTMLElement;setActive(index);setSelected(index+1);setOpen(true)}
  return <div className="mt-5">
    {!hideInlineGallery && images.length>0 && <button type="button" onClick={()=>show(0)}
      className="relative mb-3 block aspect-video w-full overflow-hidden rounded-xl bg-white/10"
      aria-label={'Open full size '+title+' artwork'}>
      <Image src={images[Math.max(0,selected-1)]} alt={title+' selected artwork'} fill unoptimized loading="lazy" className="object-contain" sizes="(max-width: 768px) 100vw, 33vw"/>
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-3 py-1 text-xs text-white">Tap to enlarge</span>
    </button>}
    {!hideInlineGallery && images.length>1 && <div className="flex snap-x gap-2 overflow-x-auto pb-2" aria-label={title+' gallery'}>
      {images.map((url,index)=><button key={url+index} type="button" onClick={()=>show(index)}
        aria-label={'Open '+title+' image '+(index+1)} aria-pressed={selected===index+1}
        className={'relative h-20 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-white/10 '+(selected===index+1?'border-fuchsia-400':'border-transparent')}>
        <Image src={url} alt={title+' image '+(index+1)} fill unoptimized loading="lazy" className="object-cover" sizes="96px"/>
      </button>)}
    </div>}
    <div className="mt-4 rounded-xl border border-fuchsia-300/25 bg-fuchsia-400/[.06] p-4">
      <p className="mb-3 text-sm text-white/80">මේ නිර්මාණය ගැන ඔබේ අදහස කියන්න</p>
      <button type="button" aria-expanded={reviewView==='write'} aria-controls={'reviews-'+artworkId} onClick={()=>{setSelected(0);setReviewView(reviewView==='write'?null:'write')}} className="w-full rounded-xl bg-fuchsia-300 px-4 py-3 text-center text-sm font-bold text-[#20150d] transition hover:bg-fuchsia-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200">
        <span className="block">★ ඔබේ අදහස ලියන්න</span><span className="mt-1 block text-xs">{reviewView==='write'?'Close review form −':'Write a review →'}</span>
      </button>
      <button type="button" aria-expanded={reviewView==='read'} aria-controls={'reviews-'+artworkId} onClick={()=>{setSelected(0);setReviewView(reviewView==='read'?null:'read')}} className="mt-2 min-h-11 w-full rounded-lg px-2 py-2 text-sm text-fuchsia-200 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300">අනෙක් අයගේ අදහස් බලන්න · Read reviews</button>
    </div>
    {showReviews && <div id={'reviews-'+artworkId}>
      {images.length>1 && <label className="mt-4 block text-xs text-white/70">අදහස අදාළ වන්නේ · Review for
        <select value={selected} onChange={event=>setSelected(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-white/20 bg-[#242431] p-3 text-sm text-white">
          <option value={0}>සම්පූර්ණ නිර්මාණ එකතුව · Whole project</option>
          {images.map((_,index)=><option key={index} value={index+1}>පින්තූරය · Image {index+1}</option>)}
        </select>
      </label>}
      <ArtworkReviews artworkId={artworkId} imageIndex={selected} view={reviewView!}/>
    </div>}
    {mounted && open && images.length>0 && createPortal(<div ref={dialog} role="dialog" aria-modal="true" aria-label={title+' full size gallery'}
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
