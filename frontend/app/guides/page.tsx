import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guides pratiques — Vérification entrepreneur Québec',
  description:
    'Guides gratuits pour vérifier un entrepreneur au Québec : licence RBQ, société phénix, plaintes OPC, réclamations et recours.',
  keywords: [
    'guide vérification entrepreneur Québec',
    'comment vérifier licence RBQ',
    'société phénix entrepreneur',
    'plainte OPC entrepreneur',
    'réclamation RBQ cautionnement',
    'entrepreneur sans licence risques',
    'vérifier entrepreneur rénovation',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/' },
  openGraph: {
    title: 'Guides pratiques — Vérification entrepreneur Québec',
    description:
      'Guides gratuits pour vérifier un entrepreneur au Québec : licence RBQ, société phénix, plaintes OPC, réclamations et recours.',
    locale: 'fr_CA',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

function BreadcrumbJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://batiscore.ca',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: 'https://batiscore.ca/guides/',
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const GUIDES = [
  {
    slug: 'verifier-licence-rbq',
    title: 'Comment vérifier une licence RBQ',
    description:
      'Guide complet pour vérifier une licence RBQ : statuts (valide, suspendue, annulée), licence générale vs spécialisée, vérification en ligne et recours en cas de problème.',
    tags: ['RBQ', 'licence', 'vérification'],
  },
  {
    slug: 'societe-phenix',
    title: 'Société phénix : repérer un entrepreneur qui réouvre',
    description:
      'Comment détecter une société phénix : signaux d\'alerte, vérifications à faire et protections pour les consommateurs québécois.',
    tags: ['société phénix', 'fraude', 'protection'],
  },
  {
    slug: 'entrepreneur-sans-licence',
    title: 'Entrepreneur sans licence : risques et recours',
    description:
      'Les risques de faire appel à un entrepreneur sans licence RBQ au Québec et les recours disponibles pour les consommateurs.',
    tags: ['sans licence', 'risques', 'recours'],
  },
  {
    slug: 'reclamation-rbq',
    title: 'Réclamation RBQ cautionnement : comment ça marche',
    description:
      'Guide sur les réclamations au fonds de cautionnement de la RBQ : qui peut réclamer, dans quels cas et comment procéder.',
    tags: ['cautionnement', 'réclamation', 'indemnisation'],
  },
  {
    slug: 'plainte-opc-entrepreneur',
    title: 'Déposer une plainte OPC contre un entrepreneur',
    description:
      'Comment déposer une plainte à l\'Office de la protection du consommateur contre un entrepreneur en construction au Québec.',
    tags: ['OPC', 'plainte', 'consommateur'],
  },
]

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-white">
      <BreadcrumbJsonLd />

      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Guides pratiques
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ressources gratuites pour vérifier la fiabilité de votre entrepreneur
            et protéger votre investissement en rénovation.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}/`}
              className="group block p-6 rounded-xl border border-slate-100 hover:border-orange-300/50 hover:shadow-saas-hover transition-all duration-300 bg-white"
            >
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-2">
                {guide.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {guide.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Besoin de vérifier un entrepreneur maintenant ?
          </h2>
          <p className="text-slate-600 mb-8">
            Notre outil croise les données de la RBQ, du REQ, de l&apos;OPC et de CanLII
            pour vous donner un score de fiabilité complet en 30 secondes.
          </p>
          <Link
            href="/recherche/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Vérifier un entrepreneur &rarr;
          </Link>
        </div>
      </section>
    </main>
  )
}
