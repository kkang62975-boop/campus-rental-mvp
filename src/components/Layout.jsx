import { Link, useParams } from 'react-router-dom'
import SupabaseWarningBanner from './SupabaseWarningBanner'

export default function Layout({ children }) {
  const { campusSlug } = useParams()

  return (
    <div className="min-h-full flex flex-col">
      <SupabaseWarningBanner />
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-brand-600">
            성균관대 캠퍼스 대여
          </Link>
          {campusSlug && (
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <Link to={`/${campusSlug}/map`} className="hover:text-brand-600">
                지도
              </Link>
              <Link to={`/${campusSlug}/items`} className="hover:text-brand-600">
                목록
              </Link>
              <Link to={`/${campusSlug}/my`} className="hover:text-brand-600">
                마이
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
