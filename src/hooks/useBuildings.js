import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useBuildings(campusId) {
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase || !campusId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('buildings')
      .select('*')
      .eq('campus_id', campusId)
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error)
        else setBuildings(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [campusId])

  return { buildings, loading, error }
}
