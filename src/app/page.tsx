import { cookies } from 'next/headers'
import { getTodaysEdition } from '@/services/edition-builder'
import EditionFeed from '@/components/EditionFeed'
import BuildingScreen from '@/components/BuildingScreen'
import LandingPage from '@/components/LandingPage'

export default async function HomePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) return <LandingPage />

  const edition = await getTodaysEdition(userId)

  if (!edition || edition.items.length === 0) {
    return <BuildingScreen userId={userId} />
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return <EditionFeed items={edition.items} editionId={edition.id} date={today} userId={userId} />
}
