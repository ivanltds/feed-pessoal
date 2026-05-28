# Como rodar o feed-pessoal localmente

## Pré-requisitos
- Node.js 18 ou superior
- Uma chave de API da Anthropic (obrigatório)
- Uma chave do Resend (opcional — só necessário para envio de email)

## 1. Instalar dependências

```bash
cd feed-pessoal/app
npm install
```

## 2. Configurar variáveis de ambiente

Abra o arquivo `.env.local` e preencha:

```env
ANTHROPIC_API_KEY=sk-ant-...     # sua chave Anthropic
RESEND_API_KEY=re_...            # opcional, para email
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="file:./prisma/dev.db"
```

Obtenha sua chave Anthropic em: https://console.anthropic.com

## 3. Criar o banco de dados

```bash
npm run db:generate   # gera o Prisma Client
npm run db:push       # cria as tabelas no SQLite local
```

## 4. Rodar o app

```bash
npm run dev
```

Acesse: http://localhost:3000

## Fluxo de uso

1. Na primeira visita, você será direcionado ao **onboarding** (tela de configuração)
2. Selecione seus temas, horário preferido e email
3. O app gera automaticamente sua **edição diária** com 7 notícias
4. Ao rolar até o final, aparece a tela "Você está em dia" com 3 perguntas sugeridas
5. Toque em uma pergunta para entrar no **modo de aprofundamento** (conversa com IA)

## Como adicionar uma nova fonte de notícias

Abra `src/adapters/sources.ts` e adicione ao array `ACTIVE_SOURCES`:

```typescript
{ id: 'minha-fonte', name: 'Minha Fonte', url: 'https://...feed.xml', topic: 'Tecnologia' },
```

Só isso. Sem refatoração.

## Como remover uma fonte

No mesmo arquivo, comente ou remova a linha da fonte:

```typescript
// { id: 'fonte-ruim', name: '...', url: '...', topic: '...' },
```

## Visualizar o banco de dados

```bash
npm run db:studio
```

Abre uma interface visual em http://localhost:5555

## Estrutura do projeto

```
src/
├── adapters/          # Fontes plugáveis (RSS)
├── domain/news/       # Tipos e entidades
├── services/          # Lógica de negócio
│   ├── title-normalizer.ts    # Anti-clickbait via LLM
│   ├── question-generator.ts  # Perguntas sugeridas
│   ├── ranker.ts              # Algoritmo de relevância
│   └── edition-builder.ts     # Orquestrador da edição
├── components/        # UI reutilizável
└── app/               # Rotas Next.js
    ├── page.tsx               # Edição (Modo 1)
    ├── deep/                  # Aprofundamento (Modo 2)
    ├── onboarding/            # Setup inicial
    └── api/                   # Endpoints
```

## Como o feedback muda o feed

Cada interação do usuário atualiza pesos por tema no banco:
- Tocou em uma pergunta sugerida → +2 no tema
- Leu um card por mais de 20s → +1 no tema  
- Passou rápido por um card (<5s) → -0.5 no tema

O feed do dia seguinte usa esses pesos para rankear as notícias candidatas.
Você vai sentir a diferença a partir do dia 3.
