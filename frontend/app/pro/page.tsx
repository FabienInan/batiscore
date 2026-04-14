import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Shield, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pour les professionnels — Batiscore',
  description:
    'Batiscore pour les professionnels : vérifiez vos sous-traitants, protégez vos projets et vos clients avec des données publiques officielles.',
  alternates: { canonical: 'https://batiscore.ca/pro' },
  openGraph: {
    title: 'Pour les professionnels — Batiscore',
    description:
      'Vérifiez vos sous-traitants et protégez vos projets grâce aux données publiques officielles.',
    locale: 'fr_CA',
    type: 'website',
  },
}

function ProJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pour les professionnels — Batiscore',
    description:
      'Batiscore pour les professionnels : vérifiez vos sous-traitants, protégez vos projets et vos clients.',
    url: 'https://batiscore.ca/pro',
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const features = [
  {
    icon: CheckCircle,
    title: 'Vérifiez vos sous-traitants',
    description:
      'Confirmez la licence RBQ active, le statut REQ en règle et l\'absence de plaintes OPC avant de confier un contrat.',
  },
  {
    icon: AlertTriangle,
    title: 'Détectez les connexions à risque',
    description:
      'Notre algorithme identifie les liens avec des entreprises fermées ou radiées — un signal d\'alerte crucial que les registres ne montrent pas.',
  },
  {
    icon: FileText,
    title: 'Rapports détaillés',
    description:
      'Obtenez un rapport complet avec score de fiabilité, historique de décisions du Bureau des régisseurs et données SEAO.',
  },
]

export default function ProPage() {
  return (
    <>
      <ProJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-slate-900 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield size={24} className="text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pour les professionnels
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
              Protégez vos projets et vos clients en vérifiant vos sous-traitants
              grâce aux données publiques officielles du Québec.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <div className="space-y-8">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-orange-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
                    <p className="text-slate-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Vérifiez un entrepreneur maintenant
            </h2>
            <p className="text-slate-600 mb-6">
              Entrez le nom ou le numéro de licence RBQ pour obtenir un rapport complet.
            </p>
            <Link
              href="/recherche"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-colors"
            >
              <Search size={16} aria-hidden="true" />
              Rechercher
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}