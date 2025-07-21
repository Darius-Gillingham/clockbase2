// File: src/app/auth/page.tsx
// Commit: Modular routing of auth flow with fixed props for manager login and 2FA

'use client'

import { useState } from 'react'
import Creg from './Creg'
import Ereg from './Ereg'
import Login from './Login'
import SmsA from './SmsA'
import SmsB from './SmsB'

type Mode = 'select' | 'login' | 'creg' | 'ereg' | '2fa-send' | '2fa-verify'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('select')
  const [managerPhone, setManagerPhone] = useState('')

  const handleManagerDetected = (phone: string) => {
    setManagerPhone(phone)
    setMode('2fa-send')
  }

  const handle2FASuccess = () => {
    window.location.href = '/ManagerPage'
  }

  if (mode === 'creg') return <Creg />
  if (mode === 'ereg') return <Ereg />
  if (mode === 'login') {
    return (
      <Login
        onManagerDetected={handleManagerDetected}
        onSuccessRedirect={() => {
          window.location.href = '/app'
          return ''
        }}
      />
    )
  }

  if (mode === '2fa-send') {
    return (
      <SmsA
        phone={managerPhone}
        onSuccess={() => setMode('2fa-verify')}
      />
    )
  }

  if (mode === '2fa-verify') {
    return (
      <SmsB
        phone={managerPhone}
        onVerified={handle2FASuccess}
      />
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <button
          onClick={() => setMode('creg')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Register Company
        </button>
        <button
          onClick={() => setMode('ereg')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Register as Employee
        </button>
        <button
          onClick={() => setMode('login')}
          className="p-8 border rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition text-lg font-semibold"
        >
          Login
        </button>
      </div>
    </main>
  )
}
