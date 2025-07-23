// File: src/app/auth/page.tsx
// Commit: Add 2FA mode flag to allow session temporarily during verification window

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '../SessionProvider'

import Creg from './Creg'
import Ereg from './Ereg'
import Login from './Login'
import SmsA from './SmsA'
import SmsB from './SmsB'

type Mode = 'select' | 'login' | 'creg' | 'ereg' | '2fa-send' | '2fa-verify'

export default function AuthPage() {
  const { session } = useSessionContext()
  const router = useRouter()

  const [mode, setMode] = useState<Mode>('select')
  const [managerPhone, setManagerPhone] = useState('')

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session])

  const handleManagerDetected = (phone: string) => {
    localStorage.setItem('in2FAMode', 'true')
    setManagerPhone(phone)
    setMode('2fa-send')
  }

  const handle2FASuccess = () => {
    localStorage.removeItem('in2FAMode')
    window.location.href = '/'
  }

  const renderMain = () => {
    if (mode === 'creg') return <Creg />
    if (mode === 'ereg') return <Ereg />
    if (mode === 'login') {
      return (
        <Login
          onManagerDetected={handleManagerDetected}
          onSuccessRedirect={() => {
            window.location.href = '/app'
          }}
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

  return (
    <>
      {renderMain()}
      {mode === '2fa-send' && (
        <div className="fixed top-0 left-0 z-[9999] w-screen h-screen bg-white dark:bg-black flex items-center justify-center">
          <SmsA
            phone={managerPhone}
            onSuccess={() => setMode('2fa-verify')}
          />
        </div>
      )}
      {mode === '2fa-verify' && (
        <div className="fixed top-0 left-0 z-[9999] w-screen h-screen bg-white dark:bg-black flex items-center justify-center">
          <SmsB
            phone={managerPhone}
            onVerified={handle2FASuccess}
          />
        </div>
      )}
    </>
  )
}
