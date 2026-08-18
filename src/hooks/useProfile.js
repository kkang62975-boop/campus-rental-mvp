import { useCallback, useState } from 'react'
import { ensureLocalProfile, getLocalProfile } from '../lib/localProfile'
import { setPin } from '../lib/pin'

export function useProfile() {
  const [profile, setProfile] = useState(() => getLocalProfile())

  const registerNickname = useCallback(async (nickname, pin, campusId) => {
    const next = await ensureLocalProfile({ nickname, campusId })
    await setPin(next.id, pin)
    setProfile(next)
    return next
  }, [])

  return { profile, registerNickname }
}
