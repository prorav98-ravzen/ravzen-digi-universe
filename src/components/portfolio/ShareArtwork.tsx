'use client'
import { useState } from 'react'

export default function ShareArtwork({ artworkId, title }: { artworkId: string; title: string }) {
  const [message, setMessage] = useState('')
  async function share() {
    const url = new URL(window.location.origin + window.location.pathname)
    url.hash = 'artwork-' + artworkId
    const link = url.toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: title + ' | RAVZEN Creative Studio', text: 'Explore this artwork collection by RAVZEN Creative Studio.', url: link })
        setMessage('')
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
        setMessage('Artwork link copied!')
      } else {
        window.prompt('Copy artwork link:', link)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(link)
        setMessage('Artwork link copied!')
      } catch {
        window.prompt('Copy artwork link:', link)
      }
    }
  }
  return <div className="min-w-0">
    <button type="button" onClick={() => void share()} aria-label={'Share ' + title}
      className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-fuchsia-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400">
      <span aria-hidden="true">↗</span> Share
    </button>
    {message && <p role="status" className="mt-1 break-words text-center text-xs text-emerald-300">{message}</p>}
  </div>
}
