import { useState } from 'react'
import { verifyPin } from '../lib/pin'

export default function PinModal({ title = '비밀번호 확인', profileId, onClose, onVerified }) {
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (pin.length !== 4) return
    setSubmitting(true)
    setError(null)
    try {
      const ok = await verifyPin(profileId, pin)
      if (!ok) {
        setError('비밀번호가 맞지 않아요.')
        return
      }
      onVerified()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-xs p-5 space-y-3"
      >
        <h2 className="font-semibold text-center">{title}</h2>
        <input
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="숫자 4자리"
          inputMode="numeric"
          maxLength={4}
          className="w-full border rounded-md px-3 py-2 text-sm text-center tracking-[0.5em]"
        />
        {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        <p className="text-[11px] text-slate-400 text-center">
          비밀번호가 없거나 잊으셨다면 마이페이지에서 새로 정할 수 있어요.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm text-slate-600 border"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || pin.length !== 4}
            className="flex-1 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </form>
    </div>
  )
}
