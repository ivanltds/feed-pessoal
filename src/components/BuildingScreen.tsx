'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const showModalRef = useRef(false)

  // Mantém ref sincronizada para usar dentro do callback assíncrono
  useEffect(() => {
    showModalRef.current = showModal
  }, [showModal])

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
          // Se o modal estiver aberto, marca como pronto mas não recarrega ainda
          setReady(true)
          if (!showModalRef.current) {
            window.location.reload()
          }
        } else {
          const data = await res.json().catch(() => ({}))
          const reason = (data as { reason?: string }).reason
          if (reason === 'no_topics') {
            // Usuário sem tópicos configurados → volta para onboarding
            window.location.href = '/onboarding'
            return
          }
          // no_items ou outro erro → mostra tela de erro
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    build()
    return () => { cancelled = true }
  }, [userId])

  const closeModal = () => {
    setShowModal(false)
    // Se já terminou enquanto o modal estava aberto, recarrega agora
    if (ready) window.location.reload()
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="w-full max-w-xs space-y-5">
          {!error ? (
            <>
              {/* Spinner em CSS puro para não piscar em re-renders */}
              <div
                className="w-8 h-8 rounded-full mx-auto"
                style={{
                  border: '2px solid #e5e5e5',
                  borderTopColor: '#404040',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              <div>
                <h1 className="text-lg font-semibold text-neutral-900">
                  Preparando sua edição
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
              <p className="text-sm text-neutral-500">Não conseguimos buscar as notícias agora.</p>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/20" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                O que acontece por trás
              </h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-700 transition-colors">
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

            {ready && (
              <button
                onClick={closeModal}
                className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Feed pronto — ver agora
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
