'use client'

import { useEffect, useState } from 'react'

const original = 'Imagine. Create. Evolve.'
// Every phrase uses only letters available in the original tagline.
const phrases = [original, 'Imagine Art.', 'Create. Live.', 'Evolve Art.'] as const
const sourceLetters = original.toLowerCase().replace(/[^a-z]/g, '')

function usesOriginalLetters(value: string) {
  const available = [...sourceLetters]
  for (const letter of value.toLowerCase().replace(/[^a-z]/g, '')) {
    const position = available.indexOf(letter)
    if (position === -1) return false
    available.splice(position, 1)
  }
  return true
}

export default function TypewriterHero() {
  const [typed, setTyped] = useState(0)
  const [phase, setPhase] = useState(0)
  const [motion, setMotion] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(original.length)
      return
    }
    let index = 0
    let timeout: ReturnType<typeof setTimeout>
    const next = () => {
      index += 1
      setTyped(index)
      if (index < original.length) {
        timeout = setTimeout(next, original[index - 1] === '.' ? 310 : 75)
      }
    }
    timeout = setTimeout(next, 280)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (typed < original.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      setMotion(true)
      setPhase(previous => (previous + 1) % phrases.length)
    }, 4300)
    return () => clearInterval(interval)
  }, [typed])

  const phrase = phrases[phase]
  if (!usesOriginalLetters(phrase)) return <span>{original}</span>

  return <span aria-label={phrase} className="relative inline-block min-h-[1.15em] align-top">
    <span className="invisible" aria-hidden="true">{original}</span>
    <span className="absolute inset-0 flex flex-wrap items-center justify-center gap-x-[.22em] gap-y-0" aria-hidden="true">
      {phrase.split(' ').map((word, wordIndex) => (
        <span key={`${phase}-${wordIndex}`} className={`inline-block whitespace-nowrap ${wordIndex === 1 ? 'italic text-[#E9A46B]' : ''}`}>
          {[...word].map((letter, letterIndex) => {
            const letterPosition = phrase.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex ? 1 : 0) + letterIndex
            const visible = phase !== 0 || letterPosition < typed
            return <span key={`${phase}-${wordIndex}-${letterIndex}`} className={motion ? 'ravzen-morph-letter' : ''} style={motion ? { animationDelay: `${letterIndex * 36 + wordIndex * 140}ms` } : undefined}>{visible ? letter : '\u00a0'}</span>
          })}
        </span>
      ))}
    </span>
  </span>
}
