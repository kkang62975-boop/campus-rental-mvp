import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import PostTypeBadge from '../components/PostTypeBadge'
import NicknameGate from '../components/NicknameGate'
import RentalRequestModal from '../components/RentalRequestModal'
import { useItem } from '../hooks/useItems'
import { useCampus } from '../hooks/useCampuses'
import { useProfile } from '../hooks/useProfile'
import {
  acceptRequest,
  completeRequest,
  rejectRequest,
  useRequestsForItem,
} from '../hooks/useRentalRequests'

const COPY = {
  lend: {
    requestButton: '대여 요청 보내기',
    unavailableRented: '지금은 다른 사람이 대여 중이에요.',
    unavailableReturned: '반납 완료되어 더 이상 대여할 수 없어요.',
    pendingWait: '요청을 보냈어요. 상대방의 수락을 기다리는 중...',
    pendingListTitle: '대여 요청',
    completeButton: '반납 완료 처리',
  },
  borrow: {
    requestButton: '제가 빌려드릴게요',
    unavailableRented: '이미 다른 분이 빌려주기로 했어요.',
    unavailableReturned: '요청이 마감됐어요.',
    pendingWait: '빌려드리겠다고 알렸어요. 상대방의 확인을 기다리는 중...',
    pendingListTitle: '빌려주겠다는 사람',
    completeButton: '완료 처리',
  },
}

export default function ItemDetailPage() {
  const { campusSlug, itemId } = useParams()
  const navigate = useNavigate()
  const { campus } = useCampus(campusSlug)
  const { item, loading, reload } = useItem(itemId)
  const { profile, registerNickname } = useProfile()
  const { requests, reload: reloadRequests } = useRequestsForItem(itemId)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [busyRequestId, setBusyRequestId] = useState(null)

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-400">불러오는 중...</p>
      </Layout>
    )
  }

  if (!item) {
    return (
      <Layout>
        <p className="text-slate-400">물품을 찾을 수 없어요.</p>
      </Layout>
    )
  }

  const copy = COPY[item.post_type] ?? COPY.lend
  const isOwner = profile?.id === item.owner_id
  const myRequest = requests.find((r) => r.requester_id === profile?.id)
  const pendingRequests = requests.filter((r) => r.status === 'pending')

  const refreshAll = () => {
    reload()
    reloadRequests()
  }

  const handleAccept = async (request) => {
    setBusyRequestId(request.id)
    try {
      const chatRoom = await acceptRequest(request)
      refreshAll()
      navigate(`/chat/${request.id}`, { state: { chatRoomId: chatRoom.id } })
    } finally {
      setBusyRequestId(null)
    }
  }

  const handleReject = async (request) => {
    setBusyRequestId(request.id)
    try {
      await rejectRequest(request.id)
      refreshAll()
    } finally {
      setBusyRequestId(null)
    }
  }

  const handleComplete = async () => {
    const activeRequest = requests.find((r) => r.status === 'accepted')
    if (!activeRequest) return
    setBusyRequestId(activeRequest.id)
    try {
      await completeRequest(activeRequest)
      refreshAll()
    } finally {
      setBusyRequestId(null)
    }
  }

  return (
    <Layout>
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
          {item.photo_url ? (
            <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            '사진 없음'
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{item.title}</h1>
            <div className="flex gap-1 shrink-0">
              <PostTypeBadge postType={item.post_type} />
              <StatusBadge status={item.status} postType={item.post_type} />
            </div>
          </div>
          <p className="text-sm text-slate-500">
            {item.category?.name} · {item.building?.name ?? '위치 미지정'}
            {item.location_text ? ` (${item.location_text})` : ''}
          </p>
          {item.available_time && (
            <p className="text-sm">
              <span className="text-slate-400">
                {item.post_type === 'borrow' ? '필요한 시간대' : '대여 가능 시간'}
              </span>{' '}
              {item.available_time}
            </p>
          )}
          {item.description && <p className="text-sm text-slate-700">{item.description}</p>}
          <p className="text-xs text-slate-400">등록자: {item.owner?.nickname ?? '알 수 없음'}</p>
        </div>
      </div>

      <div className="mt-4">
        {!profile && !isOwner && (
          <NicknameGate
            title="대여 요청을 보내려면 닉네임이 필요해요"
            onSubmit={(nickname) => registerNickname(nickname, campus?.id)}
          />
        )}

        {profile && !isOwner && item.status === 'available' && !myRequest && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full py-2.5 rounded-md bg-brand-600 text-white font-medium"
          >
            {copy.requestButton}
          </button>
        )}

        {profile && !isOwner && item.status !== 'available' && !myRequest && (
          <p className="text-sm text-slate-500 text-center">
            {item.status === 'rented' ? copy.unavailableRented : copy.unavailableReturned}
          </p>
        )}

        {myRequest && myRequest.status === 'pending' && (
          <p className="text-sm text-slate-500 text-center">{copy.pendingWait}</p>
        )}

        {myRequest && myRequest.status === 'accepted' && (
          <button
            onClick={() => navigate(`/chat/${myRequest.id}`)}
            className="w-full py-2.5 rounded-md bg-brand-600 text-white font-medium"
          >
            채팅방으로 이동
          </button>
        )}

        {isOwner && pendingRequests.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">
              {copy.pendingListTitle} ({pendingRequests.length})
            </h2>
            {pendingRequests.map((r) => (
              <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.requester?.nickname}</p>
                  {r.message && <p className="text-xs text-slate-500">{r.message}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busyRequestId === r.id}
                    onClick={() => handleReject(r)}
                    className="px-3 py-1.5 rounded-md text-sm border"
                  >
                    거절
                  </button>
                  <button
                    disabled={busyRequestId === r.id}
                    onClick={() => handleAccept(r)}
                    className="px-3 py-1.5 rounded-md text-sm bg-brand-600 text-white"
                  >
                    수락
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwner && item.status === 'rented' && (
          <button
            onClick={handleComplete}
            className="w-full py-2.5 rounded-md bg-emerald-600 text-white font-medium"
          >
            {copy.completeButton}
          </button>
        )}
      </div>

      {showRequestModal && (
        <RentalRequestModal
          item={item}
          requesterId={profile.id}
          onClose={() => setShowRequestModal(false)}
          onSent={() => {
            setShowRequestModal(false)
            refreshAll()
          }}
        />
      )}
    </Layout>
  )
}
