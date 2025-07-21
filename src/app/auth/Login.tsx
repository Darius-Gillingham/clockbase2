// File: src/app/auth/Login.tsx
// Commit: Modular login component with manager detection callback

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface LoginProps {
  onManagerDetected: (phone: string) => void
  onSuccessRedirect: () => void
}

export default function Login({ onManagerDetected, onSuccessRedirect }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError || !data.session) {
      setError(loginError?.message || 'Login failed')
      setLoading(false)
      return
    }

    const user = data.session.user

    // Check if user is a manager
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('manager_phone')
      .eq('manager_email', user.email)
      .single()

    if (companyError && companyError.code !== 'PGRST116') {
      setError('Error checking manager status')
      setLoading(false)
      return
    }

    const isManager = !!company
    const phone = company?.manager_phone

    if (!isManager || !phone) {
      onSuccessRedirect()
    } else {
      onManagerDetected(phone)
    }

    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col gap-4 bg-white dark:bg-neutral-900 p-6 rounded shadow"
      >
        <h1 className="text-2xl font-semibold text-center mb-2">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Checking...' : 'Login'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </main>
  )
}
