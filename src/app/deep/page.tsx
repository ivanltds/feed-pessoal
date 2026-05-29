'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function DeepDiveContent() {
  const params = useSearchParams()
  const router = useRouter()
  const question = params.get('q') ?? ''
  const topic = params.get('topic') ?? ''
  const itemId = params.get('itemId') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, topic, itemId }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Não consegui buscar essa informação. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialized.current && question) {
      initialized.current = true
      sendMessage(question)
    }
  }, [question])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F2F1ED' }}>

      {/* Header */}
      <header
        className="sticky top-0 flex items-center gap-4 px-6 sm:px-10"
        style={{
          height: '52px',
          background: '#F2F1ED',
          borderBottom: '1px solid #E0DED8',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ color: '#9E9E9E', lineHeight: 1 }}
          className="hover:text-[#111] transition-colors"
          aria-label="Voltar"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9E9E9E' }}>
            Aprofundamento
          </p>
          {topic && (
            <p className="text-xs font-medium" style={{ color: '#111', letterSpacing: '-0.01em' }}>
              {topic}
            </p>
          )}
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 py-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <p
                  className="text-sm px-4 py-3 max-w-[80%]"
                  style={{
                    background: '#111',
                    color: '#FFF',
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </p>
              ) : (
                <div className="max-w-[92%]">
                  {msg.content.split('\n\n').map((para, j) => (
                    <p
                      key={j}
                      className="text-sm"
                      style={{
                        color: '#111',
                        lineHeight: 1.75,
                        marginTop: j > 0 ? '1rem' : 0,
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1 items-center" style={{ height: '24px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#9E9E9E',
                      animation: 'bounce 1s ease infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                  }
                `}</style>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer
        className="sticky bottom-0"
        style={{
          background: '#F2F1ED',
          borderTop: '1px solid #E0DED8',
        }}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="max-w-2xl mx-auto px-6 sm:px-10 py-4 flex gap-3 items-center"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte mais sobre o tema…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm outline-none py-2"
            style={{
              borderBottom: '1px solid #E0DED8',
              color: '#111',
            }}
            onFocus={(e) => { e.target.style.borderBottomColor = '#111' }}
            onBlur={(e) => { e.target.style.borderBottomColor = '#E0DED8' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-sm font-medium transition-opacity"
            style={{
              color: '#111',
              opacity: loading || !input.trim() ? 0.3 : 1,
            }}
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  )
}

export default function DeepDivePage() {
  return (
    <Suspense>
      <DeepDiveContent />
    </Suspense>
  )
}
