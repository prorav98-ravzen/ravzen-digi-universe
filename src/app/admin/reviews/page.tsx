'use client'
import { useCallback, useEffect, useState } from 'react'
type Review = { id:string; artwork_id:string; reviewer_name:string; reviewer_email:string; reviewer_phone:string|null; rating:number; body:string; status:'pending'|'approved'|'rejected'; admin_reply:string|null; verified_client:boolean; created_at:string }
export default function ReviewsAdmin() {
  const [rows,setRows]=useState<Review[]>([])
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)
  const load=useCallback(async()=>{try {const res=await fetch('/api/admin/reviews',{cache:'no-store'}); if(!res.ok) throw Error('Access denied or request failed');setRows((await res.json()).reviews)}catch(e){setError(String(e))}finally{setLoading(false)}},[])
  useEffect(()=>{void load()},[load])
  async function save(row:Review) {
    const res=await fetch('/api/admin/reviews',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,status:row.status,adminReply:row.admin_reply,verifiedClient:row.verified_client})})
    if(!res.ok) setError('Could not save review'); else {setError('Saved');void load()}
  }
  function change(id:string, patch:Partial<Review>){setRows(old=>old.map(r=>r.id===id?{...r,...patch}:r))}
  const approved=rows.filter(r=>r.status==='approved')
  return <main className="min-h-screen bg-[#090910] p-6 text-white md:p-10"><h1 className="text-3xl font-bold">Creative Reviews</h1>
    <p className="mt-3 text-white/60">Total {rows.length} · Pending {rows.filter(r=>r.status==='pending').length} · Approved {approved.length} · Average {approved.length?(approved.reduce((s,r)=>s+r.rating,0)/approved.length).toFixed(1):'—'} ★</p>
    {loading&&<p>Loading…</p>}{error&&<p role="status" className="mt-4 text-fuchsia-300">{error}</p>}
    <div className="mt-8 space-y-4">{rows.map(r=><article key={r.id} className="rounded-xl border border-white/15 bg-white/5 p-5">
      <p className="font-semibold">{r.reviewer_name} · {r.rating} ★ · {r.status}</p><p className="mt-1 text-xs text-white/50">{r.reviewer_email} · {r.reviewer_phone || 'No phone'} · Artwork: {r.artwork_id}</p>
      <p className="my-4 whitespace-pre-wrap">{r.body}</p>
      <label>Status <select value={r.status} onChange={e=>change(r.id,{status:e.target.value as Review['status']})} className="ml-2 rounded bg-[#292936] p-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
      <label className="ml-4"><input type="checkbox" checked={r.verified_client} onChange={e=>change(r.id,{verified_client:e.target.checked})}/> Verified client</label>
      <textarea aria-label="Official reply" value={r.admin_reply||''} onChange={e=>change(r.id,{admin_reply:e.target.value})} maxLength={2000} placeholder="Official RAVZEN reply" className="mt-4 block min-h-20 w-full rounded bg-white/10 p-3"/>
      <button onClick={()=>void save(r)} className="mt-3 rounded bg-fuchsia-700 px-5 py-2">Save review</button>
    </article>)}</div>
  </main>
}
