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
    body: 'Nenhum anunciante acessa seu histórico. Suas preferências existem apenas para melhorar o seu feed.',
  },
]

export default function BuildingScreen({ userId }: { userId: string }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const showModalRef = useRef(false)

  useEffect(() => { showModalRef.current = showModal }, [showModal])

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
          setReady(true)
          if (!showModalRef.current) window.location.reload()
        } else {
          const data = await res.json().catch(() => ({}))
          const reason = (data as { reason?: string }).reason
          if (reason === 'no_topics') {
            window.location.href = '/onboarding'
            return
          }
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
    if (ready) window.location.reload()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F2F1ED' }}
    >
      <div className="w-full max-w-xs">
        {!error ? (
          <>
            {/* Spinner */}
            <div
              className="w-6 h-6 rounded-full mx-auto mb-8"
              style={{
                border: '1.5px solid #E0DED8',
                borderTopColor: '#111',
                animation: 'spin 0.9s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E] mb-2">feed pessoal</p>
            <h1 className="text-lg font-semibold text-[#111] mb-1">Preparando sua edição</h1>
            <p className="text-sm text-[#9E9E9E] mb-8">
              Isso pode levar alguns segundos.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="text-xs text-[#9E9E9E] hover:text-[#5C5C5C] underline underline-offset-2 transition-colors"
            >
              Por que demora?
            </button>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E] mb-6">feed pessoal</p>
            <h1 className="text-base font-semibold text-[#111] mb-2">Algo deu errado</h1>
            <p className="text-sm text-[#9E9E9E] mb-8">
              Não foi possível buscar as notícias agora.
            </p>
            <button
              onClick={() => { setError(false); window.location.reload() }}
              className="px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-70"
              style={{ background: '#111' }}
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>

      {/* Modal "Por que demora?" */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center px-6" style={{ zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={closeModal}
          />
          <div
            className="relative w-full max-w-md bg-white p-8"
            style={{ zIndex: 10000 }}
          >
            {/* Header do modal */}
            <div className="flex items-center justify-between mb-7">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E]">O que acontece por trás</p>
              <button onClick={closeModal} className="text-[#9E9E9E] hover:text-[#111] transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-0">
              {BEHIND_THE_SCENES.map((item, i) => (
                <div
                  key={i}
                  className="py-4"
                  style={i > 0 ? { borderTop: '1px solid #E0DED8' } : {}}
                >
                  <p className="text-sm font-semibold text-[#111] mb-1">{item.title}</p>
                  <p className="text-sm text-[#9E9E9E] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            {ready && (
              <button
                onClick={closeModal}
                className="mt-6 w-full py-3 text-sm font-medium text-white transition-opacity hover:opacity-70"
                style={{ background: '#111' }}
              >
                Feed pronto — ver agora
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
