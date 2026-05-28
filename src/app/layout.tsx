import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import CookieBanner from '@/components/CookieBanner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'feed pessoal',
  description: 'Sua edição diária de notícias, sem clickbait.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full text-neutral-900 font-sans">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
