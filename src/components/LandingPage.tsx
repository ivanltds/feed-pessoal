'use client'

import { useState } from 'react'
import Link from 'next/link'

const SAMPLE_TOPICS = ['Tecnologia', 'Geopolítica', 'Economia', 'Ciência', 'Brasil', 'Cultura']

const LANGUAGES = [
  { code: 'pt-BR', label: 'PT — Brasil' },
  { code: 'pt-PT', label: 'PT — Portugal' },
  { code: 'en',    label: 'English' },
  { code: 'es',    label: 'Español' },
  { code: 'fr',    label: 'Français' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'ja',    label: '日本語' },
  { code: 'zh',    label: '中文' },
  { code: 'ar',    label: 'العربية' },
  { code: 'hi',    label: 'हिन्दी' },
]

export default function LandingPage() {
  const [language, setLanguage] = useState('pt-BR')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F1ED', color: '#111' }}>

      {/* Nav */}
      <header className="max-w-5xl mx-auto w-full px-6 sm:px-10 flex items-center justify-between" style={{ height: '60px' }}>
        <span className="text-sm font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          feed pessoal
        </span>
        <div className="flex items-center gap-5">
          {/* Language picker */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none text-xs pr-4 pl-0 py-1 bg-transparent outline-none cursor-pointer"
              style={{ color: '#9E9E9E' }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
              width="9" height="9" viewBox="0 0 9 9" fill="none"
            >
              <path d="M1.5 3L4.5 6L7.5 3" stroke="#BCBBB6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <Link href={`/onboarding?lang=${language}`} className="text-xs" style={{ color: '#5C5C5C' }}>
            Criar conta →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-6 sm:px-10 py-16 sm:py-28">

        <p className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: '#9E9E9E' }}>
          Seu feed. Todo dia.
        </p>

        <h1 className="text-4xl sm:text-6xl font-bold leading-[1.08] mb-8 max-w-2xl" style={{ letterSpacing: '-0.03em' }}>
          Notícias que importam para você.<br />
          Nada que não importa.
        </h1>

        <p className="text-base sm:text-lg max-w-md mb-10" style={{ color: '#5C5C5C', lineHeight: 1.6 }}>
          Uma edição diária, personalizada pelos temas que você escolhe. Títulos e resumos no seu idioma. Sem clickbait.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href={`/onboarding?lang=${language}`}
            className="inline-block px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#111' }}
          >
            Montar meu feed
          </Link>
          <span className="text-xs" style={{ color: '#9E9E9E' }}>
            Grátis. Sem cartão de crédito.
          </span>
        </div>

        {/* Tópicos */}
        <div className="mt-16 pt-10" style={{ borderTop: '1px solid #E0DED8' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: '#9E9E9E' }}>
            Temas disponíveis
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map((topic) => (
              <span key={topic} className="text-xs px-3 py-1.5" style={{ border: '1px solid #E0DED8', color: '#5C5C5C' }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full px-6 sm:px-10 py-8" style={{ borderTop: '1px solid #E0DED8' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9E9E9E' }}>© {new Date().getFullYear()} feed pessoal</span>
          <Link href="/privacy" className="text-xs" style={{ color: '#9E9E9E' }}>Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
