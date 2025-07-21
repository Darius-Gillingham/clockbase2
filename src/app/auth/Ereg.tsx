// File: src/app/auth/Ereg.tsx
// Commit: Employee registration form with reg code (no database insert yet)

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Ereg() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
      setEmail('')
      setPassword('')
      setEmployeeCode('')
    }

    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900 text-black dark:text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 rounded shadow space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center mb-4">Employee Registration</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Employee Registration Code"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">
            Account created. You may now log in.
          </p>
        )}
      </form>
    </main>
  )
}
