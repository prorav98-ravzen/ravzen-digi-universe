'use client'
import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Review = { id:string; reviewer_name:string; rating:number; body:string; admin_reply:string|null; verified_client:boolean; created_at:string }
const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ArtworkReviews({ artworkId, imageIndex = 0 }: { artworkId:string; imageIndex?:number }) {
  const [reviews,setReviews] = useState<Review[]>([])
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [phone,setPhone] = useState('')
  const [rating,setRating] = useState(5)
  const [body,setBody] = useState('')
  const [otp,setOtp] = useState('')
  const [verified,setVerified] = useState(false)
  const [consent,setConsent] = useState(false)
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const load = useCallback(async () => {
    try { const res = await fetch('/api/reviews?artworkId='+encodeURIComponent(artworkId)+'&imageIndex='+imageIndex); if(res.ok) setReviews((await res.json()).reviews) } catch { /* optional reviews unavailable */ }
  },[artworkId,imageIndex])
  useEffect(() => { void load(); void supabase.auth.getUser().then(({data}) => { if(data.user?.email_confirmed_at && !data.user.is_anonymous) { setVerified(true); setEmail(data.user.email ?? '') } }) },[load])
  async function sendCode() {
    if (!name.trim() || !email.includes('@')) { setMessage('Enter your name and valid email first.'); return }
    setBusy(true); setMessage('')
    const {error} = await supabase.auth.signInWithOtp({ email:email.trim(), options:{ shouldCreateUser:true } })
    setMessage(error ? error.message : 'Check your email for a verification link or code. After opening a link, return here and press Check verification.')
    setBusy(false)
  }
  async function checkVerification() {
    const {data} = await supabase.auth.getUser()
    const ok = Boolean(data.user?.email_confirmed_at && !data.user?.is_anonymous && data.user?.email?.toLowerCase() === email.trim().toLowerCase())
    setVerified(ok)
    setMessage(ok ? 'Email verified.' : 'Not verified yet. Open the email link or enter the code.')
  }
  async function verify() {
    setBusy(true)
    const {data,error} = await supabase.auth.verifyOtp({ email:email.trim(), token:otp.trim(), type:'email' })
    setVerified(Boolean(data.user?.email_confirmed_at) && !error)
    setMessage(error ? error.message : 'Email verified. You can now submit your review.')
    setBusy(false)
  }
  async function submit(e:React.FormEvent) {
    e.preventDefault(); if (!consent || !verified) return; setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/reviews',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({artworkId,imageIndex,name,phone,rating,body}) })
      const result = await response.json()
      setMessage(result.message || result.error || 'Request failed')
      if(response.ok) setBody('')
    } catch { setMessage('Network error. Please retry.') }
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
      <input aria-label="Email" required type="email" value={email} disabled={verified} onChange={e=>setEmail(e.target.value)} placeholder="Email *" className="w-full rounded-lg bg-white/10 p-3" />
      <input aria-label="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={25} placeholder="Phone (optional, private)" className="w-full rounded-lg bg-white/10 p-3" />
      {!verified && <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={sendCode} className="rounded-lg bg-fuchsia-700 px-4 py-2">Email verification code</button><input aria-label="Verification code" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="6-digit code" className="min-w-0 flex-1 rounded-lg bg-white/10 p-2" /><button type="button" disabled={busy||!otp} onClick={verify} className="rounded-lg bg-white/20 px-4 py-2">Verify code</button><button type="button" disabled={busy} onClick={()=>void checkVerification()} className="rounded-lg bg-white/10 px-4 py-2">Check verification</button></div>}
      {verified && <><label className="block">Rating <select aria-label="Rating" value={rating} onChange={e=>setRating(Number(e.target.value))} className="ml-3 rounded bg-[#242431] p-2">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label>
      <textarea aria-label="Review" required minLength={10} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} placeholder="Your review (10–2000 characters)" className="min-h-24 w-full rounded-lg bg-white/10 p-3"/>
      <label className="block text-xs text-white/60"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required className="mr-2"/>I agree to publish my name, rating and review after moderation.</label>
      <button disabled={busy||!consent||!name.trim()||body.trim().length<10} className="rounded-lg bg-fuchsia-600 px-5 py-3 font-bold disabled:opacity-50">Submit for approval</button></>}
      {message && <p role="status" className="text-fuchsia-200">{message}</p>}
      <p className="text-xs text-white/40">Your name, rating and review may be published after moderation. Your email and phone remain private.</p>
    </form>
  </section>
}
