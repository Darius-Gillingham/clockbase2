// File: src/app/sms/SmsA.tsx
// Commit: Dynamic SMS send using company manager phone number

'use client'

import { useState } from 'react'

export default function SmsA({
  phone,
  onSuccess,
}: {
  phone: string
  onSuccess: (phone: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://clockbase-sms-production.up.railway.app/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to send code')

      onSuccess(phone)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center text-black dark:text-white">
        Verify your phone
      </h2>
      <button
        onClick={handleSendCode}
        disabled={loading}
        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Code'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
