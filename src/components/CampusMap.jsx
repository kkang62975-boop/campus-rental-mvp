import BuildingMarker from './BuildingMarker'

export default function CampusMap({
  campus,
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  itemCountByBuilding = {},
}) {
  const hasRealMap = Boolean(campus?.map_image_url)

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-xl border overflow-hidden bg-slate-100"
      style={
        hasRealMap
          ? {
              backgroundImage: `url(${campus.map_image_url})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }
          : {
              backgroundColor: '#e2e8f0',
              backgroundImage:
                'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '5% 5%',
            }
      }
    >
      {!hasRealMap && (
        <div className="absolute top-2 left-2 text-[11px] text-slate-500 bg-white/80 px-2 py-1 rounded">
          이 캠퍼스는 아직 지도 이미지가 없어요 (자리표시자)
        </div>
      )}
      {buildings.map((building) => (
        <BuildingMarker
          key={building.id}
          building={building}
          selected={building.id === selectedBuildingId}
          availableCount={itemCountByBuilding[building.id] ?? 0}
          onClick={onSelectBuilding}
        />
      ))}
    </div>
  )
}
