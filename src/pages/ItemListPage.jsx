import { useState } from 'react'
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
  const { items, loading } = useItems({ campusId: campus?.id, categoryId, sort })

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">{campus?.name ?? '물품 목록'}</h1>

      <CategoryFilter categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <div className="flex justify-end my-3">
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
        <p className="text-slate-400">아직 등록된 물품이 없어요.</p>
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
