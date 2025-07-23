// File: src/app/manager/page.tsx
// Commit: Finalize manager route as an empty privileged entry point for future component injection

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '../SessionProvider'

export default function ManagerPage() {
  const { session } = useSessionContext()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    }
  }, [session])

  if (!session) return null

  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 py-8">
      {/* Manager-only components will render here */}
    </main>
  )
}
