import { useState } from 'react'
import { createRentalRequest } from '../hooks/useRentalRequests'
import { trackEvent } from '../lib/analytics'

const COPY = {
  lend: {
    heading: '대여 요청',
    placeholder: '언제, 어디서 받을 수 있는지 간단히 남겨주세요 (선택)',
    submit: '요청 보내기',
  },
  borrow: {
    heading: '빌려드리기 제안',
    placeholder: '언제, 어디서 전달 가능한지 간단히 남겨주세요 (선택)',
    submit: '제안 보내기',
  },
}

// 아이템에 이미 적혀 있는 시간/장소 정보로 기본 메시지를 만들어준다.
// 요청자가 같은 내용을 처음부터 다시 타이핑하지 않아도 되게 하기 위함.
function buildDefaultMessage(item) {
  const place = item.location_text || item.building?.name
  const time = item.available_time
  const isBorrow = item.post_type === 'borrow'

  if (time && place) {
    return isBorrow ? `${time}에 ${place}에서 전달해드릴게요.` : `${time}에 ${place}로 받으러 갈게요.`
  }
  if (time) {
    return isBorrow ? `${time}에 전달해드릴게요.` : `${time}에 받으러 갈게요.`
  }
  if (place) {
    return isBorrow ? `${place}에서 전달해드릴게요.` : `${place}로 받으러 갈게요.`
  }
  return ''
}

export default function RentalRequestModal({ item, requesterId, onClose, onSent }) {
  const [message, setMessage] = useState(() => buildDefaultMessage(item))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const copy = COPY[item.post_type] ?? COPY.lend

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createRentalRequest({ itemId: item.id, requesterId, message })
      trackEvent('send_rental_request', { post_type: item.post_type })
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
        <h2 className="font-semibold">
          "{item.title}" {copy.heading}
        </h2>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={copy.placeholder}
            className="w-full border rounded-md px-3 py-2 text-sm h-24 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            물품 정보로 미리 채워봤어요. 필요하면 고쳐서 보내세요.
          </p>
        </div>
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
            {copy.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
