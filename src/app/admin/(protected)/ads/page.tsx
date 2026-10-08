import { createClient }  from '@/lib/supabase/server'
import AdsManager        from '@/components/admin/AdsManager'

export const metadata = { title: 'Advertisements — RAVZEN Admin' }

export default async function AdminAdsPage() {
  const supabase = await createClient()

  const [{ data: slots }, { data: ads }] = await Promise.all([
    supabase.from('ad_slots').select('*').order('zone').order('position'),
    supabase.from('advertisements').select('*, slot:ad_slots(zone, position, label)').order('priority', { ascending: false }),
  ])

  return <AdsManager slots={slots ?? []} ads={ads ?? []} />
}
