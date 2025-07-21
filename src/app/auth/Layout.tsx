// File: src/app/auth/layout.tsx
// Commit: Remove app layout (nav bar etc) for all auth routes, including 2FA

'use client'

import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col items-center justify-center px-4 py-8">
      {children}
    </div>
  )
}
