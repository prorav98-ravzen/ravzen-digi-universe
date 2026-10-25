'use client'
import { useState } from 'react'

const services=['Logo & Brand Identity','Packaging & Product Labels','Product Catalogue','Social Media & Marketing','Other Design Project']
const budgets=['Not sure yet','Under LKR 5,000','LKR 5,000–15,000','LKR 15,000–50,000','Over LKR 50,000']
export default function ProjectInquiry({whatsapp,email}:{whatsapp:string;email:string}) {
  const [service,setService]=useState(services[0])
  const [name,setName]=useState('')
  const [details,setDetails]=useState('')
  const [budget,setBudget]=useState(budgets[0])
  const [deadline,setDeadline]=useState('')
  const [contact,setContact]=useState('')
  const [step,setStep]=useState(1)
  const phone=whatsapp.replace(/\D/g,'')
  const valid=Boolean(name.trim().length>=2 && details.trim().length>=10 && contact.trim().length>=5)
  const message=['Hello RAVZEN, I would like a design quotation.','Service: '+service,'Name: '+name.trim(),'Contact: '+contact.trim(),'Budget: '+budget,'Preferred deadline: '+(deadline||'Flexible'),'Project brief: '+details.trim()].join('\n')
  const field='w-full rounded-xl border border-white/20 bg-[#11111b] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-400 focus:outline-none'
  return <section id="inquiry" className="mx-auto max-w-7xl px-5 pb-24 md:px-10" aria-labelledby="inquiry-title">
    <div className="rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[.08] to-cyan-400/[.03] p-6 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Start your next project</p>
      <h2 id="inquiry-title" className="mt-3 text-3xl font-black md:text-4xl">Tell us what you imagine.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">A simple private project brief. Nothing is submitted or stored on our website; you choose when to send it via WhatsApp or email.</p>
      <div className="mt-6 flex gap-2" aria-label={'Step '+step+' of 2'}>{[1,2].map(i=><span key={i} className={'h-1.5 flex-1 rounded-full '+(i<=step?'bg-fuchsia-400':'bg-white/15')}/>)}</div>
      {step===1?<div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Design service<select value={service} onChange={e=>setService(e.target.value)} className={'mt-2 '+field}>{services.map(s=><option key={s}>{s}</option>)}</select></label>
        <label className="block text-sm font-semibold">Estimated budget<select value={budget} onChange={e=>setBudget(e.target.value)} className={'mt-2 '+field}>{budgets.map(b=><option key={b}>{b}</option>)}</select></label>
        <label className="block text-sm font-semibold sm:col-span-2">Tell us about your design<textarea rows={4} maxLength={2000} value={details} onChange={e=>setDetails(e.target.value)} placeholder="What are you designing? Colors, dimensions, style, quantity, reference links..." className={'mt-2 '+field}/></label>
        <button type="button" disabled={details.trim().length<10} onClick={()=>setStep(2)} className="rounded-full bg-fuchsia-400 px-6 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">Continue to contact details →</button>
      </div>:<div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Your name<input value={name} maxLength={100} onChange={e=>setName(e.target.value)} className={'mt-2 '+field} placeholder="Your name"/></label>
        <label className="block text-sm font-semibold">Email or phone<input value={contact} maxLength={150} onChange={e=>setContact(e.target.value)} className={'mt-2 '+field} placeholder="How should we reply?"/></label>
        <label className="block text-sm font-semibold sm:col-span-2">Preferred deadline (optional)<input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className={'mt-2 '+field}/></label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button type="button" onClick={()=>setStep(1)} className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold">← Back</button>
          {phone&&<a aria-disabled={!valid} onClick={e=>{if(!valid)e.preventDefault()}} href={valid?'https://wa.me/'+phone+'?text='+encodeURIComponent(message):'#inquiry'} target={valid?'_blank':undefined} rel="noopener noreferrer" className={'rounded-full bg-fuchsia-400 px-6 py-3 text-sm font-bold text-black '+(!valid?'cursor-not-allowed opacity-40':'')}>Send via WhatsApp ↗</a>}
          {email&&<a aria-disabled={!valid} onClick={e=>{if(!valid)e.preventDefault()}} href={valid?'mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('RAVZEN Design Inquiry: '+service)+'&body='+encodeURIComponent(message):'#inquiry'} className={'rounded-full border border-fuchsia-300 px-6 py-3 text-sm font-semibold text-fuchsia-200 '+(!valid?'cursor-not-allowed opacity-40':'')}>Send via Email ↗</a>}
        </div>
      </div>}
    </div>
  </section>
}
