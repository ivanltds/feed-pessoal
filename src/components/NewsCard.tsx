'use client'

interface NewsItem {
  id: string
  topic: string
  sourceName: string
  normalizedTitle: string
  imageUrl: string | null
  url: string
  publishedAt: Date
}

interface Props {
  item: NewsItem
  position: number
  total: number
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function NewsCard({ item, position, total }: Props) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Imagem */}
      {item.imageUrl && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        {/* Tópico + contador */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {item.topic}
          </span>
          <span className="text-xs text-neutral-300">{position}/{total}</span>
        </div>

        {/* Título normalizado */}
        <h2 className="text-base font-semibold leading-snug text-neutral-900 group-hover:text-blue-700 transition-colors">
          {item.normalizedTitle}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-neutral-400">{item.sourceName}</span>
          <span className="text-neutral-200">·</span>
          <span className="text-xs text-neutral-400">{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </a>
  )
}
