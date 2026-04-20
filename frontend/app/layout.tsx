import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import './globals.css'
import { Header, Footer } from '@/components/layout'

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export const metadata: Metadata = {
  title: {
    default: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    template: '%s — Batiscore',
  },
  description: 'Vérifiez la fiabilité de votre entrepreneur en construction au Québec avant de signer. Score de fiabilité, licence RBQ, plaintes OPC, litiges et connexions à risque. Données publiques.',
  keywords: [
    'vérifier entrepreneur rénovation Québec',
    'entrepreneur fiable Québec',
    'vérification entrepreneur construction',
    'licence RBQ valide',
    'score fiabilité entrepreneur',
    'plaintes OPC entrepreneur',
    'réclamation RBQ',
    'entrepreneur radié Québec',
    'comment choisir entrepreneur rénovation',
    'vérifier entrepreneur avant de signer',
  ],
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon',
  },
  openGraph: {
    title: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    description: 'Score de fiabilité basé sur RBQ, REQ, OPC, CanLII et SEAO. Ne confiez pas vos travaux à un entrepreneur non vérifié.',
    url: 'https://batiscore.ca',
    siteName: 'Batiscore',
    locale: 'fr_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    description: 'Score de fiabilité basé sur RBQ, REQ, OPC, CanLII et SEAO.',
  },
  alternates: {
    canonical: 'https://batiscore.ca',
  },
  robots: {
    index: true,
    follow: true,
  },
}

function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Batiscore',
    url: 'https://batiscore.ca',
    description: 'Vérification de la fiabilité des entrepreneurs en construction au Québec',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Québec',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Batiscore',
    url: 'https://batiscore.ca',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://batiscore.ca/recherche?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Est-ce que la recherche est gratuite ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, la recherche d\'un entrepreneur est 100% gratuite. Vous pouvez vérifier le nom, le numéro RBQ, le statut et le score de fiabilité sans payer.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment vérifier si un entrepreneur a eu des problèmes sous un autre nom ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Certains entrepreneurs ferment leur compagnie pour effacer leurs dettes et leur mauvaise réputation, puis recommencent sous un nouveau nom — souvent avec le même numéro de téléphone et la même adresse. Notre outil détecte automatiquement ces connexions entre entreprises.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment est calculé le score de fiabilité ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le score de 0 à 100 est basé sur : le statut de la licence RBQ, le statut au REQ, les plaintes à l\'OPC, les décisions du Bureau des régisseurs (CanLII), les contrats publics obtenus (SEAO), et la détection de connexions avec des entreprises radiées.',
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${lexend.variable} font-sans bg-background text-slate-900 antialiased`}>
        <JsonLd />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}