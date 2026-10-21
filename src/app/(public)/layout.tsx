import SessionHeartbeatMount from '@/components/analytics/SessionHeartbeatMount'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionHeartbeatMount />
      {children}
    </>
  )
}
