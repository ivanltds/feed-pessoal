'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-2xl shadow-lg px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-neutral-600 flex-1">
          Usamos um cookie essencial para manter sua sessão ativa. Sem ele o serviço não funciona.{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Saiba mais
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
