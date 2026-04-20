import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VILLES, MRCS, type VilleData, type MrcData } from '@/lib/locations'
import { RisksSection } from '@/components/landing/RisksSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { SourcesSection } from '@/components/landing/SourcesSection'
import { PhenixSection } from '@/components/landing/PhenixSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { SearchBar } from '@/components/landing/SearchBar'
import { VillesGrid } from '@/components/landing/VillesGrid'
import { MrcGrid } from '@/components/landing/MrcGrid'

const VILLE_PREFIX = 'verifier-entrepreneur-'
const MRC_PREFIX = 'verifier-entrepreneur-mrc-'

type PageData =
  | { type: 'ville'; data: VilleData }
  | { type: 'mrc'; data: MrcData }

function getPageData(slug: string): PageData | null {
  if (slug.startsWith(MRC_PREFIX)) {
    const key = slug.slice(MRC_PREFIX.length)
    const data = MRCS[key]
    if (data) return { type: 'mrc', data }
  }
  if (slug.startsWith(VILLE_PREFIX)) {
    const key = slug.slice(VILLE_PREFIX.length)
    const data = VILLES[key]
    if (data) return { type: 'ville', data }
  }
  return null
}

export function generateStaticParams() {
  const villeParams = Object.keys(VILLES).map((key) => ({ ville: VILLE_PREFIX + key }))
  const mrcParams = Object.keys(MRCS).map((key) => ({ ville: MRC_PREFIX + key }))
  return [...villeParams, ...mrcParams]
}

export function generateMetadata({ params }: { params: { ville: string } }): Metadata {
  const page = getPageData(params.ville)
  if (!page) return {}

  if (page.type === 'ville') {
    const data = page.data
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
      robots: { index: true, follow: true },
    }
  }

  const data = page.data
  const shortName = data.nom.replace('MRC de ', '').replace('MRC du ', '').replace('MRC des ', '')
  return {
    title: `Vérifier un entrepreneur dans la ${data.nom} — Batiscore`,
    description: `Vérifiez la fiabilité de votre entrepreneur en construction dans la ${data.nom}. Licence RBQ, statut REQ, plaintes OPC, score de fiabilité. ${data.nbEntrepreneurs} entrepreneurs couverts dans la région de ${data.region}.`,
    keywords: [
      `vérifier entrepreneur ${shortName}`,
      `entrepreneur fiable ${data.region}`,
      `entrepreneur rénovation ${data.region}`,
      `licence RBQ ${data.region}`,
      `entrepreneur construction ${data.region}`,
    ],
    alternates: { canonical: `https://batiscore.ca/verifier-entrepreneur-mrc-${data.slug}` },
    openGraph: {
      title: `Vérifier un entrepreneur dans la ${data.nom} — Batiscore`,
      description: `Vérifiez la fiabilité d'un entrepreneur dans la ${data.nom} : licence RBQ, statut REQ, plaintes OPC et connexions à risque. ${data.nbEntrepreneurs} entrepreneurs couverts.`,
      locale: 'fr_CA',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

function VilleJsonLd({ data }: { data: VilleData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vérifier un entrepreneur à ${data.nom}`,
    description: `Vérifiez la fiabilité de votre entrepreneur en construction à ${data.nom}. ${data.nbEntrepreneurs} entrepreneurs couverts dans la région de ${data.region}.`,
    url: `https://batiscore.ca/verifier-entrepreneur-${data.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    about: {
      '@type': 'City',
      name: data.nom,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: data.region,
      },
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function MrcJsonLd({ data }: { data: MrcData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Vérifier un entrepreneur dans la ${data.nom}`,
    description: `Vérifiez la fiabilité de votre entrepreneur en construction dans la ${data.nom}. ${data.nbEntrepreneurs} entrepreneurs couverts dans la région de ${data.region}.`,
    url: `https://batiscore.ca/verifier-entrepreneur-mrc-${data.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    about: {
      '@type': 'AdministrativeArea',
      name: data.nom,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: data.region,
      },
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

function VilleHero({ data }: { data: VilleData }) {
  return (
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
  )
}

function MrcHero({ data }: { data: MrcData }) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
          {data.nbEntrepreneurs} entrepreneurs couverts
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
          Vérifier un entrepreneur dans la{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            {data.nom}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
          Score de fiabilité, licence RBQ, plaintes OPC et connexions à risque
          pour les entrepreneurs de la région de {data.region}.
        </p>

        <p className="text-slate-500 text-sm mb-8">
          Région de {data.region} &middot; {data.nbEntrepreneurs} entrepreneurs en construction
        </p>

        <div className="w-full max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>
    </section>
  )
}

function MrcVillesList({ data }: { data: MrcData }) {
  return (
    <section className="bg-white py-8 border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          Villes desservies dans la {data.nom}
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.villesPrincipales.map((ville) => (
            <a
              key={ville}
              href={`/recherche?q=${encodeURIComponent(ville)}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              {ville}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function VilleSeoContent({ data }: { data: VilleData }) {
  return (
    <section className="bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pourquoi vérifier un entrepreneur à {data.nom} ?
        </h2>
        <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
          <p>
            {data.nom} compte plus de {data.nbEntrepreneurs} entrepreneurs détenteurs d&apos;une licence RBQ
            dans la région de {data.region}. Avec une population de {data.population} habitants,
            la demande en travaux de rénovation et de construction est importante.
            Vérifier votre entrepreneur avant de signer un contrat
            est une étape essentielle pour sécuriser votre investissement.
          </p>
          <p>
            Au Québec, tout entrepreneur en construction doit détenir une licence valide de la
            Régie du bâtiment du Québec (RBQ). À {data.nom}, plusieurs entrepreneurs ont déjà été
            radiés, suspendus ou ont accumulé des plaintes à l&apos;Office de la protection du
            consommateur. Certaines entreprises ferment pour échapper à leurs obligations et
            rouvrent sous un nouveau nom — un phénomène connu sous le nom de{' '}
            <a href="/verifier-entrepreneur-renovation" className="text-orange-600 underline">société phénix</a>.
          </p>
          <p>
            Notre outil croise les données de la RBQ, du REQ, de l&apos;OPC, de CanLII et du SEAO pour
            vous fournir un score de fiabilité objectif. Vous pouvez vérifier si un entrepreneur à {data.nom}
            est en règle, s&apos;il a des plaintes déposées, ou s&apos;il présente des connexions à risque
            avec des entreprises fermées.
          </p>
          <h3>Comment vérifier un entrepreneur à {data.nom} en 3 étapes</h3>
          <ol>
            <li>Entrez le nom, le numéro RBQ ou le NEQ de l&apos;entrepreneur dans la barre de recherche ci-dessus</li>
            <li>Consultez le score de fiabilité et les détails du rapport : licence RBQ, statut REQ, plaintes OPC</li>
            <li>Vérifiez les connexions avec des entreprises fermées pour détecter les sociétés phénix</li>
          </ol>
          <p>
            Les travaux de rénovation à {data.nom} représentent des investissements importants.
            Une vérification gratuite de 30 secondes peut vous éviter des milliers de dollars de pertes.
          </p>
        </div>
      </div>
    </section>
  )
}

function MrcSeoContent({ data }: { data: MrcData }) {
  return (
    <section className="bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Pourquoi vérifier un entrepreneur dans la {data.nom} ?
        </h2>
        <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
          <p>
            La {data.nom} compte plus de {data.nbEntrepreneurs} entrepreneurs détenteurs d&apos;une licence RBQ
            dans la région de {data.region}. Les villes principales incluent{' '}
            {data.villesPrincipales.slice(0, -1).join(', ')}
            {data.villesPrincipales.length > 1 ? ' et ' : ''}
            {data.villesPrincipales[data.villesPrincipales.length - 1]}.
            Vérifier votre entrepreneur avant de signer un contrat de rénovation est une étape essentielle
            pour sécuriser votre investissement.
          </p>
          <p>
            Au Québec, tout entrepreneur en construction doit détenir une licence valide de la
            Régie du bâtiment du Québec (RBQ). Dans la {data.nom}, plusieurs entrepreneurs ont déjà été
            radiés, suspendus ou ont accumulé des plaintes à l&apos;Office de la protection du
            consommateur. Certaines entreprises ferment pour échapper à leurs obligations et
            rouvrent sous un nouveau nom — un phénomène connu sous le nom de{' '}
            <a href="/verifier-entrepreneur-renovation" className="text-orange-600 underline">société phénix</a>.
          </p>
          <p>
            Notre outil croise les données de la RBQ, du REQ, de l&apos;OPC, de CanLII et du SEAO pour
            vous fournir un score de fiabilité objectif. Vous pouvez vérifier si un entrepreneur dans la {data.nom}
            est en règle, s&apos;il a des plaintes déposées, ou s&apos;il présente des connexions à risque
            avec des entreprises fermées.
          </p>
          <h3>Comment vérifier un entrepreneur dans la {data.nom} en 3 étapes</h3>
          <ol>
            <li>Entrez le nom, le numéro RBQ ou le NEQ de l&apos;entrepreneur dans la barre de recherche ci-dessus</li>
            <li>Consultez le score de fiabilité et les détails du rapport : licence RBQ, statut REQ, plaintes OPC</li>
            <li>Vérifiez les connexions avec des entreprises fermées pour détecter les sociétés phénix</li>
          </ol>
          <p>
            Les travaux de rénovation dans la {data.nom} représentent des investissements importants.
            Une vérification gratuite de 30 secondes peut vous éviter des milliers de dollars de pertes.
          </p>
        </div>
      </div>
    </section>
  )
}

export default function LocationPage({ params }: { params: { ville: string } }) {
  const page = getPageData(params.ville)
  if (!page) notFound()

  if (page.type === 'ville') {
    const data = page.data
    return (
      <main>
        <VilleJsonLd data={data} />
        <VilleHero data={data} />
        <RisksSection />
        <HowItWorksSection />
        <SourcesSection />
        <PhenixSection />
        <FaqSection />
        <CtaSection />
        <VilleSeoContent data={data} />
        <VillesGrid currentSlug={data.slug} />
      </main>
    )
  }

  const data = page.data
  return (
    <main>
      <MrcJsonLd data={data} />
      <MrcHero data={data} />
      <MrcVillesList data={data} />
      <RisksSection />
      <HowItWorksSection />
      <SourcesSection />
      <PhenixSection />
      <FaqSection />
      <CtaSection />
      <MrcSeoContent data={data} />
      <MrcGrid currentSlug={data.slug} />
      <VillesGrid />
    </main>
  )
}