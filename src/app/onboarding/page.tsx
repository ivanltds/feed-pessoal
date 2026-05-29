'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']

type Step = 'topics' | 'time' | 'email'

const STEP_LABELS: Record<Step, string> = {
  topics: '01',
  time: '02',
  email: '03',
}

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('topics')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [editionHour, setEditionHour] = useState<7 | 19>(7)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const language = searchParams.get('lang') ?? 'pt-BR'

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const [error, setError] = useState('')

  const handleSubmit = async (withEmail: boolean) => {
    if (selectedTopics.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: withEmail && email ? email : undefined,
          name: name || undefined,
          topics: selectedTopics,
          editionHour,
          language,
        }),
      })
      const data = await res.json()
      if (data.userId) {
        router.push('/')
      } else {
        setError('Algo deu errado. Tente novamente.')
        setLoading(false)
      }
    } catch {
      setError('Algo deu errado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: '#F2F1ED' }}
    >
      <div className="w-full max-w-sm">

        {/* Marca + passo */}
        <div className="flex items-baseline justify-between mb-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E]">feed pessoal</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E]">
            {STEP_LABELS[step]} / 03
          </p>
        </div>

        {/* ── Step 1: Tópicos ─────────────────────────────────────────── */}
        {step === 'topics' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              O que você quer acompanhar?
            </h1>
            <p className="text-sm text-[#9E9E9E] mb-8">Escolha pelo menos um tema.</p>

            <div className="grid grid-cols-2 gap-2 mb-10">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className="py-3 px-4 text-sm text-left transition-colors duration-150"
                  style={{
                    background: selectedTopics.includes(topic) ? '#111' : 'transparent',
                    color: selectedTopics.includes(topic) ? '#FFF' : '#5C5C5C',
                    border: `1px solid ${selectedTopics.includes(topic) ? '#111' : '#E0DED8'}`,
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('time')}
              disabled={selectedTopics.length === 0}
              className="w-full py-3.5 text-sm font-medium text-white transition-opacity"
              style={{
                background: '#111',
                opacity: selectedTopics.length === 0 ? 0.35 : 1,
              }}
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── Step 2: Horário ─────────────────────────────────────────── */}
        {step === 'time' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              Quando você prefere ler?
            </h1>
            <p className="text-sm text-[#9E9E9E] mb-8">
              Sua edição será gerada nesse horário.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-10">
              {([7, 19] as const).map((hour) => (
                <button
                  key={hour}
                  onClick={() => setEditionHour(hour)}
                  className="py-6 text-center transition-colors duration-150"
                  style={{
                    background: editionHour === hour ? '#111' : 'transparent',
                    color: editionHour === hour ? '#FFF' : '#5C5C5C',
                    border: `1px solid ${editionHour === hour ? '#111' : '#E0DED8'}`,
                  }}
                >
                  <p className="text-2xl font-bold mb-1">{hour === 7 ? '7h' : '19h'}</p>
                  <p className="text-xs" style={{ opacity: 0.7 }}>{hour === 7 ? 'Manhã' : 'Noite'}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('email')}
              className="w-full py-3.5 text-sm font-medium text-white"
              style={{ background: '#111' }}
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── Step 3: Email (opcional) ─────────────────────────────────── */}
        {step === 'email' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              Receber por email?
            </h1>
            <p className="text-sm mb-8" style={{ color: '#9E9E9E', lineHeight: 1.6 }}>
              Deixe seu email e entregamos sua edição direto na caixa de entrada. Opcional — você pode usar o feed só pelo navegador.
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <label className="text-xs text-[#9E9E9E] block mb-1">Nome (opcional)</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                  style={{ borderBottom: '1px solid #E0DED8' }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#111' }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#E0DED8' }}
                />
              </div>
              <div>
                <label className="text-xs text-[#9E9E9E] block mb-1">Email (opcional)</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                  style={{ borderBottom: '1px solid #E0DED8' }}
                  onFocus={(e) => { e.target.style.borderBottomColor = '#111' }}
                  onBlur={(e) => { e.target.style.borderBottomColor = '#E0DED8' }}
                />
              </div>
            </div>

            {/* CTA principal: com email se preenchido, sem se não */}
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full py-3.5 text-sm font-medium text-white transition-opacity mb-3"
              style={{
                background: '#111',
                opacity: loading ? 0.4 : 1,
              }}
            >
              {loading ? 'Criando seu feed…' : email ? 'Começar e receber por email' : 'Começar'}
            </button>

            {error && (
              <p className="text-xs text-center mb-2" style={{ color: '#E05A5A' }}>{error}</p>
            )}

            {/* Pular email — só aparece se não preencheu ainda */}
            {!email && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="w-full py-2 text-xs transition-colors"
                style={{ color: '#9E9E9E' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9E9E9E' }}
              >
                Agora não
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#F2F1ED', minHeight: '100vh' }} />}>
      <OnboardingForm />
    </Suspense>
  )
}
