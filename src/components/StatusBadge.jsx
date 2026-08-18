const STYLES = {
  available: 'bg-emerald-100 text-emerald-700',
  rented: 'bg-amber-100 text-amber-700',
  returned: 'bg-slate-200 text-slate-600',
}

const LABELS = {
  lend: { available: '대여가능', rented: '대여중', returned: '반납완료' },
  borrow: { available: '구하는 중', rented: '매칭됨', returned: '완료' },
}

export default function StatusBadge({ status, postType = 'lend' }) {
  const label = LABELS[postType]?.[status] ?? LABELS.lend[status] ?? status
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        STYLES[status] ?? 'bg-slate-200 text-slate-600'
      }`}
    >
      {label}
    </span>
  )
}
