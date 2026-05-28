'use client'

import { useEffect, useState } from 'react'

const ALL_TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']

interface UserPrefs {
  name: string
  email: string
  editionHour: 7 | 19
  selectedTopics: string[]
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<UserPrefs | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Carrega prefs apenas quando o drawer abre
  useEffect(() => {
    if (!open || prefs) return
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => { if (!data.error) setPrefs(data) })
  }, [open])

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
      {/* Botão — sempre visível */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
        title="Preferências"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Preferências
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-base font-semibold text-neutral-900">Preferências</h2>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            {!prefs ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="px-5 py-5 space-y-7 flex-1">
                  {/* Conta */}
                  <section>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Conta</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Nome</label>
                        <input
                          type="text"
                          value={prefs.name ?? ''}
                          onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                          placeholder="Seu nome"
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Email</label>
                        <input
                          type="email"
                          value={prefs.email}
                          onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Horário */}
                  <section>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Horário da edição</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {([7, 19] as const).map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setPrefs({ ...prefs, editionHour: hour })}
                          className={`py-3 rounded-xl border text-center text-sm font-medium transition-all ${
                            prefs.editionHour === hour
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:border-blue-300'
                          }`}
                        >
                          {hour === 7 ? '☀️ 7h manhã' : '🌙 19h noite'}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Tópicos */}
                  <section>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Tópicos de interesse</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                            prefs.selectedTopics.includes(topic)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:border-blue-300'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-neutral-100">
                  <button
                    onClick={handleSave}
                    disabled={saving || prefs.selectedTopics.length === 0}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Salvando…' : saved ? '✓ Salvo! Atualizando feed…' : 'Salvar preferências'}
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
