import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getTodaysEdition, buildEditionForUser } from '@/services/edition-builder'
import EditionFeed from '@/components/EditionFeed'

export default async function HomePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/onboarding')

  let edition = await getTodaysEdition(userId)

  if (!edition) {
    await buildEditionForUser(userId)
    edition = await getTodaysEdition(userId)
  }

  if (!edition || edition.items.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-semibold mb-3">Preparando sua edição…</h1>
          <p className="text-neutral-500 text-sm">
            As fontes estão sendo consultadas. Atualize a página em alguns instantes.
          </p>
        </div>
      </main>
    )
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return <EditionFeed items={edition.items} editionId={edition.id} date={today} userId={userId} />
}
