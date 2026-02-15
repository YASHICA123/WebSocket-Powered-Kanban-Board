import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'

import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Kanban Board - Real-Time Task Management',
  description: 'A real-time collaborative Kanban board for organizing tasks and managing workflows with WebSocket synchronization.',
  generator: 'v0.app',
  keywords: ['kanban', 'task management', 'real-time', 'collaboration'],
  authors: [{ name: 'Kanban Team' }],
  openGraph: {
    title: 'Kanban Board',
    description: 'Real-time collaborative task management',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${fraunces.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
