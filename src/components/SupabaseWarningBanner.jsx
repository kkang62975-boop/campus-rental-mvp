import { isSupabaseConfigured } from '../lib/supabaseClient'

export default function SupabaseWarningBanner() {
  if (isSupabaseConfigured) return null

  return (
    <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 text-center">
      Supabase가 아직 연결되지 않았습니다. <code>.env.local</code>에{' '}
      <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>를
      설정하고 <code>supabase/schema.sql</code>을 실행해주세요.
    </div>
  )
}
