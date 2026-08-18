import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { updateItemStatus } from './useItems'

const REQUEST_SELECT = `
  *,
  item:items(id, title, status, owner_id, photo_url),
  requester:profiles!rental_requests_requester_id_fkey(id, nickname)
`

export function useRequestsForItem(itemId) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
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
      .from('rental_requests')
      .select(REQUEST_SELECT)
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setRequests(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [itemId, reloadToken])

  return { requests, loading, reload }
}

export async function createRentalRequest({ itemId, requesterId, message }) {
  const { data, error } = await supabase
    .from('rental_requests')
    .insert({ item_id: itemId, requester_id: requesterId, message })
    .select()
    .single()
  if (error) throw error
  return data
}

// 요청 수락 -> 채팅방 자동 생성 + 물품 상태를 '대여중'으로 변경
export async function acceptRequest(request) {
  const { error: updateError } = await supabase
    .from('rental_requests')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', request.id)
  if (updateError) throw updateError

  await updateItemStatus(request.item_id, 'rented')

  const { data: chatRoom, error: chatError } = await supabase
    .from('chat_rooms')
    .insert({ rental_request_id: request.id })
    .select()
    .single()
  if (chatError) throw chatError

  return chatRoom
}

export async function rejectRequest(requestId) {
  const { error } = await supabase
    .from('rental_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', requestId)
  if (error) throw error
}

// 반납 완료 -> 요청 완료 처리 + 물품 상태를 '반납완료'로 변경
export async function completeRequest(request) {
  const { error } = await supabase
    .from('rental_requests')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', request.id)
  if (error) throw error

  await updateItemStatus(request.item_id, 'returned')
}

export async function getChatRoomForRequest(requestId) {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('rental_request_id', requestId)
    .single()
  if (error) throw error
  return data
}
