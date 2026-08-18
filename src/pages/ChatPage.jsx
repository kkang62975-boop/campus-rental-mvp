import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import ChatWindow from '../components/ChatWindow'
import { useProfile } from '../hooks/useProfile'
import { getChatRoomForRequest } from '../hooks/useRentalRequests'
import { supabase } from '../lib/supabaseClient'

export default function ChatPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const [chatRoom, setChatRoom] = useState(null)
  const [request, setRequest] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const room = await getChatRoomForRequest(requestId)
        const { data: req } = await supabase
          .from('rental_requests')
          .select('*, item:items(title)')
          .eq('id', requestId)
          .single()
        if (cancelled) return
        setChatRoom(room)
        setRequest(req)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [requestId])

  if (!profile) {
    return (
      <Layout>
        <p className="text-slate-500">닉네임 설정 후 이용할 수 있어요.</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 mb-3">
        ← 뒤로
      </button>
      <h1 className="text-lg font-bold mb-3">{request?.item?.title ?? '채팅'}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {chatRoom && <ChatWindow chatRoomId={chatRoom.id} profile={profile} />}
    </Layout>
  )
}
