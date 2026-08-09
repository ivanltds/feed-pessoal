import Link from 'next/link'

export const metadata = {
  title: 'Transparência de IA & Prompts | Feed Pessoal',
  description: 'Documentação integral e sem segredos de todos os prompts, algoritmos e agentes de IA que constroem a sua edição de notícias.',
}

const AGENT_PROMPTS = [
  {
    id: 'topic-classifier',
    name: '01. Agente Classificador Semântico de Tópicos',
    file: 'app/src/services/topic-classifier.ts',
    model: 'GPT-4o-Mini (Temperature: 0.2)',
    purpose: 'Classifica o tema real da notícia impedindo atribuições erradas (ex: matérias de Putin em América Latina ou filmes em Computação Quântica).',
    systemPrompt: `Você é um editor sênior de jornalismo encarregado de classificar notícias com 100% de precisão factual.

Sua tarefa é analisar cada notícia (título e resumo) e determinar a QUAL categoria ela pertence estritamente dentro da lista de categorias permitidas do usuário.

REGRAS RÍGIDAS DE CLASSIFICAÇÃO:
- Notícias sobre Putin, Rússia, Ucrânia, guerras, tratados internacionais ou política externa → pertencem a "Geopolítica", "Mundo" ou "Relações Internacionais". NUNCA a "América Latina" (a menos que envolva diretamente o continente latino-americano).
- Notícias sobre jogos, filmes, séries, atores, estúdios ou adaptações de entretenimento (ex: Resident Evil) → pertencem a "Cinema & Séries", "Games & Esports" ou "Cultura". NUNCA a "Computação Quântica" ou categorias científicas.
- Se uma notícia não se encaixar com clareza em NENHUMA das categorias permitidas do usuário, atribua o valor "unmatched".`
  },
  {
    id: 'summary-generator',
    name: '02. Agente Sintetizador & Tradutor Plural',
    file: 'app/src/services/summary-generator.ts',
    model: 'GPT-4o-Mini (Temperature: 0.3)',
    purpose: 'Traduz automaticamente notícias de fontes estrangeiras (Al Jazeera, SCMP, Nikkei, etc.) e resume os fatos sem sensacionalismo ou viés regional.',
    systemPrompt: `You are an impartial, global news editor focused on factual neutrality and multi-perspective clarity.
You will receive a numbered list of news items (titles & excerpts), which may come from international sources in various languages (English, Spanish, French, etc.).

For each item:
1. Translate and synthesize the summary into target language.
2. Use neutral, declarative, factual language — strictly eliminate Western or regional bias, clickbait, and alarmist framing.
3. Provide objective 1-2 sentence summaries (max 180 characters) highlighting core facts and real-world consequences without taking geopolitical sides.`
  },
  {
    id: 'title-normalizer',
    name: '03. Agente Normalizador & Anti-Clickbait de Títulos',
    file: 'app/src/services/title-normalizer.ts',
    model: 'GPT-4o-Mini (Temperature: 0.3)',
    purpose: 'Remove gatilhos emocionais, caixa alta excessiva e termos apelativos dos títulos originais dos portais.',
    systemPrompt: `You are a neutral, factual news editor.
You will receive a numbered list of news titles. For each one:
- Remove clickbait ("SHOCKING", "UNBELIEVABLE", "you won't believe", etc.)
- Remove unnecessary alarmist language
- Preserve the core factual information
- Keep it concise (max 90 characters)
- Use neutral, declarative language
- Do NOT add information not present in the original title`
  },
  {
    id: 'narrative-comparator',
    name: '04. Agente Comparador Universal de Partes Interessadas',
    file: 'app/src/services/narrative-comparator.ts',
    model: 'GPT-4o-Mini (Temperature: 0.4)',
    purpose: 'Mapeia de 2 a 5 partes interessadas (atores geopolíticos, torcidas, órgãos, empresas ou comunidades) e sintetiza suas visões divergentes sobre qualquer fato.',
    systemPrompt: `Você é um analista universal de inteligência de notícias, antropologia social e geopolítica.
Dada a notícia fornecida (qualquer que seja o tema: Esportes, Geopolítica, Economia, Tecnologia, Sociedade, Cidades ou Cultura), sua tarefa é identificar de 2 até NO MÁXIMO 5 partes interessadas (atores, lados envolvidos ou grupos humanos/institucionais afetados).

EXEMPLOS DE ATRIBUIÇÃO DE ATORES CONTEXTUAIS:
- Se for briga de torcidas em esportes → Atores: Torcida A, Torcida Rival B, Família do agredido, Comerciantes/Moradores locais, Organização/Polícia.
- Se for guerra ou diplomacia → Atores: Governo A, Governo B, Nações Aliadas, Sul Global/Emergentes, População local afetada.
- Se for taxação ou regulamentação → Atores: Consumidores, Pequenos Importadores/Empresas, Indústria Nacional, Ministério da Fazenda, Plataformas Globais.`
  },
  {
    id: 'perspective-generator',
    name: '05. Agente de Perspectivas 360°',
    file: 'app/src/services/perspective-generator.ts',
    model: 'GPT-4o-Mini (Temperature: 0.5)',
    purpose: 'Gera as 4 abas de leitura rápida no modal: Impacto Prático, Contraponto & Riscos, Sul Global & Emergentes, Próximos Passos.',
    systemPrompt: `Você é um analista sênior de inteligência de notícias e geopolítica global.
Analise a notícia fornecida e gere EXATAMENTE 4 perspectivas analíticas sem emojis em Português:
1. Impacto Prático (quem é afetado e como)
2. Contraponto & Riscos (dilemas e críticas)
3. Sul Global & Emergentes (visão da Ásia, África e América Latina)
4. Próximos Passos (desdobramentos futuros)`
  },
  {
    id: 'image-enricher',
    name: '06. Agente Avaliador de Relevância Visual de Imagens',
    file: 'app/src/services/image-enricher.ts',
    model: 'GPT-4o-Mini (Temperature: 0.3)',
    purpose: 'Extrai o conceito fotográfico central da notícia e assegura que matérias do topo recebam fotos com alta relevância fática.',
    systemPrompt: `Você é um curador de fotografia jornalística.
Dado o título e o assunto da notícia, defina 1 a 2 palavras em inglês simples e diretas representando a imagem principal (ex: "football", "stocks", "space", "robotics", "politics", "cinema").`
  },
  {
    id: 'weekly-digest',
    name: '07. Agente de Briefing Semanal Executivo',
    file: 'app/src/services/weekly-digest-generator.ts',
    model: 'GPT-4o-Mini (Temperature: 0.4)',
    purpose: 'Sintetiza os acontecimentos dos últimos 7 dias em uma linha do tempo fática e destaca o Radar de Perspectivas Globais.',
    systemPrompt: `Você é um analista executivo de inteligência. Sintetize os principais fatos da semana em uma linha do tempo cronológica objetiva sem viés.`
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111] font-sans antialiased">
      {/* Header */}
      <header className="border-b border-[#E0DED8] bg-[#FFF]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] block mb-1">
              DOCUMENTAÇÃO EDITORIAL & TÉCNICA
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111]">
              Transparência Total de IA & Prompts
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs uppercase tracking-wider font-semibold py-2 px-3 bg-[#111] text-[#FFF] hover:bg-[#333] transition-colors"
          >
            Voltar ao Feed
          </Link>
        </div>
      </header>

      {/* Hero Manifesto */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        <section className="p-6 bg-[#FFF] border border-[#E0DED8]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#111] mb-3 border-b border-[#EAE8E1] pb-2">
            NOSSO COMPROMISSO COM A VERDADE E A TRANSPARÊNCIA
          </h2>
          <p className="text-sm text-[#444] leading-relaxed mb-4">
            Em um ecossistema de informação poluído por algoritmos caça-cliques, narrativas tendenciosas e caixas-pretas de recomendação, o <strong>Feed Pessoal</strong> foi construído sobre uma premissa radical: <strong>Transparência Total</strong>.
          </p>
          <p className="text-sm text-[#444] leading-relaxed mb-4">
            Nós não escondemos como sua edição é montada. Abaixo você encontra a documentação pública e sem cortes de <strong>todos os 8 system prompts reais</strong> que orientam nossos agentes de Inteligência Artificial, assim como a fórmula matemática determinística que ordena seu feed diário.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#555] bg-[#F2F1ED] p-3 border border-[#E0DED8]">
            <div>• Cota Global: <strong>2+ fontes não-ocidentais garantidas</strong></div>
            <div>• Neutralidade: <strong>Anti-clickbait obrigatório</strong></div>
            <div>• Pluralismo: <strong>Até 5 partes interessadas comparadas</strong></div>
          </div>
        </section>

        {/* Fórmula Determinística de Ranking */}
        <section className="p-6 bg-[#FFF] border border-[#E0DED8]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#111] mb-3 border-b border-[#EAE8E1] pb-2">
            08. FÓRMULA MATEMÁTICA DETERMINÍSTICA DE RANKING (RANKER.TS)
          </h2>
          <p className="text-xs text-[#555] mb-4 leading-relaxed">
            A ordenação das notícias não é uma "caixa preta". Cada notícia recebe um Score matemático calculado deterministicamente por:
          </p>
          <div className="p-4 bg-[#111] text-[#FFF] font-mono text-xs mb-4 rounded-sm overflow-x-auto">
            <code>
              Score = (Peso do Tópico Aprendido) × exp(-0.08 × Horas de Antiguidade) × (Fator de Diversidade da Fonte)
            </code>
          </div>
          <ul className="space-y-1.5 text-xs text-[#444] list-disc list-inside">
            <li><strong>Peso do Tópico:</strong> Aumenta quando você lê matérias do tema (+1.5) ou aprofunda via chat (+2.5).</li>
            <li><strong>Decaimento de Recência:</strong> Meia-vida de ~8 horas. Notícias com mais de 48 horas são rigorosamente descartadas.</li>
            <li><strong>Cap de Fonte:</strong> Máximo de 3 matérias por portal no mesmo tópico para evitar monopólio de conteúdo.</li>
          </ul>
        </section>

        {/* Lista de Prompts dos Agentes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E0DED8] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#111]">
              SYSTEM PROMPTS INTEGRIAIS DOS AGENTES DE IA
            </h2>
            <span className="text-xs text-[#777] uppercase font-mono">7 Agentes de LLM Ativos</span>
          </div>

          <div className="space-y-6">
            {AGENT_PROMPTS.map((agent) => (
              <div key={agent.id} className="p-6 bg-[#FFF] border border-[#E0DED8]">
                <div className="flex flex-wrap items-baseline justify-between mb-2 gap-2 border-b border-[#EAE8E1] pb-2">
                  <h3 className="text-sm font-bold text-[#111]">{agent.name}</h3>
                  <span className="text-[10px] font-mono text-[#555] bg-[#F2F1ED] px-2 py-0.5 border border-[#E0DED8]">
                    {agent.model}
                  </span>
                </div>

                <p className="text-xs text-[#555] mb-1 font-mono">Arquivo: {agent.file}</p>
                <p className="text-xs text-[#444] mb-4 leading-relaxed">{agent.purpose}</p>

                <div className="bg-[#F8F7F4] border border-[#E0DED8] p-4 font-mono text-xs text-[#222] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {agent.systemPrompt}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0DED8] bg-[#FFF] py-8 text-center text-xs text-[#777]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Feed Pessoal — Código aberto e transparência de inteligência artificial.</p>
          <Link href="/" className="font-bold text-[#111] underline">
            Voltar à Página Principal
          </Link>
        </div>
      </footer>
    </div>
  )
}
