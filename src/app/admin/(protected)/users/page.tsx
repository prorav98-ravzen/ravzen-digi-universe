import { createClient } from '@/lib/supabase/server'
import { redirect }      from 'next/navigation'

export const metadata = { title: 'Users — RAVZEN Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'SUPER_ADMIN') {
    return (
      <div>
        <h1 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-energy-white)' }}>Users</h1>
        <p className="text-sm text-red-400">Access restricted to SUPER_ADMIN only.</p>
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display font-bold text-xl" style={{ color: 'var(--color-energy-white)' }}>Users</h1>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Email', 'Name', 'Role', 'Status', 'Joined'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: 'rgba(248,250,255,0.4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-b border-[rgba(255,255,255,0.04)]">
                <td className="px-4 py-3" style={{ color: 'var(--color-energy-white)' }}>{p.email}</td>
                <td className="px-4 py-3" style={{ color: 'rgba(248,250,255,0.5)' }}>{p.full_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: 'rgba(77,127,255,0.1)', color: '#4d7fff', border: '1px solid rgba(77,127,255,0.3)' }}>
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono" style={{ color: p.is_active ? '#00ff87' : 'rgba(248,250,255,0.3)' }}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'rgba(248,250,255,0.35)' }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
