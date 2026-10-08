'use client'

/**
 * GlassCard — glassmorphism surface container.
 *
 * Renders as a <div> by default. Use `asChild` to render as any element.
 *
 * Variants:
 *   default — standard glass card
 *   elevated — deeper shadow, stronger blur
 *   flat    — minimal border, no backdrop blur
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const glassCardVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      variant: {
        default: [
          'backdrop-blur-md',
          'bg-[var(--glass-bg)]',
          'border border-[var(--glass-border)]',
          'shadow-glass',
          'transition-[background,box-shadow] duration-300',
          'hover:bg-[var(--glass-bg-hover)] hover:shadow-glass-hover',
        ].join(' '),

        elevated: [
          'backdrop-blur-xl',
          'bg-[rgba(255,255,255,0.06)]',
          'border border-[rgba(255,255,255,0.12)]',
          'shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
        ].join(' '),

        flat: [
          'bg-[rgba(255,255,255,0.03)]',
          'border border-[rgba(255,255,255,0.07)]',
        ].join(' '),
      },

      rounded: {
        sm: 'rounded-lg',
        md: 'rounded-2xl',
        lg: 'rounded-3xl',
        xl: 'rounded-4xl',
      },

      padding: {
        none: '',
        sm:   'p-4',
        md:   'p-6',
        lg:   'p-8',
      },
    },

    defaultVariants: {
      variant: 'default',
      rounded: 'md',
      padding: 'md',
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, rounded, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={cn(glassCardVariants({ variant, rounded, padding }), className)}
        {...props}
      />
    )
  }
)

GlassCard.displayName = 'GlassCard'
