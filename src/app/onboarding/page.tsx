'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TOPIC_GROUPS } from '@/domain/news/types'

type Step = 'topics' | 'pluralism' | 'time' | 'email'

const STEP_LABELS: Record<Step, string> = {
  topics: '01',
  pluralism: '02',
  time: '03',
  email: '04',
}

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('topics')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Tecnologia', 'Inteligência Artificial', 'Economia', 'Brasil', 'Geopolítica'
  ])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Tecnologia & Inovação': true,
    'Economia & Negócios': true,
  })
  const [editionHour, setEditionHour] = useState<7 | 19>(7)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const language = searchParams.get('lang') ?? 'pt-BR'

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

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

  const handleSkipOnboarding = () => {
    const defaultTopics = selectedTopics.length > 0
      ? selectedTopics
      : ['Tecnologia', 'Economia', 'Geopolítica', 'Brasil', 'Inteligência Artificial']

    setLoading(true)
    setError('')
    fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics: defaultTopics,
        editionHour,
        language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push('/')
      })
      .catch(() => {
        router.push('/')
      })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: '#F2F1ED' }}
    >
      <div className="w-full max-w-md">

        {/* Marca + passo + Botão Pular */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#E0DED8]">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111]">FEED PESSOAL</p>
            <span className="text-[10px] text-[#9E9E9E] font-medium">({STEP_LABELS[step]} / 04)</span>
          </div>
          <button
            type="button"
            onClick={handleSkipOnboarding}
            disabled={loading}
            className="text-xs font-semibold text-[#555] hover:text-[#111] transition-colors underline decoration-dotted underline-offset-4 flex items-center gap-1"
          >
            {loading ? 'Criando feed…' : 'Pular onboarding ➔'}
          </button>
        </div>

        {/* ── Passo 1: Catálogo de 94+ Categorias ─────────────────────────────────────────── */}
        {step === 'topics' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-[#111] leading-tight">
                Quais áreas deseja acompanhar?
              </h1>
            </div>
            <p className="text-xs text-[#777] mb-6">
              Selecione seus temas de interesse ({selectedTopics.length} selecionados). Clique nos grupos para expandir.
            </p>

            <div className="space-y-3 mb-8 max-h-[55vh] overflow-y-auto pr-1">
              {TOPIC_GROUPS.map((group) => {
                const selectedInGroup = group.topics.filter((t) => selectedTopics.includes(t))
                const isOpen = Boolean(openGroups[group.groupName])

                return (
                  <div key={group.groupName} className="border border-[#E0DED8] bg-[#FFF]">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.groupName)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F8F7F4] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111] uppercase tracking-wider">
                          {group.groupName}
                        </span>
                        {selectedInGroup.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#111] text-[#FFF]">
                            {selectedInGroup.length}
                          </span>
                        )}
                      </div>
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        className={`text-[#888] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#F0EFEA] bg-[#F8F7F4]">
                        <div className="flex flex-wrap gap-1.5">
                          {group.topics.map((topic) => {
                            const isSelected = selectedTopics.includes(topic)
                            return (
                              <button
                                key={topic}
                                onClick={() => toggleTopic(topic)}
                                className="py-1.5 px-2.5 text-xs transition-all duration-150 font-medium text-left"
                                style={{
                                  background: isSelected ? '#111' : '#FFF',
                                  color: isSelected ? '#FFF' : '#444',
                                  border: `1px solid ${isSelected ? '#111' : '#E0DED8'}`,
                                }}
                              >
                                {topic}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep('pluralism')}
              disabled={selectedTopics.length === 0}
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-opacity"
              style={{
                background: '#111',
                opacity: selectedTopics.length === 0 ? 0.35 : 1,
              }}
            >
              Continuar ({selectedTopics.length} selecionados)
            </button>
          </div>
        )}

        {/* ── Passo 2: Pluralismo Geopolítico & Comparador de Narrativas ────────────────────── */}
        {step === 'pluralism' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              Pluralismo Global & Transparência
            </h1>
            <p className="text-xs text-[#777] mb-6 leading-relaxed">
              O Feed Pessoal foi construído com combate rígido a vieses e caixas-pretas de informação.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-[#FFF] border border-[#111]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#111] block mb-1">
                  COTA GLOBAL GARANTIDA
                </span>
                <p className="text-xs text-[#444] leading-relaxed">
                  2+ notícias por edição vindas obrigatoriamente de veículos internacionais do <strong>Sul Global, Ásia e Oriente Médio</strong> (<em>Al Jazeera</em>, <em>SCMP</em>, <em>Nikkei Asia</em>, <em>IPS</em>), com tradução automática universal.
                </p>
              </div>

              <div className="p-4 bg-[#FFF] border border-[#E0DED8]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#555] block mb-1">
                  COMPARADOR UNIVERSAL DE NARRATIVAS
                </span>
                <p className="text-xs text-[#444] leading-relaxed">
                  A IA mapeia até <strong>5 partes interessadas</strong> envolvidas em qualquer notícia (geopolítica, esportes, tecnologia ou economia) para você confrontar pontos de vista divergentes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('time')}
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-wider text-white bg-[#111]"
            >
              Entendido — Continuar
            </button>
          </div>
        )}

        {/* ── Passo 3: Horário ─────────────────────────────────────────── */}
        {step === 'time' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              Quando você prefere ler?
            </h1>
            <p className="text-xs text-[#777] mb-8">
              Sua edição será gerada diariamente nesse horário.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-10">
              {([7, 19] as const).map((hour) => (
                <button
                  key={hour}
                  onClick={() => setEditionHour(hour)}
                  className="py-6 text-center transition-colors duration-150"
                  style={{
                    background: editionHour === hour ? '#111' : '#FFF',
                    color: editionHour === hour ? '#FFF' : '#5C5C5C',
                    border: `1px solid ${editionHour === hour ? '#111' : '#E0DED8'}`,
                  }}
                >
                  <p className="text-2xl font-bold mb-1">{hour === 7 ? '07:00' : '19:00'}</p>
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ opacity: 0.7 }}>
                    {hour === 7 ? 'Edição da Manhã' : 'Edição da Noite'}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('email')}
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-wider text-white bg-[#111]"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── Passo 4: Email & Finalizar ─────────────────────────────────── */}
        {step === 'email' && (
          <div>
            <h1 className="text-2xl font-bold text-[#111] leading-tight mb-2">
              Como prefere acessar?
            </h1>
            <p className="text-xs text-[#777] mb-8 leading-relaxed">
              Opcional: cadastre seu e-mail para receber o resumo diário direto na caixa de entrada. Você também pode usar apenas via navegador.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs text-[#777] block mb-1">Seu Nome (opcional)</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                  style={{ borderBottom: '1px solid #E0DED8' }}
                />
              </div>
              <div>
                <label className="text-xs text-[#777] block mb-1">E-mail para Edição Diária (opcional)</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                  style={{ borderBottom: '1px solid #E0DED8' }}
                />
              </div>
            </div>

            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-opacity mb-3"
              style={{
                background: '#111',
                opacity: loading ? 0.4 : 1,
              }}
            >
              {loading ? 'Criando sua edição…' : email ? 'Criar Feed e Receber por E-mail' : 'Criar Meu Feed'}
            </button>

            {error && (
              <p className="text-xs text-center mb-2 text-[#E05A5A]">{error}</p>
            )}

            {!email && (
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="w-full py-2 text-xs text-[#777] hover:text-[#111] transition-colors text-center"
              >
                Acessar direto pelo navegador
              </button>
            )}

            <div className="mt-8 pt-4 border-t border-[#E0DED8] text-center">
              <Link href="/about" target="_blank" className="text-[11px] font-bold text-[#555] underline hover:text-[#111]">
                Transparência de IA & Prompts dos Agentes
              </Link>
            </div>
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
