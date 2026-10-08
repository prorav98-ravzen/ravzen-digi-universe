/**
 * Typography — semantic text component.
 *
 * Renders the correct HTML element per variant while applying
 * consistent RAVZEN type styles. Components never set font-sizes inline.
 *
 * Variants map to CSS classes defined in globals.css:
 *   hero    → .type-hero    (Orbitron, fluid 2.5–7rem)
 *   display → .type-display (Orbitron, fluid 1.75–4rem)
 *   title   → .type-title   (Orbitron, fluid 1.25–2rem)
 *   label   → .type-label   (JetBrains Mono, uppercase)
 *   body    → base sans-serif
 *   muted   → base sans-serif, reduced opacity
 */

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type TypographyVariant = 'hero' | 'display' | 'title' | 'label' | 'body' | 'muted'
type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

const DEFAULT_ELEMENT: Record<TypographyVariant, TypographyElement> = {
  hero:    'h1',
  display: 'h2',
  title:   'h3',
  label:   'span',
  body:    'p',
  muted:   'p',
}

const VARIANT_CLASSES: Record<TypographyVariant, string> = {
  hero:    'type-hero text-[var(--color-energy-white)]',
  display: 'type-display text-[var(--color-energy-white)]',
  title:   'type-title text-[var(--color-energy-white)]',
  label:   'type-label text-[rgba(248,250,255,0.5)]',
  body:    'text-[var(--text-body)] leading-relaxed text-[rgba(248,250,255,0.8)]',
  muted:   'text-[var(--text-small)] text-[rgba(248,250,255,0.45)] leading-relaxed',
}

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant
  /** Override the rendered HTML element */
  as?: TypographyElement
  /** Apply glow-blue text shadow */
  glow?: boolean
}

export function Typography({
  variant = 'body',
  as,
  glow = false,
  className,
  children,
  ...props
}: TypographyProps) {
  const Element = (as ?? DEFAULT_ELEMENT[variant]) as React.ElementType

  return (
    <Element
      className={cn(
        VARIANT_CLASSES[variant],
        glow && 'glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </Element>
  )
}
