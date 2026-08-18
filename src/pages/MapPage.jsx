import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import CampusMap from '../components/CampusMap'
import ItemCard from '../components/ItemCard'
import { useCampus } from '../hooks/useCampuses'
import { useBuildings } from '../hooks/useBuildings'
import { useItems } from '../hooks/useItems'

export default function MapPage() {
  const { campusSlug } = useParams()
  const navigate = useNavigate()
  const { campus, loading: campusLoading } = useCampus(campusSlug)
  const { buildings } = useBuildings(campus?.id)
  const { items } = useItems({ campusId: campus?.id })
  const [selectedBuildingId, setSelectedBuildingId] = useState(null)

  const itemCountByBuilding = useMemo(() => {
    const counts = {}
    for (const item of items) {
      if (item.status !== 'available' || !item.building_id) continue
      counts[item.building_id] = (counts[item.building_id] ?? 0) + 1
    }
    return counts
  }, [items])

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId)
  const buildingItems = items.filter((i) => i.building_id === selectedBuildingId)

  if (campusLoading) {
    return (
      <Layout>
        <p className="text-slate-400">불러오는 중...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-1">{campus?.name ?? '캠퍼스 지도'}</h1>
      <p className="text-sm text-slate-500 mb-4">
        건물을 클릭하면 그 건물에 등록된 물품을 보거나, 새 물품을 등록할 수 있어요.
      </p>

      <CampusMap
        campus={campus}
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={(b) => setSelectedBuildingId(b.id)}
        itemCountByBuilding={itemCountByBuilding}
      />

      {selectedBuilding && (
        <div className="mt-4 border rounded-xl bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{selectedBuilding.name}</h2>
            <button
              onClick={() =>
                navigate(`/${campusSlug}/items/new?buildingId=${selectedBuilding.id}`)
              }
              className="text-sm px-3 py-1.5 rounded-md bg-brand-600 text-white font-medium"
            >
              + 이 건물에 물품 등록
            </button>
          </div>

          {buildingItems.length === 0 ? (
            <p className="text-sm text-slate-400 mt-3">아직 등록된 물품이 없어요.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {buildingItems.map((item) => (
                <ItemCard key={item.id} item={item} campusSlug={campusSlug} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to={`/${campusSlug}/items`} className="text-sm text-brand-600 font-medium">
          전체 물품 목록 보기 →
        </Link>
      </div>
    </Layout>
  )
}
