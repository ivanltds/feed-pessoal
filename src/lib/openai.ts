import OpenAI from 'openai'

// Fallback para evitar crash em runtime se a chave não estiver configurada.
// dangerouslyAllowBrowser: true impede exceção não tratada caso o Next.js agrupe utilitários em bundle híbrido.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'missing',
  dangerouslyAllowBrowser: true,
})
