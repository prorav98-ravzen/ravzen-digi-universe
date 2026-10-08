'use client'

/**
 * Button — universal interactive button primitive.
 *
 * Variants:
 *   universe — bordered energy-blue style (primary CTA)
 *   solid    — filled gradient (stronger CTA)
 *   ghost    — transparent with hover reveal
 *   danger   — red-tinted for destructive actions
 *
 * Sizes: sm | md | lg
 *
 * Features:
 * - Keyboard accessible (focus-visible ring)
 * - Touch target minimum 44px (WCAG 2.5.5)
 * - Supports asChild pattern via Radix Slot
 * - Disabled state visually and semantically
 * - Loading state with spinner
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── Variant definitions ───────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles applied to every variant
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-display font-semibold tracking-widest uppercase',
    'cursor-pointer select-none',
    'rounded-lg overflow-hidden',
    'transition-all duration-300',
    'focus-visible:outline-2 focus-visible:outline-offset-3',
    'focus-visible:outline-[var(--color-energy-blue)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        universe: [
          'border border-[rgba(77,127,255,0.35)]',
          'text-[var(--color-energy-white)]',
          'hover:border-[rgba(77,127,255,0.75)]',
          'hover:text-[var(--color-energy-blue)]',
          'hover:shadow-glow-blue',
        ].join(' '),

        solid: [
          'bg-gradient-to-r from-[var(--color-energy-blue)] to-[var(--color-energy-violet)]',
          'text-white border-transparent',
          'hover:brightness-110 hover:shadow-glow-blue',
        ].join(' '),

        ghost: [
          'border border-transparent',
          'text-[rgba(248,250,255,0.6)]',
          'hover:text-[var(--color-energy-white)]',
          'hover:bg-[rgba(255,255,255,0.06)]',
          'hover:border-[rgba(255,255,255,0.09)]',
        ].join(' '),

        danger: [
          'border border-[rgba(239,68,68,0.35)]',
          'text-[rgba(248,250,255,0.8)]',
          'hover:border-[rgba(239,68,68,0.7)]',
          'hover:text-red-400',
          'hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
        ].join(' '),
      },

      size: {
        sm: 'min-h-[36px] px-4  text-[10px]',
        md: 'min-h-[44px] px-6  text-xs',
        lg: 'min-h-[52px] px-8  text-sm',
      },
    },

    defaultVariants: {
      variant: 'universe',
      size:    'md',
    },
  }
)

// ── Component ─────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child element (e.g. Next.js Link) */
  asChild?:  boolean
  /** Show a loading spinner and disable interaction */
  loading?:  boolean
  /** Icon rendered before the label */
  iconLeft?: React.ReactNode
  /** Icon rendered after the label */
  iconRight?:React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild   = false,
      loading   = false,
      disabled,
      iconLeft,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? loading}
        aria-disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
