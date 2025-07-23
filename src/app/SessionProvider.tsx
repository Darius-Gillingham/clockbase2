// File: src/app/SessionProvider.tsx
// Commit: Allow temporary session unlock if in2FAMode is true during SMS verification flow

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'

interface SessionContextType {
  session: Session | null
  setSession: (session: Session | null) => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
})

export function useSessionContext() {
  return useContext(SessionContext)
}

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      const session = data.session
      if (!session || error) return

      const email = session.user.email ?? ''
      const verifiedEmail = localStorage.getItem('verifiedManager') ?? ''
      const in2FAMode = localStorage.getItem('in2FAMode') === 'true'

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('manager_email')
        .eq('manager_email', email)
        .single()

      if (company && !companyError) {
        if (verifiedEmail === email || in2FAMode) {
          setSession(session)
        }
      } else {
        setSession(session)
      }
    }

    initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const email = newSession?.user.email ?? ''
      const verifiedEmail = localStorage.getItem('verifiedManager') ?? ''
      const in2FAMode = localStorage.getItem('in2FAMode') === 'true'

      if (!newSession) {
        setSession(null)
        return
      }

      const handleSession = async () => {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('manager_email')
          .eq('manager_email', email)
          .single()

        if (company && !companyError) {
          if (verifiedEmail === email || in2FAMode) {
            setSession(newSession)
          }
        } else {
          setSession(newSession)
        }
      }

      handleSession()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [pathname])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}
