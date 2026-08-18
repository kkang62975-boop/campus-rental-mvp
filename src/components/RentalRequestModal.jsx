import { useState } from 'react'
import { createRentalRequest } from '../hooks/useRentalRequests'

export default function RentalRequestModal({ item, requesterId, onClose, onSent }) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createRentalRequest({ itemId: item.id, requesterId, message })
      onSent?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-sm p-5 space-y-3"
      >
        <h2 className="font-semibold">"{item.title}" 대여 요청</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="언제, 어디서 받을 수 있는지 간단히 남겨주세요 (선택)"
          className="w-full border rounded-md px-3 py-2 text-sm h-24 resize-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-slate-600"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50"
          >
            요청 보내기
          </button>
        </div>
      </form>
    </div>
  )
}
