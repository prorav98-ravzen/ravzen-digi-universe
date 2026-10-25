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
  return <div className="mt-4">
    <button type="button" onClick={() => void share()} aria-label={'Share ' + title}
      className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/25">
      <span aria-hidden="true">↗</span> Share this artwork pack
    </button>
    {message && <p role="status" className="mt-2 text-xs text-emerald-300">{message}</p>}
  </div>
}
