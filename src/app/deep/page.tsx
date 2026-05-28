'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, Suspense } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RelatedLink {
  title: string
  url: string
  source: string
  imageUrl?: string
}

function DeepDiveContent() {
  const params = useSearchParams()
  const router = useRouter()
  const question = params.get('q') ?? ''
  const topic = params.get('topic') ?? ''
  const itemId = params.get('itemId') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [related, setRelated] = useState<RelatedLink[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
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
      if (data.related?.length) setRelated(data.related)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, não consegui buscar essa informação. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  // inicia conversa com a pergunta da tela de conclusão
  useEffect(() => {
    if (!initialized.current && question) {
      initialized.current = true
      sendMessage(question)
    }
  }, [question])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="max-w-xl mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-50/90 backdrop-blur-sm px-4 py-3 border-b border-neutral-100 z-10 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Voltar para edição"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest">aprofundamento</p>
          <p className="text-sm font-medium text-neutral-700">{topic}</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Links relacionados */}
        {related.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Leia mais</p>
            {related.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {link.imageUrl && (
                  <img src={link.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 line-clamp-2">{link.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{link.source}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-neutral-50/90 backdrop-blur-sm px-4 py-3 border-t border-neutral-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte mais sobre o tema…"
            className="flex-1 px-4 py-2.5 rounded-full border border-neutral-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
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
