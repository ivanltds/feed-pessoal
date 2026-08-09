import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages = [], topic = 'Geral', itemId } = body as {
      messages: { role: string; content: string }[]
      topic?: string
      itemId?: string
    }

    let newsContext = ''
    if (itemId && typeof itemId === 'string') {
      try {
        const item = await prisma.newsItem.findUnique({ where: { id: itemId } })
        if (item) {
          newsContext = `Notícia de referência: "${item.normalizedTitle}" (${item.sourceName})`
        }
      } catch (dbErr) {
        console.error('[DeepDiveAPI] Erro ao buscar notícia por ID:', dbErr)
      }
    }

    const systemPrompt = `Você é um analista jornalístico especializado em ${topic}.
${newsContext ? `\nContexto da notícia: ${newsContext}\n` : ''}
Regras de resposta:
- Responda DIRETAMENTE à pergunta. Nunca diga que não tem acesso a dados em tempo real — use seu conhecimento para dar contexto, histórico e análise.
- Seja objetivo e conciso: 2 a 3 parágrafos curtos, separados por linha em branco.
- Traga fatos concretos, números, nomes e contexto histórico quando relevante.
- Tom: analítico, direto, sem jargão excessivo. Como um colega bem informado explicando o assunto.
- Se a pergunta for sobre "mais notícias" ou "desdobramentos", explique o contexto, os atores envolvidos e o que está em jogo — não genérico, mas específico ao tema.
- Nunca comece com "Embora", "Apesar", disclaimers ou desculpas.`

    const formattedMessages = messages.map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content || '',
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages,
      ],
    })

    const fullText = response.choices[0]?.message?.content ?? ''

    return NextResponse.json({ answer: fullText, related: [] })
  } catch (error) {
    console.error('[DeepDiveAPI] Erro crítico na rota:', error)
    return NextResponse.json(
      {
        answer: 'O assistente encontrou uma oscilação na consulta de inteligência. Por favor, envie sua pergunta novamente.',
        related: [],
      },
      { status: 200 }
    )
  }
}
