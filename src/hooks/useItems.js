import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const ITEM_SELECT = `
  *,
  building:buildings(id, name, code),
  category:categories(id, name),
  owner:profiles(id, nickname)
`

export function useItems({ campusId, buildingId, categoryId, sort = 'newest' } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    if (!supabase || !campusId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    let query = supabase.from('items').select(ITEM_SELECT).eq('campus_id', campusId)
    if (buildingId) query = query.eq('building_id', buildingId)
    if (categoryId) query = query.eq('category_id', categoryId)
    query = query.order('created_at', { ascending: sort === 'oldest' })

    query.then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error)
      else setItems(data)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [campusId, buildingId, categoryId, sort, reloadToken])

  return { items, loading, error, reload }
}

export function useItem(itemId) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    if (!supabase || !itemId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('items')
      .select(ITEM_SELECT)
      .eq('id', itemId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error)
        else setItem(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [itemId, reloadToken])

  return { item, loading, error, reload }
}

export async function createItem(payload) {
  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateItemStatus(itemId, status) {
  const { data, error } = await supabase
    .from('items')
    .update({ status })
    .eq('id', itemId)
    .select()
    .single()
  if (error) throw error
  return data
}
