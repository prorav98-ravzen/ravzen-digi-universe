'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const original = 'Imagine. Create. Evolve.'
const phrases = [original, 'Imagine Art.', 'Create. Live.', 'Evolve Art.'] as const

// Assign each character to a stable character from the original tagline.
// The same letter physically travels to its new position between phrases.
function assignLetters(phrase: string) {
  const available = [...original].map((letter, id) => ({ letter, id }))
  return [...phrase].map(letter => {
    const index = available.findIndex(item => item.letter.toLowerCase() === letter.toLowerCase())
    if (index === -1) return { letter, id: -1 }
    const [match] = available.splice(index, 1)
    return { letter, id: match.id }
  })
}

export default function TypewriterHero() {
  const [typed, setTyped] = useState(0)
  const [phase, setPhase] = useState(0)
  const root = useRef<HTMLSpanElement>(null)
  const previous = useRef<Map<number, DOMRect>>(new Map())
  const initial = useRef(true)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced.current) { setTyped(original.length); return }
    let index = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      index++
      setTyped(index)
      if (index < original.length) timer = setTimeout(tick, original[index - 1] === '.' ? 300 : 75)
    }
    timer = setTimeout(tick, 250)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typed < original.length || reduced.current) return
    const interval = setInterval(() => setPhase(value => (value + 1) % phrases.length), 4700)
    return () => clearInterval(interval)
  }, [typed])

  useLayoutEffect(() => {
    const parent = root.current
    if (!parent) return
    const spans = Array.from(parent.querySelectorAll<HTMLElement>('[data-letter-id]'))
    const current = new Map<number, DOMRect>()
    spans.forEach(el => current.set(Number(el.dataset.letterId), el.getBoundingClientRect()))
    if (!initial.current && !reduced.current) {
      spans.forEach(el => {
        const before = previous.current.get(Number(el.dataset.letterId))
        const after = current.get(Number(el.dataset.letterId))
        if (!after) return
        if (before) {
          const dx = before.left - after.left
          const dy = before.top - after.top
          el.animate([
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 1 },
            { transform: 'translate(0, 0)', opacity: 1 }
          ], { duration: 1050, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' })
        } else {
          el.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 650, easing: 'ease-out', fill: 'both' })
        }
      })
    }
    previous.current = current
    initial.current = false
  }, [phase])

  const letters = assignLetters(phrases[phase])
  return <span ref={root} aria-label={phrases[phase]} className="relative inline-block align-top">
    <span className="invisible" aria-hidden="true">{original}</span>
    <span className="absolute inset-0 flex flex-wrap items-center justify-center gap-x-[.22em]" aria-hidden="true">
      {phrases[phase].split(' ').map((word, wordIndex) => {
        const start = phrases[phase].split(' ').slice(0, wordIndex).reduce((sum, part) => sum + part.length + 1, 0)
        return <span key={wordIndex} className={`inline-block whitespace-nowrap ${wordIndex === 1 ? 'italic text-[#E9A46B]' : ''}`}>
          {[...word].map((character, letterIndex) => {
            const index = start + letterIndex
            const item = letters[index]
            return <span key={item.id >= 0 ? item.id : `extra-${index}`} data-letter-id={item.id >= 0 ? item.id : undefined} className="inline-block" style={{ opacity: phase === 0 && index >= typed ? 0 : 1 }}>{character}</span>
          })}
        </span>
      })}
    </span>
  </span>
}
