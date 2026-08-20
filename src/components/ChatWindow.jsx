import { useEffect, useRef, useState } from 'react'
import { sendMessage, useChatMessages } from '../hooks/useChatMessages'
import { trackEvent } from '../lib/analytics'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatWindow({ chatRoomId, profile }) {
  const { messages, loading } = useChatMessages(chatRoomId)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await sendMessage({ chatRoomId, senderId: profile.id, content })
    trackEvent('send_chat_message')
  }

  return (
    <div className="flex flex-col h-[70vh] border rounded-lg bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && <p className="text-sm text-slate-400">불러오는 중...</p>}
        {messages.map((m) => {
          const mine = m.sender_id === profile.id
          return (
            <div
              key={m.id}
              className={`flex items-end gap-1.5 ${mine ? 'justify-end' : 'justify-start'}`}
            >
              {mine && <span className="text-[10px] text-slate-400 shrink-0">{formatTime(m.created_at)}</span>}
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {!mine && (
                  <p className="text-[10px] font-medium opacity-70 mb-0.5">
                    {m.sender?.nickname ?? '상대방'}
                  </p>
                )}
                {m.content}
              </div>
              {!mine && <span className="text-[10px] text-slate-400 shrink-0">{formatTime(m.created_at)}</span>}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t p-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지 입력"
          className="flex-1 border rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium"
        >
          전송
        </button>
      </form>
    </div>
  )
}
