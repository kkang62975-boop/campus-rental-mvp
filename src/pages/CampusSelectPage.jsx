import { Link } from 'react-router-dom'
import { useCampuses } from '../hooks/useCampuses'
import Layout from '../components/Layout'
import { trackEvent } from '../lib/analytics'

const FALLBACK_CAMPUSES = [
  { slug: 'natural', name: '자연과학캠퍼스' },
  { slug: 'humanities', name: '인문사회과학캠퍼스' },
]

export default function CampusSelectPage() {
  const { campuses, loading } = useCampuses()
  const list = campuses.length > 0 ? campuses : FALLBACK_CAMPUSES

  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">캠퍼스 물품 대여</h1>
        <p className="text-slate-500 mt-2">시험 기간, 근처 학생에게 물건을 빌려보세요.</p>
      </div>
      {loading ? (
        <p className="text-center text-slate-400">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((campus) => (
            <Link
              key={campus.slug}
              to={`/${campus.slug}/map`}
              onClick={() => trackEvent('select_campus', { campus: campus.slug })}
              className="border rounded-xl p-6 bg-white text-center hover:border-brand-400 hover:shadow-sm transition"
            >
              <p className="text-lg font-semibold">{campus.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                {campus.slug === 'natural' ? '수원' : '서울 · 명륜동'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
