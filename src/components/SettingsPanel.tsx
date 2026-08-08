'use client'

import { useEffect, useState } from 'react'
import { TOPIC_GROUPS } from '@/domain/news/types'

const LANGUAGES: { code: string; label: string; native: string }[] = [
  { code: 'pt-BR', label: 'Português',   native: 'Brasil' },
  { code: 'pt-PT', label: 'Português',   native: 'Portugal' },
  { code: 'en',    label: 'English',     native: 'English' },
  { code: 'es',    label: 'Español',     native: 'Español' },
  { code: 'fr',    label: 'Français',    native: 'Français' },
  { code: 'de',    label: 'Deutsch',     native: 'Deutsch' },
  { code: 'ja',    label: '日本語',       native: '日本語' },
  { code: 'zh',    label: '中文',         native: '中文' },
  { code: 'ar',    label: 'العربية',     native: 'العربية' },
  { code: 'hi',    label: 'हिन्दी',       native: 'हिन्दी' },
]

interface UserPrefs {
  name: string
  email: string | null
  editionHour: 7 | 19
  language: string
  selectedTopics: string[]
  topicWeights?: { topic: string; weight: number }[]
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open || prefs) return
    setLoadError(false)
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoadError(true); return }
        const userPrefs: UserPrefs = { ...data, language: data.language ?? 'pt-BR' }
        setPrefs(userPrefs)

        // Inicializa sanfona: abre apenas os grupos que possuem tópicos selecionados
        const initialOpen: Record<string, boolean> = {}
        TOPIC_GROUPS.forEach((group, idx) => {
          const hasSelected = group.topics.some((t) => userPrefs.selectedTopics.includes(t))
          initialOpen[group.groupName] = hasSelected || idx === 0
        })
        setOpenGroups(initialOpen)
      })
      .catch(() => setLoadError(true))
  }, [open, prefs])

  const toggleTopic = (topic: string) => {
    if (!prefs) return
    setPrefs({
      ...prefs,
      selectedTopics: prefs.selectedTopics.includes(topic)
        ? prefs.selectedTopics.filter((t) => t !== topic)
        : [...prefs.selectedTopics, topic],
    })
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const handleSave = async () => {
    if (!prefs) return
    setSaving(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: prefs.name,
        email: prefs.email,
        editionHour: prefs.editionHour,
        language: prefs.language,
        topics: prefs.selectedTopics,
      }),
    })
    const data = await res.json()
    setSaving(false)
    setSaved(true)
    if (data.editionInvalidated) {
      setTimeout(() => { window.location.href = '/' }, 1200)
    } else {
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // Filtra e ordena pesos relevantes para o gráfico (despreza pesos <= 1.5)
  const relevantWeights = (prefs?.topicWeights ?? [])
    .filter((tw) => tw.weight > 1.5)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)

  const maxWeight = relevantWeights.length > 0 ? Math.max(...relevantWeights.map((w) => w.weight)) : 10

  return (
    <>
      {/* Botão de abertura */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Preferências"
        className="flex items-center gap-2 transition-all duration-150"
        style={{
          padding: '6px 12px',
          border: '1px solid #E0DED8',
          color: '#5C5C5C',
          fontSize: '12px',
          letterSpacing: '0.01em',
          background: 'transparent',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#111'
          e.currentTarget.style.color = '#111'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E0DED8'
          e.currentTarget.style.color = '#5C5C5C'
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
          <circle cx="9" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
        <span className="hidden sm:inline">Preferências</span>
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className="fixed inset-0 flex justify-end" style={{ zIndex: 9999 }}>
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            onClick={() => setOpen(false)}
          />

          <div
            className="relative flex flex-col h-full overflow-y-auto w-full sm:max-w-md"
            style={{ background: '#FFFFFF', zIndex: 10000, borderLeft: '1px solid #E0DED8' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #E0DED8' }}>
              <div>
                <span className="text-sm font-bold text-[#111] uppercase tracking-wider block">Preferências do Feed</span>
                <span className="text-xs text-[#888]">Personalização e Inteligência</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#9E9E9E] hover:text-[#111] transition-colors p-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            {loadError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-sm text-[#9E9E9E]">Não foi possível carregar suas preferências.</p>
                <button onClick={() => { setLoadError(false); setPrefs(null) }} className="text-xs text-[#111] underline underline-offset-2">
                  Tentar novamente
                </button>
              </div>
            ) : !prefs ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full" style={{ border: '2px solid #E0DED8', borderTopColor: '#111', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <>
                <div className="flex-1 px-6 py-6 space-y-8">

                  {/* Gráfico Minimalista de Aprendizado Adaptativo (Despreza valores irrelevantes) */}
                  {relevantWeights.length > 0 && (
                    <section className="p-4 bg-[#F8F7F4] border border-[#E0DED8]">
                      <div className="flex items-center justify-between mb-3 border-b border-[#EAE8E1] pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#555]">
                          APRENDIZADO ADAPTATIVO DA IA
                        </p>
                        <span className="text-[10px] text-[#888] uppercase font-medium">Relevância Aprendida</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        {relevantWeights.map((tw) => {
                          const percentage = Math.min(100, Math.max(15, (tw.weight / maxWeight) * 100))
                          return (
                            <div key={tw.topic} className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-[#222] w-32 truncate">{tw.topic}</span>
                              <div className="flex-1 h-2 bg-[#EAE8E1] overflow-hidden">
                                <div
                                  className="h-full bg-[#111] transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#555] w-8 text-right font-mono">
                                {tw.weight.toFixed(1)}x
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}

                  {/* Conta */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-4 font-bold">CONTA</p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[#9E9E9E] block mb-1">Nome</label>
                        <input
                          type="text"
                          value={prefs.name ?? ''}
                          onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                          placeholder="Seu nome"
                          className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                          style={{ borderBottom: '1px solid #E0DED8' }}
                        />
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between mb-1">
                          <label className="text-xs text-[#9E9E9E]">Email</label>
                          <span className="text-[10px] text-[#C0BEB8]">para edições diárias</span>
                        </div>
                        <input
                          type="email"
                          value={prefs.email ?? ''}
                          onChange={(e) => setPrefs({ ...prefs, email: e.target.value || null })}
                          placeholder="seu@email.com"
                          className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                          style={{ borderBottom: '1px solid #E0DED8' }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Catálogo de Categorias (Grupos Colapsáveis / Accordion) */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] font-bold">
                        CATÁLOGO DE CATEGORIAS
                      </p>
                      <span className="text-[11px] font-medium text-[#111]">
                        {prefs.selectedTopics.length} selecionadas
                      </span>
                    </div>
                    <p className="text-xs text-[#888] mb-4 leading-relaxed">
                      Selecione suas áreas de interesse. Clique em um grupo para expandir ou recolher.
                    </p>

                    <div className="space-y-3">
                      {TOPIC_GROUPS.map((group) => {
                        const selectedInGroup = group.topics.filter((t) => prefs.selectedTopics.includes(t))
                        const isOpen = Boolean(openGroups[group.groupName])

                        return (
                          <div key={group.groupName} className="border border-[#E0DED8] bg-[#FFF]">
                            {/* Header Sanfona */}
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

                            {/* Conteúdo Expansível */}
                            {isOpen && (
                              <div className="px-4 pb-4 pt-2 border-t border-[#F0EFEA] bg-[#F8F7F4]">
                                <div className="flex flex-wrap gap-1.5">
                                  {group.topics.map((topic) => {
                                    const isSelected = prefs.selectedTopics.includes(topic)
                                    return (
                                      <button
                                        key={topic}
                                        onClick={() => toggleTopic(topic)}
                                        className="py-1.5 px-2.5 text-xs transition-all duration-150 font-medium"
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
                  </section>

                  {/* Horário */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-3 font-bold">HORÁRIO DA EDIÇÃO</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([7, 19] as const).map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setPrefs({ ...prefs, editionHour: hour })}
                          className="py-2.5 text-center text-xs font-medium transition-colors"
                          style={{
                            background: prefs.editionHour === hour ? '#111' : '#F8F7F4',
                            color: prefs.editionHour === hour ? '#FFF' : '#5C5C5C',
                            border: `1px solid ${prefs.editionHour === hour ? '#111' : '#E0DED8'}`,
                          }}
                        >
                          {hour === 7 ? 'Manhã — 07:00' : 'Noite — 19:00'}
                        </button>
                      ))}
                    </div>
                  </section>

                </div>

                {/* Rodapé */}
                <div className="px-6 py-4" style={{ borderTop: '1px solid #E0DED8' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving || prefs.selectedTopics.length === 0}
                    className="w-full py-3 text-xs uppercase tracking-wider font-semibold transition-opacity duration-150"
                    style={{
                      background: '#111',
                      color: '#FFF',
                      opacity: saving || prefs.selectedTopics.length === 0 ? 0.4 : 1,
                    }}
                  >
                    {saving ? 'Salvando…' : saved ? 'Salvo — atualizando feed…' : 'Salvar Preferências'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
