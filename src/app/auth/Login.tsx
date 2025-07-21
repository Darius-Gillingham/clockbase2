// File: src/app/auth/Login.tsx
// Commit: Integrate phone verification directly into Login for managers

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState<'login' | 'verify'>('login')
  const [phone, setPhone] = useState('')

  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

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

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('manager_phone')
      .eq('manager_email', user.email)
      .single()

    if (companyError && companyError.code !== 'PGRST116') {
      setError('Manager check failed')
      setLoading(false)
      return
    }

    const isManager = !!company
    const managerPhone = company?.manager_phone

    if (!isManager) {
      router.push('/app')
      return
    }

    if (!managerPhone) {
      setError('Manager phone number not found.')
      setLoading(false)
      return
    }

    // send SMS code
    const sendRes = await fetch('https://clockbase-sms-production.up.railway.app/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: managerPhone }),
    })

    const sendData = await sendRes.json()
    if (!sendRes.ok) {
      setError(sendData.error || 'Failed to send SMS code')
      setLoading(false)
      return
    }

    setPhone(managerPhone)
    setStep('verify')
    setLoading(false)
  }

  const handleVerify = async () => {
    setError(null)
    setVerifying(true)

    try {
      const res = await fetch('https://clockbase-sms-production.up.railway.app/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')

      localStorage.setItem('isManagerVerified', 'true')
      setVerified(true)
      router.push('/app')
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (step === 'verify') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-sm space-y-6">
          <h2 className="text-xl font-semibold text-center text-black dark:text-white">Enter verification code</h2>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Code'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {verified && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              ✅ Phone verified successfully
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm flex flex-col gap-4 bg-white dark:bg-neutral-900 p-6 rounded shadow"
      >
        <h1 className="text-2xl font-semibold text-center mb-2">Manager Login</h1>

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
