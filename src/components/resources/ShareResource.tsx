'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

export default function ShareResource({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    const url = new URL(window.location.pathname, window.location.origin)
    url.hash = 'resource-' + id
    const link = url.toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: title + ' | RAVZEN DiGi Universe', text: 'Discover this digital resource at RAVZEN DiGi Universe.', url: link })
        return
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
        setCopied(true)
      } else {
        window.prompt('Copy product link:', link)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(link)
        setCopied(true)
      } catch {
        window.prompt('Copy product link:', link)
      }
    }
  }
  return <button type="button" onClick={() => void share()} aria-label={'Share ' + title}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-300">
    {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
    {copied ? <><Copy size={16} aria-hidden="true" /> Link copied</> : 'Share'}
  </button>
}
