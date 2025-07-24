'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSessionContext } from '../SessionProvider'

type ShiftLog = {
  start: string
  end: string
  range: string
}

interface ShiftControlsProps {
  onShiftLogUpdate: (log: Partial<ShiftLog>) => void
  onShiftStatusRefresh: () => void
  shiftActive: boolean
  setError: (err: string | null) => void
}

export default function ShiftControls({
  onShiftLogUpdate,
  onShiftStatusRefresh,
  shiftActive,
  setError
}: ShiftControlsProps) {
  const { session } = useSessionContext()
  const [clock, setClock] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setClock(now.toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const buttonClass =
    'w-full bg-blue-600 border-2 border-purple-600 text-white py-2 rounded hover:bg-blue-700 transition'

  const getGeoPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported.'))
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      }
    })
  }

  const handleStartShift = async () => {
    setLoading(true)
    setError(null)

    if (!session?.user?.id) {
      setError('Authentication error.')
      setLoading(false)
      return
    }

    let coords: GeolocationCoordinates
    try {
      const pos = await getGeoPosition()
      coords = pos.coords
    } catch (err) {
      setError('Location permission is required to start a shift.')
      setLoading(false)
      return
    }

    const userId = session.user.id
    const now = new Date().toISOString()

    const { error: insertError } = await supabase.from('geo_shifts').insert([
      {
        user_id: userId,
        shift_start: now,
        shift_start_lat: coords.latitude,
        shift_start_lng: coords.longitude,
        shift_active: true
      }
    ])

    if (insertError) {
      console.error('Insert error:', insertError)
      setError(insertError.message)
    } else {
      onShiftLogUpdate({ start: now })
    }

    await onShiftStatusRefresh()
    setLoading(false)
  }

  const handleEndShift = async () => {
    setLoading(true)
    setError(null)

    if (!session?.user?.id) {
      setError('Authentication error.')
      setLoading(false)
      return
    }

    let coords: GeolocationCoordinates
    try {
      const pos = await getGeoPosition()
      coords = pos.coords
    } catch (err) {
      setError('Location permission is required to end a shift.')
      setLoading(false)
      return
    }

    const userId = session.user.id

    const { data: openShift, error: fetchError } = await supabase
      .from('geo_shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('shift_active', true)
      .order('shift_start', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !openShift) {
      setError('No active shift to end.')
      setLoading(false)
      return
    }

    const endTime = new Date()
    const shiftStart = new Date(openShift.shift_start)
    const range = `${shiftStart.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`

    const { error: updateError } = await supabase
      .from('geo_shifts')
      .update({
        shift_end: endTime.toISOString(),
        shift_end_lat: coords.latitude,
        shift_end_lng: coords.longitude,
        shift_active: false
      })
      .eq('id', openShift.id)

    if (updateError) {
      console.error('Update error:', updateError)
      setError(updateError.message)
    } else {
      onShiftLogUpdate({
        start: openShift.shift_start,
        end: endTime.toISOString(),
        range
      })
    }

    await onShiftStatusRefresh()
    setLoading(false)
  }

  return (
    <>
      <div className="text-xl font-mono text-gray-700">{clock}</div>
      <div className="flex flex-col w-full max-w-xs gap-4">
        <button onClick={handleStartShift} disabled={loading} className={buttonClass}>
          Start Shift
        </button>
        <button onClick={handleEndShift} disabled={loading} className={buttonClass}>
          End Shift
        </button>
      </div>
    </>
  )
}
