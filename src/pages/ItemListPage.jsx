import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CategoryFilter from '../components/CategoryFilter'
import ItemCard from '../components/ItemCard'
import { useCampus } from '../hooks/useCampuses'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import { trackEvent } from '../lib/analytics'

const POST_TYPE_TABS = [
  { value: null, label: '전체' },
  { value: 'lend', label: '빌려줘요' },
  { value: 'borrow', label: '구해요' },
]

export default function ItemListPage() {
  const { campusSlug } = useParams()
  const { campus } = useCampus(campusSlug)
  const { categories } = useCategories()
  const [postType, setPostType] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [sort, setSort] = useState('newest')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // 검색어는 300ms 디바운스 후 실제 쿼리에 반영. 검색어 원문은 GA로 보내지 않고
  // "검색을 사용했다"는 이벤트만 남긴다.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      if (searchInput.trim()) trackEvent('search_items')
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { items, loading } = useItems({
    campusId: campus?.id,
    categoryId,
    postType,
    status: availableOnly ? 'available' : undefined,
    search,
    sort,
  })

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">{campus?.name ?? '물품 목록'}</h1>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {POST_TYPE_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setPostType(tab.value)}
            className={`py-2 rounded-md text-sm font-medium border ${
              postType === tab.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="물건 이름으로 검색 (예: 보조배터리)"
        className="w-full border rounded-md px-3 py-2 text-sm mb-3"
      />

      <CategoryFilter categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <div className="flex items-center justify-between my-3">
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          가능한 것만 보기
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-400">
            {search ? `"${search}"에 대한 검색 결과가 없어요.` : '아직 등록된 물품이 없어요.'}
          </p>
          {search && (
            <Link
              to={`/${campusSlug}/items/new?postType=borrow&title=${encodeURIComponent(search)}`}
              onClick={() => trackEvent('start_item_form', { post_type: 'borrow', source: 'empty_search' })}
              className="inline-block mt-3 px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium"
            >
              "{search}" 구해요 글 바로 등록하기
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} campusSlug={campusSlug} />
          ))}
        </div>
      )}
    </Layout>
  )
}
