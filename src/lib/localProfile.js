import { supabase } from './supabaseClient'

const STORAGE_KEY = 'campus-rental:profile'

export function getLocalProfile() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveLocalProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function clearLocalProfile() {
  localStorage.removeItem(STORAGE_KEY)
}

// 로그인 없이 닉네임만으로 임시 프로필을 만든다.
// 추후 Supabase Auth를 붙이면 이 함수 대신 auth.uid()를 profiles.id로 사용하면 된다.
export async function ensureLocalProfile({ nickname, campusId }) {
  const existing = getLocalProfile()
  const id = existing?.id ?? crypto.randomUUID()
  const profile = { id, nickname, campusId }

  if (supabase) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id, nickname, campus_id: campusId }, { onConflict: 'id' })
    if (error) throw error
  }

  saveLocalProfile(profile)
  return profile
}
