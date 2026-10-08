'use client'

/**
 * AdminShell — Admin panel layout shell.
 *
 * Left sidebar: navigation with role-filtered items.
 * Top bar: current section breadcrumb, user info, logout.
 * Main area: children.
 *
 * Role visibility:
 *   SUPER_ADMIN — everything
 *   ADMIN       — everything except Users
 *   EDITOR      — Projects + Media only
 */

import { useState, useCallback }  from 'react'
import Link                        from 'next/link'
import { usePathname, useRouter }  from 'next/navigation'
import {
  LayoutDashboard, FileText, Smartphone, Monitor, Network,
  ImageIcon, Megaphone, BarChart2, Users, Settings,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { createClient }   from '@/lib/supabase/client'
import { cn }             from '@/lib/utils/cn'
import type { AuthUser }  from '@/types/auth'

// ── Nav items ────────────────────────────────────────────────────────────────

type NavItem = {
  label:  string
  href:   string
  icon:   React.ElementType
  roles:  readonly string[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard',      href: '/admin/dashboard',    icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Design',         href: '/admin/design',       icon: FileText,        roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Android Apps',   href: '/admin/android',      icon: Smartphone,      roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Software',       href: '/admin/software',     icon: Monitor,         roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Systems',        href: '/admin/systems',      icon: Network,         roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Media',          href: '/admin/media',        icon: ImageIcon,       roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
  { label: 'Advertisements', href: '/admin/ads',          icon: Megaphone,       roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Analytics',      href: '/admin/analytics',    icon: BarChart2,       roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Users',          href: '/admin/users',        icon: Users,           roles: ['SUPER_ADMIN'] },
  { label: 'Settings',       href: '/admin/settings',     icon: Settings,        roles: ['SUPER_ADMIN', 'ADMIN'] },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  user,
  onClose,
}: {
  user:    AuthUser
  onClose?: () => void
}) {
  const pathname = usePathname()
  const router   = useRouter()

  const filtered = NAV.filter((item) => item.roles.includes(user.role))

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }, [router])

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width:       240,
        minWidth:    240,
        background:  'rgba(3,4,10,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <p className="font-mono text-[9px] tracking-[0.4em] uppercase"
          style={{ color: 'rgba(77,127,255,0.6)' }}>RAVZEN</p>
        <p className="font-display font-bold text-sm tracking-wider"
          style={{ color: 'var(--color-energy-white)' }}>ADMIN</p>
        <span
          className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(77,127,255,0.15)',
            color:      '#4d7fff',
            border:     '1px solid rgba(77,127,255,0.3)',
          }}>
          {user.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
        {filtered.map((item) => {
          const Icon     = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-mono',
                'transition-colors duration-150',
                isActive
                  ? 'bg-[rgba(77,127,255,0.12)] text-[#4d7fff]'
                  : 'text-[rgba(248,250,255,0.5)] hover:text-[rgba(248,250,255,0.85)] hover:bg-[rgba(255,255,255,0.04)]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={15} aria-hidden="true" />
              {item.label}
              {isActive && <ChevronRight size={12} className="ml-auto" aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-xs text-[rgba(248,250,255,0.35)] truncate mb-3">
          {user.fullName ?? user.email}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-mono text-[rgba(248,250,255,0.4)] hover:text-red-400 transition-colors cursor-pointer"
        >
          <LogOut size={13} aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function AdminShell({
  user,
  children,
}: {
  user:     AuthUser
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: '#03040a' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 z-20 flex items-center justify-center w-8 h-8 rounded cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#f8faff' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-4 md:px-6 py-3 sticky top-0 z-20"
          style={{
            background:     'rgba(3,4,10,0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom:   '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded cursor-pointer"
            style={{ color: 'rgba(248,250,255,0.6)' }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <span className="flex-1" />

          <span className="hidden sm:block text-xs font-mono text-[rgba(248,250,255,0.35)]">
            {user.email}
          </span>

          <Link
            href="/"
            target="_blank"
            className="text-xs font-mono text-[rgba(77,127,255,0.6)] hover:text-[#4d7fff] transition-colors"
            aria-label="View public site (opens in new tab)"
          >
            View Site ↗
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
