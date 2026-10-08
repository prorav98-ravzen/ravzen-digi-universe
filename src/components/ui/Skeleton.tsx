/**
 * Skeleton — loading state placeholder.
 *
 * Uses the shimmer animation from globals.css.
 * Compose multiple Skeletons to match the eventual content layout.
 */

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width — defaults to '100%' */
  width?: string | number
  /** Height — required or set via className */
  height?: string | number
}

export function Skeleton({ width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{
        width:  width  !== undefined ? width  : '100%',
        height: height !== undefined ? height : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

// ── Preset compositions ───────────────────────────────────────────────────────

/** Card-shaped skeleton */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]',
        className
      )}
    >
      <Skeleton height={200} />
      <div className="p-4 space-y-3">
        <Skeleton height={16} width="65%" className="rounded" />
        <Skeleton height={12} width="40%" className="rounded" />
        <Skeleton height={12} width="90%" className="rounded" />
        <Skeleton height={12} width="75%" className="rounded" />
      </div>
    </div>
  )
}

/** Text-block skeleton */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ['100%', '85%', '70%', '90%', '60%']
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={widths[i % widths.length]}
          className="rounded"
        />
      ))}
    </div>
  )
}
