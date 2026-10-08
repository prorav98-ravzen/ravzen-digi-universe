'use client'

/**
 * ErrorBoundary — React class component error boundary.
 *
 * Catches errors thrown during render, lifecycle methods, and constructors
 * of the child component tree.
 *
 * Usage:
 *   <ErrorBoundary fallback={<MyFallback />}>
 *     <UnstableComponent />
 *   </ErrorBoundary>
 *
 * Note: React hooks cannot be used in class components. This wraps a
 * class-based boundary in a functional component shell for convenience.
 */

import React, { Component, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ErrorBoundaryState {
  hasError: boolean
  error:    Error | null
}

interface ErrorBoundaryClassProps {
  children:  ReactNode
  fallback?: ReactNode
  onError?:  (error: Error, info: React.ErrorInfo) => void
}

class ErrorBoundaryClass extends Component<ErrorBoundaryClassProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryClassProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to an error reporting service in production
    console.error('ErrorBoundary caught an error:', error, info)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      )
    }
    return this.props.children
  }
}

// ── Functional wrapper ────────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  children:  ReactNode
  /** Custom fallback UI. Receives no props — use ErrorBoundary directly for that. */
  fallback?: ReactNode
  onError?:  (error: Error, info: React.ErrorInfo) => void
  className?: string
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundaryClass>
  )
}

// ── Default fallback UI ───────────────────────────────────────────────────────

interface DefaultErrorFallbackProps {
  error: Error | null
  reset?: () => void
  className?: string
}

export function DefaultErrorFallback({ error, reset, className }: DefaultErrorFallbackProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-4 text-center',
        className
      )}
      role="alert"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
        aria-hidden="true"
      >
        <span className="text-red-400 text-lg">!</span>
      </div>

      <div className="space-y-1">
        <p className="type-label text-red-400">Something went wrong</p>
        {error?.message && (
          <p className="text-xs text-[rgba(248,250,255,0.35)] max-w-sm">
            {error.message}
          </p>
        )}
      </div>

      {reset && (
        <button
          onClick={reset}
          className="btn-universe text-[10px] px-4 py-2 min-h-[36px]"
        >
          Try again
        </button>
      )}
    </div>
  )
}
