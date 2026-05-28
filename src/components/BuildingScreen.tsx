'use client'

import { useEffect, useState } from 'react'

const BEHIND_THE_SCENES = [
  {
    title: 'Consultando fontes ao redor do mundo',
    body: 'Varremos dezenas de feeds de veículos como TechCrunch, InfoMoney e BBC — coletando tudo publicado nas últimas 48 horas.',
  },
  {
    title: 'Uma IA reescreve cada título',
    body: 'Cada manchete passa por um modelo de linguagem que remove o clickbait e reescreve de forma direta, sem sensacionalismo.',
  },
  {
    title: 'Seu perfil de leitura pesa na seleção',
    body: 'Cada vez que você lê, pula ou se aprofunda numa notícia, o sistema ajusta os pesos dos seus tópicos para a próxima edição.',
  },
  {
    title: 'Apenas 7 notícias chegam até você',
    body: 'De centenas de itens coletados, um algoritmo combina recência, relevância e diversidade de temas — e seleciona só os 7 melhores.',
  },
  {
    title: 'Seus dados ficam só com você',
    body: 'Nenhum anunciante acessa seu histórico. Suas preferências existem apenas para melhorar seu próprio feed.',
  },
]

export default function BuildingScreen({ userId }: { userId: string }) {
  const [dots, setDots] = useState('.')
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)

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
          window.location.reload()
        } else {
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    build()
    return () => { cancelled = true }
  }, [userId])

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="w-full max-w-xs space-y-5">
          {!error ? (
            <>
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">
                  Preparando sua edição{dots}
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Buscando as melhores notícias dos seus tópicos.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-2 transition-colors"
              >
                Por que demora?
              </button>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-neutral-900">Algo deu errado</h1>
              <p className="text-sm text-neutral-500">
                Não conseguimos buscar as notícias agora.
              </p>
              <button
                onClick={() => { setError(false); window.location.reload() }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>
      </main>

      {/* Modal minimalista */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-widest">
                O que acontece por trás
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {BEHIND_THE_SCENES.map((item, i) => (
                <div key={i} className={i > 0 ? 'pt-4 border-t border-neutral-100' : ''}>
                  <p className="text-sm font-medium text-neutral-800 mb-0.5">{item.title}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
