import { redirect } from 'next/navigation'
import { requireEditor } from '@/lib/auth/requireEditor'
import { parseCatalog, RESOURCE_KEY } from '@/lib/resources/catalog'
import ResourcesManager from '@/components/admin/ResourcesManager'
export const metadata = { title: 'Digital Resources — RAVZEN Admin' }
export default async function ResourcesPage() {
  const { user, supabase } = await requireEditor()
  if (!user || user.role !== 'SUPER_ADMIN') redirect('/admin/dashboard')
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', RESOURCE_KEY).maybeSingle()
  if (error) return <p role="alert">Could not load resources. Please refresh before editing.</p>
  return <ResourcesManager initial={parseCatalog(data?.value)} />
}
