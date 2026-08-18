import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import NicknameGate from '../components/NicknameGate'
import { useProfile } from '../hooks/useProfile'
import { useCampus } from '../hooks/useCampuses'
import { supabase } from '../lib/supabaseClient'

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

  if (!profile) {
    return (
      <Layout>
        <h1 className="text-xl font-bold mb-4">마이페이지</h1>
        <NicknameGate onSubmit={(nickname) => registerNickname(nickname, campus?.id)} />
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-1">{profile.nickname}님</h1>
      <p className="text-sm text-slate-500 mb-6">로그인 없이 이 브라우저에만 저장된 닉네임이에요.</p>

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
