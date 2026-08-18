const STYLES = {
  lend: 'bg-blue-100 text-blue-700',
  borrow: 'bg-purple-100 text-purple-700',
}

const LABELS = {
  lend: '빌려줘요',
  borrow: '구해요',
}

export default function PostTypeBadge({ postType }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        STYLES[postType] ?? 'bg-slate-200 text-slate-600'
      }`}
    >
      {LABELS[postType] ?? postType}
    </span>
  )
}
