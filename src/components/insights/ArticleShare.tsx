'use client'
import { useState } from 'react'
export default function ArticleShare({ title, url }: { title: string; url: string }) {
  const [message, setMessage] = useState('')
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url })
      else { await navigator.clipboard.writeText(url); setMessage('Link එක copy කළා.') }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('පහත link එක copy කරගන්න.') }
  }
  return <div className="mt-8 border-t border-white/10 pt-6">
    <div className="flex flex-wrap gap-3">
      <button onClick={share} className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10">Share / Link එක copy කරන්න ↗</button>
      <a className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10" href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className="rounded-full border border-white/20 px-5 py-3 text-sm hover:bg-white/10" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
    </div>
    <p aria-live="polite" className="mt-3 text-sm text-white/70">{message}</p>
    {message.includes('පහත') && <input aria-label="Article link" readOnly value={url} onFocus={event => event.target.select()} className="mt-2 w-full rounded border border-white/20 bg-transparent p-3" />}
  </div>
}
