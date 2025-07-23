// File: src/app/SessionProvider.tsx
// Commit: Enforce 2FA gate only for managers, allow regular users immediately without delay or loop

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
      const verifiedEmail = localStorage.getItem('verifiedManager') ?? ''

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('manager_email')
        .eq('manager_email', email)
        .single()

      // ✅ Manager requires verification
      if (company && !companyError) {
        if (verifiedEmail === email) {
          setSession(session)
        } else {
          // ❌ Manager not yet 2FA verified
          return
        }
      } else {
        // ✅ Regular user, allow immediately
        setSession(session)
      }
    }

    initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
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
            return
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
