import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CategoryFilter from '../components/CategoryFilter'
import ItemCard from '../components/ItemCard'
import { useCampus } from '../hooks/useCampuses'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'

export default function ItemListPage() {
  const { campusSlug } = useParams()
  const { campus } = useCampus(campusSlug)
  const { categories } = useCategories()
  const [categoryId, setCategoryId] = useState(null)
  const [sort, setSort] = useState('newest')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // 검색어는 300ms 디바운스 후 실제 쿼리에 반영
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { items, loading } = useItems({
    campusId: campus?.id,
    categoryId,
    status: availableOnly ? 'available' : undefined,
    search,
    sort,
  })

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">{campus?.name ?? '물품 목록'}</h1>

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
          대여 가능만 보기
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
        <p className="text-slate-400">
          {search ? `"${search}"에 대한 검색 결과가 없어요.` : '아직 등록된 물품이 없어요.'}
        </p>
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
