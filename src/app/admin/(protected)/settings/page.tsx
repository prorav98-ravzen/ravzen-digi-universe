import { createClient } from '@/lib/supabase/server'
import SettingsManager   from '@/components/admin/SettingsManager'

export const metadata = { title: 'Settings — RAVZEN Admin' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').order('key')

  return <SettingsManager settings={settings ?? []} />
}
