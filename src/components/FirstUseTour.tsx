'use client'

import { useState, useEffect, useCallback } from 'react'

interface TourStep {
  id: string
  icon: string
  badge: string
  title: string
  subtitle: string
  content: string
  highlightNote?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'finite-feed',
    icon: '☕',
    badge: '1. RITUAL SEM ANSIEDADE',
    title: 'Sua Edição Diária Tem Fim',
    subtitle: 'Sem scroll infinito de feed caótico',
    content: 'O feed pessoal monta uma edição de 7 a 10 notícias essenciais por dia. Você lê tudo em cerca de 5 minutos e fecha o app com a certeza real de que está em dia.',
    highlightNote: '💡 A tela avisa "Você está em dia ✓" no final da leitura.'
  },
  {
    id: 'anti-clickbait',
    icon: '📰',
    badge: '2. ANTI-CLICKBAIT POR IA',
    title: 'Títulos Limpos & Fatos Diretos',
    subtitle: 'Manchetes desarmadas de sensacionalismo',
    content: 'Cada artigo passa por modelos de IA que removem armadilhas de caça-clique e gatilhos emocionais, mantendo a manchete 100% objetiva e informativa.',
    highlightNote: '💡 Clique em qualquer card para ver o resumo sintetizado em 3 frases.'
  },
  {
    id: 'perspectives-360',
    icon: '🔍',
    badge: '3. PLURALISMO & TRANSPARÊNCIA',
    title: '4 Perspectivas & Mapeamento de 5 Lados',
    subtitle: 'Confronto analítico contra caixas-pretas',
    content: 'Ao abrir uma notícia, a IA apresenta 4 lentes analíticas (Impacto Prático, Contraponto, Sul Global e Próximos Passos) e compara as justificativas de até 5 partes interessadas.',
    highlightNote: '💡 Veja o botão "⚖️ Comparar 5 lados do fato" dentro de qualquer modal.'
  },
  {
    id: 'deep-dive-push',
    icon: '🔔',
    badge: '4. APROFUNDAMENTO & PWA',
    title: 'Chat com a Notícia & Alertas Diários',
    subtitle: 'Tire dúvidas direto com a IA',
    content: 'Cada card gera 3 perguntas sugeridas para você conversar com a IA no chat. Ative as Notificações Push para receber o alerta diário assim que a edição do seu horário for gerada.',
    highlightNote: '💡 Você pode gerenciar as notificações a qualquer momento nas Configurações.'
  }
]

interface FirstUseTourProps {
  isOpen: boolean
  onClose: () => void
}

export default function FirstUseTour({ isOpen, onClose }: FirstUseTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onClose()
    }
  }, [currentStep, onClose])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  // Suporte a teclado: Esc fecha, Setas navegam
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, onClose])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="w-full max-w-lg bg-[#FFF] border border-[#111] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-[#F8F7F4] border-b border-[#E0DED8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{step.icon}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111]">
              {step.badge}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#888] hover:text-[#111] transition-colors py-1 px-2 hover:bg-[#EAE8E3]"
            aria-label="Pular tutorial"
          >
            Pular tutorial ✕
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-[#E0DED8] h-1">
          <div
            className="bg-[#111] h-1 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 md:p-8 flex-1 space-y-4">
          <div>
            <h2 id="tour-title" className="text-xl md:text-2xl font-bold text-[#111] leading-tight mb-1">
              {step.title}
            </h2>
            <p className="text-xs font-medium text-[#555]">
              {step.subtitle}
            </p>
          </div>

          <p className="text-xs md:text-sm text-[#333] leading-relaxed">
            {step.content}
          </p>

          {step.highlightNote && (
            <div className="p-3 bg-[#F4F3EE] border-l-2 border-[#111] text-xs text-[#444] font-medium">
              {step.highlightNote}
            </div>
          )}
        </div>

        {/* Rodapé / Ações */}
        <div className="px-6 py-4 bg-[#F8F7F4] border-t border-[#E0DED8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#888] font-medium">
              Passo {currentStep + 1} de {TOUR_STEPS.length}
            </span>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="text-xs font-semibold text-[#555] hover:text-[#111] underline underline-offset-2 transition-colors"
              >
                ← Anterior
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="py-2.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#FFF] bg-[#111] hover:bg-[#333] transition-colors"
          >
            {isLast ? 'Entendi — Ir pro Feed 🚀' : 'Próximo Passo →'}
          </button>
        </div>

      </div>
    </div>
  )
}
