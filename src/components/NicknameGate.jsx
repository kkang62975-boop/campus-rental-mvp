import { useState } from 'react'

export default function NicknameGate({ title = '닉네임을 입력해주세요', onSubmit }) {
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isValid = nickname.trim().length > 0 && /^\d{4}$/.test(pin)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(nickname.trim(), pin)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-white space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-slate-500">
        아직 로그인 기능은 없어요. 닉네임과 숫자 4자리 비밀번호만 정해주세요 — 이 비밀번호로 나중에
        내가 올린 글을 수정/삭제할 수 있어요.
      </p>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임 (예: 공학관불빛)"
        className="w-full border rounded-md px-3 py-2 text-sm"
        maxLength={20}
      />
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="숫자 4자리 비밀번호"
        inputMode="numeric"
        maxLength={4}
        className="w-full border rounded-md px-3 py-2 text-sm tracking-widest"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !isValid}
        className="w-full px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50"
      >
        시작하기
      </button>
    </form>
  )
}
