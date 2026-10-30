'use client'
import { useCallback, useEffect, useId, useState } from 'react'

type Review = { id:string; reviewer_name:string; rating:number; body:string; admin_reply:string|null; verified_client:boolean; created_at:string }

export default function ArtworkReviews({ artworkId, imageIndex = 0, view = 'write' }: { artworkId:string; imageIndex?:number; view?:'write'|'read' }) {
  const formId = useId()
  const [loadError,setLoadError] = useState('')
  const [loading,setLoading] = useState(true)
  const [reviews,setReviews] = useState<Review[]>([])
  const [name,setName] = useState('')
  const [phone,setPhone] = useState('')
  const [rating,setRating] = useState(5)
  const [body,setBody] = useState('')
  const [consent,setConsent] = useState(false)
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const load = useCallback(async () => {
    setLoading(true); setLoadError('')
    try {
      const res = await fetch('/api/reviews?artworkId='+encodeURIComponent(artworkId)+'&imageIndex='+imageIndex)
      if(!res.ok) throw new Error('load')
      setReviews((await res.json()).reviews)
    } catch { setLoadError('අදහස් ලබාගත නොහැකි විය. නැවත උත්සාහ කරන්න. / Could not load reviews.') }
    finally { setLoading(false) }
  },[artworkId,imageIndex])
  useEffect(() => { void load() },[load])
  async function submit(e:React.FormEvent) {
    e.preventDefault(); if (!consent || busy) return;
    if(name.trim().length<2 || phone.trim().length<9 || body.trim().length<10){setMessage('නම, දුරකථන අංකය සහ අකුරු 10ක් හෝ වැඩි අදහසක් ඇතුළත් කරන්න. / Please complete all fields.');return}
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/reviews',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({artworkId,imageIndex,name,phone,rating,body}) })
      const result = await response.json().catch(()=>null)
      if(response.ok) {
        setMessage('ස්තුතියි! ඔබේ අදහස ලැබුණා. අනුමත කළ පසු මෙහි පෙන්වනු ඇත. / Thank you! Your review will appear after approval.')
        setBody(''); setConsent(false)
      } else {
        setMessage(result?.error?.includes('24 hours') ? 'නැවත අදහසක් යැවීමට පැය 24ක් රැඳී සිටින්න. / Please wait 24 hours before another review.' : 'අදහස යැවීමට නොහැකි විය. නැවත උත්සාහ කරන්න. / Could not send your review. Please try again.')
      }
    } catch { setMessage('අන්තර්ජාල සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න. / Check your connection and try again.') }
    setBusy(false)
  }
  const average = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null
  return <section className="mt-6 border-t border-white/10 pt-5 text-sm">
    <form hidden={view!=='write'} onSubmit={submit} className="space-y-4 rounded-xl border border-fuchsia-300/20 bg-white/[.03] p-4">
      <h4 className="text-base font-bold text-fuchsia-200">ඔබේ අදහස ලියන්න · Write a review</h4>
      <p className="text-sm leading-6 text-white/70">තරු ගණන තෝරා, ඔබේ නම සහ අදහස ලියා යවන්න.<br/>Choose a rating, add your details and send.</p>
      <fieldset>
        <legend className="mb-2 font-medium">ඔබේ ඇගයීම · Rating</legend>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="ඔබේ ඇගයීම / Rating">
          {[1,2,3,4,5].map(n=><label key={n} className="relative cursor-pointer">
            <input type="radio" name={formId+'-rating'} value={n} checked={rating===n} onChange={()=>setRating(n)} aria-label={n+' out of 5 stars'} className="peer sr-only"/>
            <span className={'flex h-11 w-11 items-center justify-center rounded-lg text-3xl peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-fuchsia-300 '+(n<=rating?'text-amber-300':'text-white/35')}>★</span>
          </label>)}
        </div>
        <p className="mt-1 text-xs text-white/70" aria-live="polite">{rating} / 5 · තරු මත touch කරන්න / Tap a star</p>
      </fieldset>
      <label className="block"><span className="mb-2 block">ඔබේ නම · Your name *</span>
        <input autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="ඔබේ නම / Your name" className="w-full rounded-lg border border-white/15 bg-white/10 p-3 focus:border-fuchsia-300 focus:outline-none"/>
      </label>
      <label className="block"><span className="mb-2 block">දුරකථන අංකය · Phone number *</span>
        <input type="tel" inputMode="tel" autoComplete="tel" required minLength={9} maxLength={25} value={phone} onChange={e=>setPhone(e.target.value)} aria-describedby={formId+'-phone'} placeholder="07X XXX XXXX" className="w-full rounded-lg border border-white/15 bg-white/10 p-3 focus:border-fuchsia-300 focus:outline-none"/>
      </label>
      <p id={formId+'-phone'} className="text-xs text-white/65">ඔබේ අංකය ප්‍රසිද්ධ නොවේ. / Your number stays private.</p>
      <label className="block"><span className="mb-2 block">ඔබේ අදහස · Your review *</span>
        <textarea required minLength={10} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} aria-describedby={formId+'-length'} placeholder="මේ නිර්මාණය ගැන ඔබ සිතන්නේ කුමක්ද? / What do you think of this design?" className="min-h-28 w-full rounded-lg border border-white/15 bg-white/10 p-3 focus:border-fuchsia-300 focus:outline-none"/>
      </label>
      <p id={formId+'-length'} className="text-xs text-white/65">අවම අකුරු 10ක් · At least 10 characters ({body.trim().length}/2000)</p>
      <label className="flex items-start gap-3 text-xs leading-5 text-white/75"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required className="mt-1 h-5 w-5 shrink-0 accent-fuchsia-400"/><span>අනුමත කිරීමෙන් පසු මගේ නම, ඇගයීම සහ අදහස පළ කිරීමට එකඟයි.<br/>I agree to publish my name, rating and review after approval.</span></label>
      <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-fuchsia-300 px-4 py-3 font-bold text-[#190d20] hover:bg-fuchsia-200 disabled:opacity-60">{busy?'යවමින්… / Sending…':'අදහස යවන්න · Send review →'}</button>
      {message && <p role="status" className="rounded-lg border border-fuchsia-300/30 bg-fuchsia-400/10 p-3 leading-6 text-fuchsia-100">{message}</p>}
      <p className="text-xs leading-5 text-white/60">ඔබේ අදහස අනුමත කළ පසු පෙන්වනු ඇත. / Reviews appear after approval.</p>
    </form>
    <div hidden={view!=='read'}>
    <h4 className="font-bold text-fuchsia-200">{imageIndex ? 'Image '+imageIndex+' reviews' : 'අනෙක් අයගේ අදහස් · Reviews'} {average && <span aria-label="Average rating">★ {average}/5</span>} <span className="text-white/50">({reviews.length})</span></h4>
    {loading && <p role="status" className="mt-3 text-white/70">අදහස් ලබාගනිමින්… / Loading reviews…</p>}
    {loadError && <p role="status" className="mt-3 text-white/80">{loadError} <button type="button" onClick={()=>void load()} className="underline">Retry</button></p>}
    {!loading && !loadError && reviews.length===0 && <p className="mt-3 text-white/65">තවම අදහස් නැහැ. පළමු අදහස ඔබෙන්! / Be the first to leave a review.</p>}
    <div className="mt-4 space-y-4">{reviews.map(r=><div key={r.id} className="rounded-xl bg-white/5 p-4">
      <p className="text-fuchsia-300" aria-label={r.rating+' out of 5 stars'}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</p>
      <p className="mt-1 font-semibold">{r.reviewer_name} {r.verified_client && <span className="text-xs text-emerald-300">✓ Verified client</span>}</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-white/70">{r.body}</p>
      {r.admin_reply && <p className="mt-3 rounded-lg border-l-2 border-fuchsia-400 bg-white/5 p-3 text-white/70"><strong>RAVZEN reply:</strong> {r.admin_reply}</p>}
    </div>)}</div>
    </div>
  </section>
}
