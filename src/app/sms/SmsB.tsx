// File: src/app/sms/SmsB.tsx
// Commit: 2FA verification using dynamic manager phone (no static auth)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SmsB({ phone }: { phone: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

      localStorage.setItem('isManagerVerified', 'true')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      router.push('/app')
    }
  }, [success, router])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center text-black dark:text-white">
        Enter verification code
      </h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6-digit code"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          ✅ Phone verified successfully
        </p>
      )}
    </div>
  )
}
