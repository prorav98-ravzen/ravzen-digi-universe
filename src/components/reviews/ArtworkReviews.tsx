'use client'
import { useCallback, useEffect, useState } from 'react'

type Review = { id:string; reviewer_name:string; rating:number; body:string; admin_reply:string|null; verified_client:boolean; created_at:string }

export default function ArtworkReviews({ artworkId, imageIndex = 0 }: { artworkId:string; imageIndex?:number }) {
  const [reviews,setReviews] = useState<Review[]>([])
  const [name,setName] = useState('')
  const [phone,setPhone] = useState('')
  const [rating,setRating] = useState(5)
  const [body,setBody] = useState('')
  const [consent,setConsent] = useState(false)
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const load = useCallback(async () => {
    try { const res = await fetch('/api/reviews?artworkId='+encodeURIComponent(artworkId)+'&imageIndex='+imageIndex); if(res.ok) setReviews((await res.json()).reviews) } catch { setMessage('Reviews could not be loaded right now.') }
  },[artworkId,imageIndex])
  useEffect(() => { void load() },[load])
  async function submit(e:React.FormEvent) {
    e.preventDefault(); if (!consent) return; setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/reviews',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({artworkId,imageIndex,name,phone,rating,body}) })
      const result = await response.json().catch(()=>null)
      setMessage(result?.message || result?.error || (response.ok ? 'Review submitted.' : 'Server error ('+response.status+'). Please retry.'))
      if(response.ok) setBody('')
    } catch { setMessage('Connection interrupted. Check your internet and try again.') }
    setBusy(false)
  }
  const average = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null
  return <section className="mt-6 border-t border-white/10 pt-5 text-sm">
    <h4 className="font-bold text-fuchsia-200">{imageIndex ? 'Image '+imageIndex+' reviews' : 'Project reviews'} {average && <span aria-label="Average rating">★ {average}/5</span>} <span className="text-white/50">({reviews.length})</span></h4>
    <div className="mt-4 space-y-4">{reviews.map(r=><div key={r.id} className="rounded-xl bg-white/5 p-4">
      <p className="text-fuchsia-300" aria-label={r.rating+' out of 5 stars'}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p>
      <p className="mt-1 font-semibold">{r.reviewer_name} {r.verified_client && <span className="text-xs text-emerald-300">✓ Verified client</span>}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-white/70">{r.body}</p>
      {r.admin_reply && <p className="mt-3 rounded-lg border-l-2 border-fuchsia-400 bg-white/5 p-3 text-white/70"><strong>RAVZEN reply:</strong> {r.admin_reply}</p>}
    </div>)}</div>
    <form onSubmit={submit} className="mt-5 space-y-3 rounded-xl border border-white/10 p-4">
      <h5 className="font-semibold">Leave a review</h5>
      <input aria-label="Full name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name *" className="w-full rounded-lg bg-white/10 p-3" />
      <input aria-label="Phone number" required minLength={9} value={phone} onChange={e=>setPhone(e.target.value)} maxLength={25} placeholder="Phone number *" className="w-full rounded-lg bg-white/10 p-3" />
      <><label className="block">Rating <select aria-label="Rating" value={rating} onChange={e=>setRating(Number(e.target.value))} className="ml-3 rounded bg-[#242431] p-2">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label>
      <textarea aria-label="Review" required minLength={10} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Your review (10–2000 characters)" className="min-h-24 w-full rounded-lg bg-white/10 p-3"/>
      <label className="block text-xs text-white/60"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required className="mr-2"/>I agree to publish my name, rating and review after moderation.</label>
      <button disabled={busy||!consent||!name.trim()||body.trim().length<10} className="rounded-lg bg-fuchsia-600 px-5 py-3 font-bold disabled:opacity-50">Submit for approval</button></>}
      {message && <p role="status" className="text-fuchsia-200">{message}</p>}
      <p className="text-xs text-white/40">Your name, rating and review may be published after moderation. Your email and phone remain private.</p>
    </form>
  </section>
}
