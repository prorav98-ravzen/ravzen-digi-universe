import { Suspense } from 'react'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export const metadata = {
  title: 'Admin Login — RAVZEN',
  robots: { index: false, follow: false },
}

/**
 * Admin login page — rendered outside AdminLayout so it works without auth.
 * AdminLayout is a Server Component that redirects unauthenticated users HERE.
 */
export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at center, #060918 0%, #03040a 100%)' }}
    >
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  )
}
