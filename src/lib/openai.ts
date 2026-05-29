import OpenAI from 'openai'

// Fallback para evitar crash em runtime se a chave não estiver configurada.
// As chamadas vão falhar individualmente e ser tratadas nos catch de cada serviço.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
})
