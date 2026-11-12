'use client'

import { useEffect, useState } from 'react'

const words = ['Imagine.', 'Create.', 'Evolve.'] as const
const full = words.join(' ')

export default function TypewriterHero() {
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(full.length)
      setFinished(true)
      return
    }
    let position = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      position += 1
      setCount(position)
      if (position < full.length) {
        timer = setTimeout(tick, full[position - 1] === '.' ? 320 : 75)
      } else setFinished(true)
    }
    timer = setTimeout(tick, 250)
    return () => clearTimeout(timer)
  }, [])

  let offset = 0
  return <span aria-label={full} className="relative inline">
    {words.map((word, index) => {
      const start = offset
      offset += word.length + 1
      const typed = word.slice(0, Math.max(0, Math.min(word.length, count - start)))
      return <span key={word} aria-hidden="true" className={`relative inline-block whitespace-nowrap ${index === 1 ? 'italic text-[#E9A46B]' : ''}`}>
        <span className="invisible">{word}</span>
        <span className="absolute inset-0 whitespace-nowrap">{typed}{!finished && count >= start && count <= start + word.length && <span className="ml-[1px] inline-block h-[.8em] w-[2px] animate-pulse bg-current align-[-.05em]" />}</span>
      </span>
    }).reduce<React.ReactNode[]>((parts, word, index) => index === 0 ? [word] : [...parts, ' ', word], [])}
  </span>
}
