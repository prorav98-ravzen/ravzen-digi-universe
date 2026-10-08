import type { Metadata } from 'next'
import { Suspense }     from 'react'
import { SITE_CONFIG }  from '@/config/site'
import UniverseExperience from '@/components/experience/UniverseExperience'
import PageLoader          from '@/components/experience/PageLoader'

export const metadata: Metadata = {
  title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description:  SITE_CONFIG.description,
  openGraph: {
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description:  SITE_CONFIG.description,
    url:          SITE_CONFIG.url,
    type:         'website',
  },
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <UniverseExperience />
    </Suspense>
  )
}
