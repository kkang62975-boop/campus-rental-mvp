import { useCallback, useEffect, useState } from 'react'
import { ensureLocalProfile, getLocalProfile } from '../lib/localProfile'
import { setPin } from '../lib/pin'

export function useProfile() {
  const [profile, setProfile] = useState(() => getLocalProfile())

  // localStorage에는 프로필이 있는데 서버 DB에는 없는 경우(테스트 중 DB 초기화 등)를
  // 대비해, 로컬 프로필을 쓸 때마다 서버에도 실제로 존재하도록 조용히 재동기화한다.
  // 이게 없으면 rental_requests.requester_id 외래키 위반으로 요청이 조용히 실패한다.
  useEffect(() => {
    if (!profile) return
    ensureLocalProfile({ nickname: profile.nickname, campusId: profile.campusId }).catch(() => {})
  }, [profile?.id])

  const registerNickname = useCallback(async (nickname, pin, campusId) => {
    const next = await ensureLocalProfile({ nickname, campusId })
    await setPin(next.id, pin)
    setProfile(next)
    return next
  }, [])

  return { profile, registerNickname }
}
