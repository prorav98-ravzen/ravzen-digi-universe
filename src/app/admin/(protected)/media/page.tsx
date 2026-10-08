import { createClient } from '@/lib/supabase/server'
import MediaManager     from '@/components/admin/MediaManager'

export const metadata = { title: 'Media — RAVZEN Admin' }

export default async function AdminMediaPage() {
  const supabase = await createClient()
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60)

  return <MediaManager items={media ?? []} />
}
