// File: src/app/SessionProvider.tsx
// Commit: Delay session activation for managers until 2FA verified via localStorage key

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

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

  useEffect(() => {
    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      const session = data.session

      if (!session || error) return

      const email = session.user.email ?? ''

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('manager_email')
        .eq('manager_email', email)
        .single()

      const verifiedEmail = localStorage.getItem('verifiedManager') ?? ''

      if (company && !companyError) {
        if (verifiedEmail === email) {
          setSession(session)
        } else {
          // Don't setSession yet — waiting on 2FA
        }
      } else {
        setSession(session)
      }
    }

    initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      const email = newSession?.user.email ?? ''
      const verifiedEmail = localStorage.getItem('verifiedManager') ?? ''

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
          if (verifiedEmail === email) {
            setSession(newSession)
          } else {
            // Hold session until verified
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
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}
