import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RBQ Checker - Vérification entrepreneurs Québec',
  description: 'Vérifiez la fiabilité des entrepreneurs en construction au Québec',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}