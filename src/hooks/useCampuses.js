import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCampuses() {
  const [campuses, setCampuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('campuses')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error)
        else setCampuses(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { campuses, loading, error }
}

export function useCampus(slug) {
  const [campus, setCampus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase || !slug) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('campuses')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error)
        else setCampus(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { campus, loading, error }
}
