import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { LanguageSelector } from '@/components/common/LanguageSelector'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Issue Tracker Kanban',
  description: 'Manage your issues with Kanban boards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="fixed bottom-4 right-4 z-50">
            <LanguageSelector />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
