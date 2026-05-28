'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BuildingScreen({ userId }: { userId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<'building' | 'done' | 'error'>('building')
  const [dots, setDots] = useState('.')

  // Animação dos pontinhos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Dispara o build e depois faz refresh
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
          // Pequena pausa antes de redirecionar
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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="max-w-sm space-y-4">
        {status === 'building' && (
          <>
            <div className="w-10 h-10 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-xl font-semibold text-neutral-900">
              Preparando sua edição{dots}
            </h1>
            <p className="text-sm text-neutral-500">
              Buscando as melhores notícias dos seus tópicos. Isso leva alguns segundos.
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
              Não conseguimos buscar as notícias. Verifique sua chave da OpenAI ou tente novamente.
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
    </main>
  )
}
