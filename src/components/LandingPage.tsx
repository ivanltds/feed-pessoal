import Link from 'next/link'

const SAMPLE_TOPICS = ['Tecnologia', 'Geopolítica', 'Economia', 'Ciência', 'Brasil', 'Cultura']

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F2F1ED', color: '#111' }}>

      {/* Nav */}
      <header className="max-w-5xl mx-auto w-full px-6 sm:px-10 flex items-center justify-between" style={{ height: '60px' }}>
        <span className="text-sm font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          feed pessoal
        </span>
        <Link
          href="/onboarding"
          className="text-xs"
          style={{ color: '#5C5C5C' }}
        >
          Criar conta →
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-6 sm:px-10 py-20 sm:py-32">

        <p className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: '#9E9E9E' }}>
          Seu feed. Todo dia.
        </p>

        <h1
          className="text-4xl sm:text-6xl font-bold leading-[1.08] mb-8 max-w-2xl"
          style={{ letterSpacing: '-0.03em' }}
        >
          Notícias que importam para você.<br />
          Nada que não importa.
        </h1>

        <p className="text-base sm:text-lg max-w-md mb-12" style={{ color: '#5C5C5C', lineHeight: 1.6 }}>
          Uma edição diária, personalizada pelos temas que você escolhe. Sem algoritmo de engajamento. Sem clickbait.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/onboarding"
            className="inline-block px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#111' }}
          >
            Montar meu feed
          </Link>
          <span className="text-xs" style={{ color: '#9E9E9E' }}>
            Grátis. Sem cartão de crédito.
          </span>
        </div>

        {/* Tópicos disponíveis */}
        <div className="mt-20 pt-10" style={{ borderTop: '1px solid #E0DED8' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] mb-5" style={{ color: '#9E9E9E' }}>
            Temas disponíveis
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map((topic) => (
              <span
                key={topic}
                className="text-xs px-3 py-1.5"
                style={{ border: '1px solid #E0DED8', color: '#5C5C5C' }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full px-6 sm:px-10 py-8" style={{ borderTop: '1px solid #E0DED8' }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#9E9E9E' }}>
            © {new Date().getFullYear()} feed pessoal
          </span>
          <Link href="/privacy" className="text-xs" style={{ color: '#9E9E9E' }}>
            Privacidade
          </Link>
        </div>
      </footer>

    </div>
  )
}
