/** Only normalized, local admin paths may follow authentication. */
export function safeAdminRedirect(value: string | null): string {
  if (!value || !/^\/admin(?:\/|$)/.test(value) || /[\\%?#\u0000-\u0020]/.test(value)) return '/admin/dashboard'
  const path = new URL(value, 'https://local.invalid').pathname
  return path.startsWith('/admin/') && path !== '/admin/login' ? path : '/admin/dashboard'
}

export function isEditorRole(role: unknown): role is 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR'
}

export function isSameOriginMutation(origin: string | null, host: string | null, fetchSite: string | null): boolean {
  if (fetchSite === 'cross-site' || !origin || !host) return false
  try { const url = new URL(origin); return (url.protocol === 'https:' || url.protocol === 'http:') && url.host === host && url.origin === origin } catch { return false }
}

export function imageSignatureMatches(bytes: Uint8Array, mime: string): boolean {
  const starts = (signature: number[], offset = 0) => signature.every((v, i) => bytes[offset + i] === v)
  if (mime === 'image/jpeg') return starts([255,216,255])
  if (mime === 'image/png') return starts([137,80,78,71,13,10,26,10])
  if (mime === 'image/gif') return starts([71,73,70,56]) && [55,57].includes(bytes[4]) && bytes[5] === 97
  if (mime === 'image/webp') return starts([82,73,70,70]) && starts([87,69,66,80], 8)
  return false
}
