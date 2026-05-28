'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const BEHIND_THE_SCENES = [
  {
    emoji: '📡',
    title: 'Consultando fontes ao redor do mundo',
    body: 'Neste momento estamos varrendo dezenas de feeds RSS de veículos como TechCrunch, InfoMoney, BBC e outros — coletando tudo que foi publicado nas últimas 48 horas.',
  },
  {
    emoji: '🤖',
    title: 'Uma IA reescreve cada título',
    body: 'Sabe aqueles títulos "Você não vai acreditar no que aconteceu…"? A gente passa cada manchete por um modelo de linguagem que reescreve sem clickbait — direto ao ponto.',
  },
  {
    emoji: '⚖️',
    title: 'Seu perfil de leitura pesa na seleção',
    body: 'Cada vez que você lê, pula ou mergulha numa notícia, o sistema ajusta os pesos dos seus tópicos. A edição de hoje já leva isso em conta.',
  },
  {
    emoji: '🏆',
    title: 'Apenas 7 notícias chegam até você',
    body: 'De centenas de itens coletados, um algoritmo de ranking combina recência, relevância pro seu perfil e diversidade de temas — e seleciona só os 7 melhores.',
  },
  {
    emoji: '🔒',
    title: 'Seus dados ficam só com você',
    body: 'Nenhum anunciante vê seu histórico. Suas preferências de leitura existem só para melhorar seu próprio feed — sem venda de dados, sem perfil publicitário.',
  },
]

export default function BuildingScreen({ userId }: { userId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'building' | 'done' | 'error'>('building')
  const [dots, setDots] = useState('.')
  const [cardIndex, setCardIndex] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false
    const build = async () => {
      try {
        const res = await fetch('/api/build-edition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        if (cancelled) return
        if (res.ok) {
          setStatus('done')
          setTimeout(() => router.refresh(), 800)
        } else {
          setStatus('error')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    build()
    return () => { cancelled = true }
  }, [userId])

  const card = cardIndex !== null ? BEHIND_THE_SCENES[cardIndex] : null

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm">

        {/* Estado principal */}
        <div className="text-center space-y-4 mb-10">
          {status === 'building' && (
            <>
              <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="text-xl font-semibold text-neutral-900">
                Preparando sua edição{dots}
              </h1>
              <p className="text-sm text-neutral-500">
                Buscando as melhores notícias dos seus tópicos.
              </p>
            </>
          )}
          {status === 'done' && (
            <>
              <div className="text-3xl">✓</div>
              <h1 className="text-xl font-semibold text-neutral-900">Edição pronta!</h1>
              <p className="text-sm text-neutral-500">Carregando seu feed…</p>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-xl font-semibold text-neutral-900">Algo deu errado</h1>
              <p className="text-sm text-neutral-500 mb-4">
                Não conseguimos buscar as notícias agora.
              </p>
              <button
                onClick={() => { setStatus('building'); router.refresh() }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>

        {/* Card expandido */}
        {card && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-2xl mb-2">{card.emoji}</div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">{card.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{card.body}</p>
          </div>
        )}

        {/* Botões "por que demora?" */}
        {status === 'building' && (
          <div className="space-y-2">
            <p className="text-xs text-neutral-400 text-center mb-3 uppercase tracking-widest">
              O que está acontecendo agora?
            </p>
            {BEHIND_THE_SCENES.map((item, i) => (
              <button
                key={i}
                onClick={() => setCardIndex(cardIndex === i ? null : i)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                  cardIndex === i
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
                }`}
              >
                <span className="mr-2">{item.emoji}</span>
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
