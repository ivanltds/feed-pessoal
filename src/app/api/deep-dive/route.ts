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

  const systemPrompt = `Você é um jornalista especialista e parceiro de aprofundamento sobre ${topic}.
${newsContext ? `\n${newsContext}\n` : ''}
Sua missão:
- Responder de forma clara, objetiva e factualmente precisa
- Trazer contexto, dados e perspectivas que o leitor não encontraria em uma manchete
- Evitar opiniões políticas ou julgamentos — foque em fatos e análise
- Ser conciso: máximo 3 parágrafos por resposta
- Sugerir links de notícias relacionadas quando relevante

Ao final de cada resposta, se houver links relevantes, adicione um bloco JSON:
<links>
[{"title":"...","url":"...","source":"..."}]
</links>`

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
