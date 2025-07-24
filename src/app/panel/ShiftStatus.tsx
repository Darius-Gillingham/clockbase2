// File: src/app/panel/ShiftStatus.tsx
// Commit: Load latest geo shift timestamps directly if shift is active

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from '../SessionProvider'

interface ShiftStatusProps {
  shiftLog: {
    start?: string
    end?: string
  }
  shiftActive: boolean
}

export default function ShiftStatus({ shiftLog, shiftActive }: ShiftStatusProps) {
  const { session } = useSessionContext()
  const [start, setStart] = useState<string | undefined>(shiftLog.start)
  const [end, setEnd] = useState<string | undefined>(shiftLog.end)

  useEffect(() => {
    const fetchLatestShift = async () => {
      if (!shiftActive || !session?.user?.id) return

      const { data, error } = await supabase
        .from('geo_shifts')
        .select('shift_start, shift_end')
        .eq('user_id', session.user.id)
        .order('shift_start', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setStart(data.shift_start || undefined)
        setEnd(data.shift_end || undefined)
      }
    }

    fetchLatestShift()
  }, [shiftActive, session])

  const renderTimestamp = (label: string, value?: string) => {
    if (!value) return null
    return (
      <p>
        {label}: {new Date(value).toLocaleString()}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {(start || end) && (
        <div className="text-sm text-gray-600">
          {renderTimestamp('Start', start)}
          {renderTimestamp('End', end)}
        </div>
      )}
      <div className="text-sm text-gray-700">
        Shift is currently:{' '}
        <span className={shiftActive ? 'text-green-600' : 'text-red-600'}>
          {shiftActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
    </div>
  )
}
