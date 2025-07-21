// File: src/app/auth/page.tsx
// Commit: Replace AuthForm with 3-panel selector (Creg, Ereg, Login) without descriptions

'use client'

import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <button
          onClick={() => router.push('/auth/Creg')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Register Company
        </button>
        <button
          onClick={() => router.push('/auth/Ereg')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Register as Employee
        </button>
        <button
          onClick={() => router.push('/auth/Login')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Login
        </button>
      </div>
    </main>
  )
}
