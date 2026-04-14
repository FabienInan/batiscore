import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VILLES } from '@/lib/villes'
import { RisksSection } from '@/components/landing/RisksSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { SourcesSection } from '@/components/landing/SourcesSection'
import { PhenixSection } from '@/components/landing/PhenixSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { SearchBar } from '@/components/landing/SearchBar'
import { VillesGrid } from '@/components/landing/VillesGrid'

const PREFIX = 'verifier-entrepreneur-'

function getVilleData(slug: string) {
  if (!slug.startsWith(PREFIX)) return null
  const key = slug.slice(PREFIX.length)
  return VILLES[key] ?? null
}

export function generateStaticParams() {
  return Object.keys(VILLES).map((key) => ({ ville: PREFIX + key }))
}

export function generateMetadata({ params }: { params: { ville: string } }): Metadata {
  const data = getVilleData(params.ville)
  if (!data) return {}

  return {
    title: `Vérifier un entrepreneur à ${data.nom} — Batiscore`,
    description: `Vérifiez la fiabilité de votre entrepreneur en construction à ${data.nom}. Licence RBQ, statut REQ, plaintes OPC, score de fiabilité. ${data.nbEntrepreneurs} entrepreneurs couverts dans la région de ${data.region}.`,
    keywords: [
      `vérifier entrepreneur ${data.nom}`,
      `entrepreneur fiable ${data.nom}`,
      `entrepreneur rénovation ${data.nom}`,
      `licence RBQ ${data.nom}`,
      `entrepreneur construction ${data.region}`,
    ],
    alternates: { canonical: `https://batiscore.ca/verifier-entrepreneur-${data.slug}` },
    openGraph: {
      title: `Vérifier un entrepreneur à ${data.nom} — Batiscore`,
      description: `Vérifiez la fiabilité d'un entrepreneur à ${data.nom} : licence RBQ, statut REQ, plaintes OPC et connexions à risque. ${data.nbEntrepreneurs} entrepreneurs couverts.`,
      locale: 'fr_CA',
      type: 'website',
    },
  }
}

export default function VillePage({ params }: { params: { ville: string } }) {
  const data = getVilleData(params.ville)
  if (!data) notFound()

  return (
    <main>
      {/* City-specific hero */}
      <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
            {data.nbEntrepreneurs} entrepreneurs couverts
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Vérifier un entrepreneur à{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              {data.nom}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Score de fiabilité, licence RBQ, plaintes OPC et connexions à risque
            pour les entrepreneurs de la région de {data.region}.
          </p>

          <p className="text-slate-500 text-sm mb-8">
            {data.population} habitants &middot; {data.nbEntrepreneurs} entrepreneurs en construction
          </p>

          <div className="w-full max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      <RisksSection />
      <HowItWorksSection />
      <SourcesSection />
      <PhenixSection />
      <FaqSection />
      <CtaSection />

      {/* Local SEO content block */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Pourquoi vérifier un entrepreneur à {data.nom} ?
          </h2>
          <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
            <p>
              {data.nom} compte plus de {data.nbEntrepreneurs} entrepreneurs détenteurs d&apos;une licence RBQ
              dans la région de {data.region}. Vérifier votre entrepreneur avant de signer un contrat
              de rénovation est une étape essentielle pour sécuriser votre investissement.
            </p>
            <p>
              Notre outil croise les données de la RBQ, du REQ, de l&apos;OPC, de CanLII et du SEAO pour
              vous fournir un score de fiabilité objectif. Vous pouvez vérifier si un entrepreneur à {data.nom}
              est en règle, s&apos;il a des plaintes déposées, ou s&apos;il présente des{' '}
              <a href="/verifier-entrepreneur-renovation" className="text-orange-600 underline">connexions à risque avec des entreprises fermées</a>.
            </p>
            <p>
              Les travaux de rénovation à {data.nom} représentent des investissements importants.
              Une vérification gratuite de 30 secondes peut vous éviter des milliers de dollars de pertes.
            </p>
          </div>
        </div>
      </section>

      <VillesGrid currentSlug={data.slug} />
    </main>
  )
}
