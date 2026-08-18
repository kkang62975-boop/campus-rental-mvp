import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import NicknameGate from '../components/NicknameGate'
import { useProfile } from '../hooks/useProfile'
import { useCampus } from '../hooks/useCampuses'
import { supabase } from '../lib/supabaseClient'
import { setPin } from '../lib/pin'

const REQUEST_STATUS_LABEL = {
  pending: '수락 대기중',
  accepted: '수락됨 · 채팅 가능',
  rejected: '거절됨',
  completed: '반납 완료',
}

export default function MyPage() {
  const { campusSlug } = useParams()
  const navigate = useNavigate()
  const { campus } = useCampus(campusSlug)
  const { profile, registerNickname } = useProfile()
  const [myItems, setMyItems] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [pinInput, setPinInput] = useState('')
  const [pinSaving, setPinSaving] = useState(false)
  const [pinError, setPinError] = useState(null)
  const [pinSaved, setPinSaved] = useState(false)

  useEffect(() => {
    if (!supabase || !profile) return
    supabase
      .from('items')
      .select('*, category:categories(name), building:buildings(name)')
      .eq('owner_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setMyItems(data))

    supabase
      .from('rental_requests')
      .select('*, item:items(id, title, status)')
      .eq('requester_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => data && setMyRequests(data))
  }, [profile])

  const handleSetPin = async (e) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(pinInput)) return
    setPinSaving(true)
    setPinError(null)
    try {
      await setPin(profile.id, pinInput)
      setPinSaved(true)
      setPinInput('')
    } catch (err) {
      setPinError(err.message)
    } finally {
      setPinSaving(false)
    }
  }

  if (!profile) {
    return (
      <Layout>
        <h1 className="text-xl font-bold mb-4">마이페이지</h1>
        <NicknameGate onSubmit={(nickname, pin) => registerNickname(nickname, pin, campus?.id)} />
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-1">{profile.nickname}님</h1>
      <p className="text-sm text-slate-500 mb-6">로그인 없이 이 브라우저에만 저장된 닉네임이에요.</p>

      <section className="mb-8 border rounded-lg p-4 bg-white">
        <h2 className="font-semibold mb-1">비밀번호 설정/변경</h2>
        <p className="text-xs text-slate-500 mb-3">
          내 글을 수정/삭제할 때 쓰는 4자리 비밀번호예요. 아직 없거나 잊었다면 여기서 새로 정하면
          바로 바뀝니다.
        </p>
        <form onSubmit={handleSetPin} className="flex gap-2">
          <input
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))
              setPinSaved(false)
            }}
            placeholder="숫자 4자리"
            inputMode="numeric"
            maxLength={4}
            className="flex-1 border rounded-md px-3 py-2 text-sm tracking-widest"
          />
          <button
            type="submit"
            disabled={pinSaving || pinInput.length !== 4}
            className="px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium disabled:opacity-50"
          >
            저장
          </button>
        </form>
        {pinError && <p className="text-xs text-red-600 mt-2">{pinError}</p>}
        {pinSaved && <p className="text-xs text-emerald-600 mt-2">비밀번호가 저장됐어요.</p>}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">내가 등록한 물품</h2>
        {myItems.length === 0 ? (
          <p className="text-sm text-slate-400">아직 등록한 물품이 없어요.</p>
        ) : (
          <div className="space-y-2">
            {myItems.map((item) => (
              <Link
                key={item.id}
                to={`/${campusSlug}/items/${item.id}`}
                className="flex items-center justify-between border rounded-lg p-3 bg-white"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.category?.name} · {item.building?.name ?? '위치 미지정'}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">내가 보낸 대여 요청</h2>
        {myRequests.length === 0 ? (
          <p className="text-sm text-slate-400">아직 보낸 요청이 없어요.</p>
        ) : (
          <div className="space-y-2">
            {myRequests.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  r.status === 'accepted'
                    ? navigate(`/chat/${r.id}`)
                    : navigate(`/${campusSlug}/items/${r.item.id}`)
                }
                className="w-full flex items-center justify-between border rounded-lg p-3 bg-white text-left"
              >
                <p className="text-sm font-medium">{r.item?.title}</p>
                <span className="text-xs text-slate-500">{REQUEST_STATUS_LABEL[r.status]}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
