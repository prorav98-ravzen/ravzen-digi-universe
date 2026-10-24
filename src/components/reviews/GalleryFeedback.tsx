'use client'
import { useState } from 'react'
import Image from 'next/image'
import ArtworkReviews from './ArtworkReviews'

export default function GalleryFeedback({ artworkId, title, images }: { artworkId:string; title:string; images:string[] }) {
  const [selected,setSelected] = useState(0)
  return <div className="mt-5">
    {images.length > 1 && <div className="flex snap-x gap-2 overflow-x-auto pb-2" aria-label={title+' gallery'}>
      {images.map((url,index)=><button key={url+index} type="button" onClick={()=>setSelected(index+1)}
        aria-label={'Review '+title+' image '+(index+1)} aria-pressed={selected===index+1}
        className={'relative h-20 w-24 shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-white/10 '+(selected===index+1?'border-fuchsia-400':'border-transparent')}>
        <Image src={url} alt={title+' image '+(index+1)} fill unoptimized className="object-cover" sizes="96px"/>
      </button>)}
    </div>}
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={()=>setSelected(0)} aria-pressed={selected===0}
        className={'rounded-full px-3 py-2 text-xs '+(selected===0?'bg-fuchsia-700 text-white':'bg-white/10 text-white/70')}>Whole project</button>
      {images.length===1 && <button type="button" onClick={()=>setSelected(1)} aria-pressed={selected===1}
        className={'rounded-full px-3 py-2 text-xs '+(selected===1?'bg-fuchsia-700 text-white':'bg-white/10 text-white/70')}>Artwork image</button>}
    </div>
    <ArtworkReviews key={artworkId+'-'+selected} artworkId={artworkId} imageIndex={selected}/>
  </div>
}
