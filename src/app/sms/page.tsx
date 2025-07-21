// File: src/app/sms/page.tsx
// Commit: Container for SMS verification flow using smsA and smsB components

'use client'

import { useState } from 'react'
import SmsA from './SmsA'
import SmsB from './SmsB'

export default function SmsPage() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'send' | 'verify'>('send')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-neutral-100 dark:bg-neutral-900">
      <div className="w-full max-w-sm space-y-6">
        {step === 'send' ? (
          <SmsA
            phone={phone}
            onSuccess={(enteredPhone) => {
              setPhone(enteredPhone)
              setStep('verify')
            }}
          />
        ) : (
          <SmsB phone={phone} />
        )}
      </div>
    </div>
  )
}
