import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function ItemCard({ item, campusSlug }) {
  return (
    <Link
      to={`/${campusSlug}/items/${item.id}`}
      className="flex gap-3 border rounded-lg p-3 bg-white hover:border-brand-400 transition"
    >
      <div className="w-16 h-16 shrink-0 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          '사진 없음'
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold truncate">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {item.category?.name} · {item.building?.name ?? '위치 미지정'}
        </p>
        {item.available_time && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">대여가능: {item.available_time}</p>
        )}
      </div>
    </Link>
  )
}
