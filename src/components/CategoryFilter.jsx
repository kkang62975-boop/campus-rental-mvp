export default function CategoryFilter({ categories, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
          !selectedId
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-slate-600 border-slate-200'
        }`}
      >
        전체
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${
            selectedId === c.id
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}
