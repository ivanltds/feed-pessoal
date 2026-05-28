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
  featured?: boolean
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function NewsCard({ item, position, total, featured = false }: Props) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Imagem */}
      {item.imageUrl && (
        <div className={`w-full overflow-hidden bg-neutral-100 ${featured ? 'aspect-[16/7]' : 'aspect-[16/9]'}`}>
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 p-4 ${featured ? 'p-5' : 'p-4'}`}>
        {/* Tópico + contador */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            {item.topic}
          </span>
          <span className="text-xs text-neutral-400">{position}/{total}</span>
        </div>

        {/* Título */}
        <h2 className={`font-semibold leading-snug text-neutral-900 group-hover:text-blue-700 transition-colors flex-1 ${
          featured ? 'text-lg' : 'text-sm'
        }`}>
          {item.normalizedTitle}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-neutral-500">{item.sourceName}</span>
          <span className="text-neutral-400">·</span>
          <span className="text-xs text-neutral-500">{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </a>
  )
}
