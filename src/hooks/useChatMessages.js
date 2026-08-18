import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useChatMessages(chatRoomId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !chatRoomId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    supabase
      .from('chat_messages')
      .select('*, sender:profiles(id, nickname)')
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error) setMessages(data)
        setLoading(false)
      })

    const channel = supabase
      .channel(`chat_room:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, nickname')
            .eq('id', payload.new.sender_id)
            .single()
          setMessages((prev) => [...prev, { ...payload.new, sender }])
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [chatRoomId])

  return { messages, loading }
}

export async function sendMessage({ chatRoomId, senderId, content }) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ chat_room_id: chatRoomId, sender_id: senderId, content })
  if (error) throw error
}
