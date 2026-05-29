'use client'

import { useEffect, useState } from 'react'

const ALL_TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']

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
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!open || prefs) return
    setLoadError(false)
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setLoadError(true); return }
        setPrefs({ ...data, language: data.language ?? 'pt-BR' })
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
            className="relative flex flex-col h-full overflow-y-auto w-full sm:max-w-sm"
            style={{ background: '#FFFFFF', zIndex: 10000, borderLeft: '1px solid #E0DED8' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #E0DED8' }}>
              <span className="text-sm font-semibold text-[#111] tracking-tight">Preferências</span>
              <button onClick={() => setOpen(false)} className="text-[#9E9E9E] hover:text-[#111] transition-colors">
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

                  {/* Conta */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-4">Conta</p>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs text-[#9E9E9E] block mb-1">Nome</label>
                        <input
                          type="text"
                          value={prefs.name ?? ''}
                          onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                          placeholder="Seu nome"
                          className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                          style={{ borderBottom: '1px solid #E0DED8' }}
                          onFocus={(e) => { e.target.style.borderBottomColor = '#111' }}
                          onBlur={(e) => { e.target.style.borderBottomColor = '#E0DED8' }}
                        />
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between mb-1">
                          <label className="text-xs text-[#9E9E9E]">Email</label>
                          <span className="text-[10px] text-[#C0BEB8]">para receber por email</span>
                        </div>
                        <input
                          type="email"
                          value={prefs.email ?? ''}
                          onChange={(e) => setPrefs({ ...prefs, email: e.target.value || null })}
                          placeholder="seu@email.com"
                          className="w-full text-sm text-[#111] placeholder:text-[#C0BEB8] bg-transparent outline-none py-2"
                          style={{ borderBottom: '1px solid #E0DED8' }}
                          onFocus={(e) => { e.target.style.borderBottomColor = '#111' }}
                          onBlur={(e) => { e.target.style.borderBottomColor = '#E0DED8' }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Língua dos resumos */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-1">Língua dos resumos</p>
                    <p className="text-xs text-[#9E9E9E] mb-4">Os resumos serão gerados e traduzidos para o idioma escolhido.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setPrefs({ ...prefs, language: lang.code })}
                          className="py-2.5 px-3 text-left transition-colors duration-150"
                          style={{
                            background: prefs.language === lang.code ? '#111' : 'transparent',
                            color: prefs.language === lang.code ? '#FFF' : '#5C5C5C',
                            border: `1px solid ${prefs.language === lang.code ? '#111' : '#E0DED8'}`,
                          }}
                        >
                          <span className="text-sm block">{lang.native}</span>
                          {(lang.code === 'pt-BR' || lang.code === 'pt-PT') && (
                            <span className="text-[10px] opacity-60">{lang.native === 'Brasil' ? 'Brasil' : 'Portugal'}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Horário */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-4">Horário da edição</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([7, 19] as const).map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setPrefs({ ...prefs, editionHour: hour })}
                          className="py-3 text-center text-sm transition-colors duration-150"
                          style={{
                            background: prefs.editionHour === hour ? '#111' : 'transparent',
                            color: prefs.editionHour === hour ? '#FFF' : '#5C5C5C',
                            border: `1px solid ${prefs.editionHour === hour ? '#111' : '#E0DED8'}`,
                          }}
                        >
                          {hour === 7 ? 'Manhã — 7h' : 'Noite — 19h'}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Tópicos */}
                  <section>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-4">Tópicos de interesse</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className="py-2.5 px-3 text-sm transition-colors duration-150 text-left"
                          style={{
                            background: prefs.selectedTopics.includes(topic) ? '#111' : 'transparent',
                            color: prefs.selectedTopics.includes(topic) ? '#FFF' : '#5C5C5C',
                            border: `1px solid ${prefs.selectedTopics.includes(topic) ? '#111' : '#E0DED8'}`,
                          }}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Rodapé */}
                <div className="px-6 py-5" style={{ borderTop: '1px solid #E0DED8' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving || prefs.selectedTopics.length === 0}
                    className="w-full py-3 text-sm font-medium transition-opacity duration-150"
                    style={{
                      background: '#111',
                      color: '#FFF',
                      opacity: saving || prefs.selectedTopics.length === 0 ? 0.4 : 1,
                    }}
                  >
                    {saving ? 'Salvando…' : saved ? 'Salvo — atualizando feed…' : 'Salvar'}
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
