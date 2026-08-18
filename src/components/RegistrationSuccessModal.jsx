import StatusBadge from './StatusBadge'

export default function RegistrationSuccessModal({
  item,
  buildingItems,
  loadingBuildingItems,
  onViewDetail,
  onViewMap,
}) {
  const others = buildingItems.filter((i) => i.id !== item.id)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full sm:max-w-sm p-5 space-y-4">
        <div className="text-center">
          <p className="text-2xl">✅</p>
          <h2 className="text-lg font-bold mt-1">등록완료!</h2>
          <p className="text-sm text-slate-500 mt-1">
            "{item.title}"을(를) {item.building?.name ?? '캠퍼스'}에 등록했어요.
          </p>
        </div>

        {item.building_id && (
          <div>
            <p className="text-sm font-semibold mb-2">
              {item.building?.name}에 등록된 다른 물건
            </p>
            {loadingBuildingItems ? (
              <p className="text-sm text-slate-400">불러오는 중...</p>
            ) : others.length === 0 ? (
              <p className="text-sm text-slate-400">아직 이 건물에 다른 물건은 없어요.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {others.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between border rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">{i.title}</p>
                      <p className="text-xs text-slate-400">{i.category?.name}</p>
                    </div>
                    <StatusBadge status={i.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {item.building_id && (
            <button
              onClick={onViewMap}
              className="flex-1 py-2.5 rounded-md border text-sm font-medium"
            >
              지도에서 보기
            </button>
          )}
          <button
            onClick={onViewDetail}
            className="flex-1 py-2.5 rounded-md bg-brand-600 text-white text-sm font-medium"
          >
            내 물건 보기
          </button>
        </div>
      </div>
    </div>
  )
}
