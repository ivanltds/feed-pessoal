import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { messages, topic, itemId } = await req.json()

  let newsContext = ''
  if (itemId) {
    const item = await prisma.newsItem.findUnique({ where: { id: itemId } })
    if (item) {
      newsContext = `Notícia de referência: "${item.normalizedTitle}" (${item.sourceName})`
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
- Nunca comece com "Embora", "Apesar", disclaimers ou desculpas.

Ao final, se houver fontes específicas relevantes (com URL real e verificável), adicione:
<links>
[{"title":"...","url":"...","source":"..."}]
</links>
Se não tiver certeza de uma URL, não inclua o bloco de links.`

  const formattedMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...formattedMessages,
    ],
  })

  const fullText = response.choices[0]?.message?.content ?? ''

  const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/)
  let related: { title: string; url: string; source: string }[] = []
  let answer = fullText

  if (linksMatch) {
    try {
      related = JSON.parse(linksMatch[1].trim())
      answer = fullText.replace(/<links>[\s\S]*?<\/links>/, '').trim()
    } catch {
      // ignora erro de parse
    }
  }

  return NextResponse.json({ answer, related })
}
