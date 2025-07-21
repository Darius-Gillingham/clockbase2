// File: src/app/auth/Login.tsx
// Commit: Implement manager detection and 2FA redirect via /sms

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    // Check if user is a manager by matching email in companies table
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('manager_email, manager_phone')
      .eq('manager_email', user.email)
      .single()

    if (companyError && companyError.code !== 'PGRST116') {
      setError('Error checking manager status')
      setLoading(false)
      return
    }

    const isManager = !!company

    if (!isManager) {
      router.push('/app') // regular user, no 2FA
      return
    }

    const phone = company.manager_phone

    if (!phone) {
      setError('Manager phone not found for 2FA.')
      setLoading(false)
      return
    }

    // Store phone for SmsA to use
    localStorage.setItem('pending2faPhone', phone)

    router.push('/sms') // let /sms/page.tsx handle the rest
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col gap-4 bg-white dark:bg-neutral-900 p-6 rounded shadow"
      >
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Checking...' : 'Login'}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </main>
  )
}
