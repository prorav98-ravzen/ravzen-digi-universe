/**
 * Authentication and authorisation types.
 * Used by middleware and future admin panel.
 */

import type { UserRole } from './database'

export interface AuthUser {
  id:        string
  email:     string
  role:      UserRole
  fullName:  string | null
  avatarUrl: string | null
  isActive:  boolean
}

// ── Role permission map ───────────────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ADMIN:       ['content', 'media', 'advertisements', 'analytics', 'settings'],
  EDITOR:      ['content.read', 'content.write', 'media.read', 'media.write'],
} as const satisfies Record<UserRole, string[]>

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number]

/**
 * Check whether a role has the given permission.
 * SUPER_ADMIN always returns true ('*' wildcard).
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] as readonly string[]
  return perms.includes('*') || perms.includes(permission)
}
