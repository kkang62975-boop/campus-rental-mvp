import { useCallback, useState } from 'react'
import { ensureLocalProfile, getLocalProfile } from '../lib/localProfile'

export function useProfile() {
  const [profile, setProfile] = useState(() => getLocalProfile())

  const registerNickname = useCallback(async (nickname, campusId) => {
    const next = await ensureLocalProfile({ nickname, campusId })
    setProfile(next)
    return next
  }, [])

  return { profile, registerNickname }
}
