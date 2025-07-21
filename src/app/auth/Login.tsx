// File: src/app/auth/Login.tsx
// Commit: Declare onManagerDetected and onSuccessRedirect props to fix usage in parent AuthPage

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import SmsA from './SmsA'
import SmsB from './SmsB'
import { Session } from '@supabase/supabase-js'
import { useSessionContext } from '@/app/SessionProvider'
import { useRouter } from 'next/navigation'

type LoginProps = {
  onManagerDetected: (phone: string) => void
  onSuccessRedirect: () => void
}

export default function Login({ onManagerDetected, onSuccessRedirect }: LoginProps) {
  const router = useRouter()
  const { setSession } = useSessionContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [step, setStep] = useState<'login' | '2fa-send' | '2fa-verify'>('login')
  const [pendingSession, setPendingSession] = useState<Session | null>(null)
  const [managerPhone, setManagerPhone] = useState<string>('')

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      setError(error?.message || 'Authentication failed.')
      setLoading(false)
      return
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('manager_email, manager_phone')
      .eq('manager_email', email)
      .single()

    if (company && !companyError) {
      setPendingSession(data.session)
      setManagerPhone(company.manager_phone)
      setStep('2fa-send')
      onManagerDetected(company.manager_phone)
      setLoading(false)
      return
    }

    setSession(data.session)
    setLoading(false)
    onSuccessRedirect()
  }

  const handle2FASuccess = () => {
    if (pendingSession) {
      setSession(pendingSession)
      router.push('/manager')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {step === 'login' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }}
          className="space-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}

      {step === '2fa-send' && (
        <SmsA onSuccess={() => setStep('2fa-verify')} phone={managerPhone} />
      )}

      {step === '2fa-verify' && (
        <SmsB phone={managerPhone} onVerified={handle2FASuccess} />
      )}
    </div>
  )
}
