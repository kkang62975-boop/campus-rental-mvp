export default function BuildingMarker({ building, selected, availableCount, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(building)}
      title={building.name}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
      style={{ left: `${building.pos_x}%`, top: `${building.pos_y}%` }}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full border-2 shadow text-xs font-bold transition
          ${
            selected
              ? 'bg-brand-600 border-brand-700 text-white scale-110'
              : 'bg-white/90 border-brand-500 text-brand-600 group-hover:scale-110'
          }`}
      >
        {availableCount > 0 ? availableCount : ''}
      </span>
      <span className="mt-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
        {building.name}
      </span>
    </button>
  )
}
