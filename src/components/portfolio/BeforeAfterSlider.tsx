'use client'
import { useState } from 'react'
import Image from 'next/image'

/** Only show an actual before/after comparison when both explicitly identified assets exist. */
export default function BeforeAfterSlider({before,after,title}:{before:string|null;after:string|null;title:string}) {
  const [position,setPosition]=useState(50)
  if (!before || !after) return <div className="rounded-xl border border-white/15 bg-white/[.035] px-5 py-6 text-sm leading-7 text-white/65">
    <p className="font-semibold text-white">Before & after — coming soon</p>
    <p>Verified original and final artwork images have not been supplied for {title}. The comparison will appear once both versions are available.</p>
  </div>
  return <div className="space-y-3">
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/20 bg-[#15151e]">
      <Image src={after} alt={title+' final artwork'} fill className="object-contain" sizes="(max-width:768px) 100vw, 60vw" />
      <div className="absolute inset-0 overflow-hidden" style={{clipPath:'inset(0 '+(100-position)+'% 0 0)'}}>
        <Image src={before} alt={title+' original artwork'} fill className="object-contain" sizes="(max-width:768px) 100vw, 60vw" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_#fff]" style={{left:position+'%'}} />
      <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs text-white">Before</span>
      <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs text-white">After</span>
    </div>
    <label className="block text-xs text-white/70">Drag to compare — {position}% before
      <input type="range" min="0" max="100" value={position} onChange={e=>setPosition(Number(e.target.value))} aria-label={'Compare original and final artwork for '+title} className="mt-3 w-full accent-[#E9A46B]" />
    </label>
  </div>
}
