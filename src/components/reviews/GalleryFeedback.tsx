'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import ArtworkReviews from './ArtworkReviews'

export default function GalleryFeedback({ artworkId, title, images }: { artworkId:string; title:string; images:string[] }) {
  const [selected,setSelected] = useState(0)
  const [open,setOpen] = useState(false)
  const [active,setActive] = useState(0)
  useEffect(() => {
    if (!open) return
    const onKey = (event:KeyboardEvent) => {
      if (event.key==='Escape') setOpen(false)
      if (event.key==='ArrowRight') setActive(v=>(v+1)%images.length)
      if (event.key==='ArrowLeft') setActive(v=>(v-1+images.length)%images.length)
    }
    document.addEventListener('keydown',onKey)
    return ()=>document.removeEventListener('keydown',onKey)
  },[open,images.length])
  const show=(index:number)=>{setActive(index);setSelected(index+1);setOpen(true)}
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
    {open && images.length>0 && <div role="dialog" aria-modal="true" aria-label={title+' full size gallery'}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-3 text-white">
      <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
        <span className="rounded bg-black/70 px-3 py-2 text-sm">{active+1} / {images.length}</span>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Close gallery" className="rounded-lg bg-white/20 px-4 py-3 text-lg">✕</button>
      </div>
      <div className="relative h-[78vh] w-full max-w-6xl">
        <Image src={images[active]} alt={title+' full size image '+(active+1)} fill unoptimized className="object-contain" sizes="100vw"/>
      </div>
      {images.length>1 && <div className="mt-4 flex w-full max-w-sm justify-between gap-4">
        <button type="button" onClick={()=>{const i=(active-1+images.length)%images.length;setActive(i);setSelected(i+1)}} className="rounded-lg bg-white/20 px-6 py-3">← Previous</button>
        <button type="button" onClick={()=>{const i=(active+1)%images.length;setActive(i);setSelected(i+1)}} className="rounded-lg bg-white/20 px-6 py-3">Next →</button>
      </div>}
    </div>}
  </div>
}
