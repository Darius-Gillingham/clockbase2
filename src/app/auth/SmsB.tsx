// File: src/app/auth/SmsB.tsx
// Commit: Verify 2FA code and redirect to ManagerPage after success

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SmsB({ phone }: { phone: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleVerify = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://clockbase-sms-production.up.railway.app/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code')

      // Store verification status locally
      localStorage.setItem('isManagerVerified', 'true')

      // Redirect to ManagerPage
      router.push('/ManagerPage')
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-xl font-semibold text-center text-black dark:text-white">
          Enter verification code
        </h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </main>
  )
}
