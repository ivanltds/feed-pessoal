'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']

type Step = 'topics' | 'time' | 'email'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('topics')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [editionHour, setEditionHour] = useState<7 | 19>(7)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSubmit = async () => {
    if (!email || selectedTopics.length === 0) return
    setLoading(true)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, topics: selectedTopics, editionHour }),
    })

    const data = await res.json()
    if (data.userId) {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">feed pessoal</h1>
          <p className="text-sm text-neutral-500 mt-1">Sua edição diária, sem clickbait.</p>
        </div>

        {/* Indicador de progresso */}
        <div className="flex gap-1.5 mb-8 justify-center">
          {(['topics', 'time', 'email'] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-blue-600' : 'w-4 bg-neutral-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Tópicos */}
        {step === 'topics' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold mb-1">O que te interessa?</h2>
            <p className="text-sm text-neutral-500 mb-5">Escolha pelo menos um tema.</p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                    selectedTopics.includes(topic)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-blue-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('time')}
              disabled={selectedTopics.length === 0}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Horário */}
        {step === 'time' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold mb-1">Quando você prefere ler?</h2>
            <p className="text-sm text-neutral-500 mb-5">Sua edição chegará por email nesse horário.</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {([7, 19] as const).map((hour) => (
                <button
                  key={hour}
                  onClick={() => setEditionHour(hour)}
                  className={`py-4 rounded-xl border text-center transition-all ${
                    editionHour === hour
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-blue-300'
                  }`}
                >
                  <p className="text-xl font-semibold">{hour === 7 ? '7h' : '19h'}</p>
                  <p className="text-xs mt-0.5 opacity-80">{hour === 7 ? 'Manhã' : 'Noite'}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('email')}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 3: Email */}
        {step === 'email' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold mb-1">Último passo</h2>
            <p className="text-sm text-neutral-500 mb-5">Enviaremos sua edição diária para esse email.</p>
            <div className="space-y-3 mb-8">
              <input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
              />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!email || loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? 'Criando sua conta…' : 'Começar'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
