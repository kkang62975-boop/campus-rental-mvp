import { useState } from 'react'

export default function NicknameGate({ title = '닉네임을 입력해주세요', onSubmit }) {
  const [nickname, setNickname] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(nickname.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-white space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-slate-500">
        아직 로그인 기능은 없어요. 다른 학생들에게 보여질 닉네임만 정해주세요.
      </p>
      <div className="flex gap-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="예: 공학관불빛"
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={submitting || !nickname.trim()}
          className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50"
        >
          시작하기
        </button>
      </div>
    </form>
  )
}
