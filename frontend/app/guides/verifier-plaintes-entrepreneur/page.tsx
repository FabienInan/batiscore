import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Comment savoir si un entrepreneur a eu des plaintes',
  description:
    'Vérifiez si un entrepreneur a eu des plaintes au Québec : sources publiques à consulter (OPC, RBQ, CanLII), signaux d\'alerte et questions à poser.',
  keywords: [
    'comment savoir si un entrepreneur a eu des plaintes',
    'plaintes entrepreneur Québec',
    'vérifier plaintes entrepreneur',
    'plaintes OPC entrepreneur',
    'entrepreneur plaintes RBQ',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/verifier-plaintes-entrepreneur' },
  openGraph: {
    title: 'Comment savoir si un entrepreneur a eu des plaintes',
    description:
      'Sources publiques pour vérifier les plaintes contre un entrepreneur au Québec, signaux d\'alerte et questions à poser avant de signer.',
    locale: 'fr_CA',
    type: 'article',
  },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment savoir si un entrepreneur a eu des plaintes',
    description:
      'Sources publiques pour vérifier les plaintes contre un entrepreneur au Québec, signaux d\'alerte et questions à poser.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2026-11-01',
    dateModified: '2026-11-01',
    mainEntityOfPage: 'https://batiscore.ca/guides/verifier-plaintes-entrepreneur',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function FaqJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Une plainte contre un entrepreneur veut-elle dire qu\'il est malhonnête ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pas nécessairement. Une plainte décrit une situation, pas un jugement. Regardez la date, la nature du problème et si la plainte a été réglée ou non. Plusieurs plaintes récentes et non réglées sont un signal plus fort qu\'une plainte isolée et ancienne.',
        },
      },
      {
        '@type': 'Question',
        name: 'Puis-je demander à l\'entrepreneur de me montrer ses plaintes ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vous pouvez lui demander des références de clients récents et ce qu\'il a réglé avec eux. Une réponse claire et vérifiable est rassurante. Un refus de répondre ou des réponses vagues sont à prendre en compte.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quelles sources publiques consulter ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le registre de la Régie du bâtiment du Québec (RBQ) pour la licence et les sanctions, le Registraire des entreprises (REQ) pour le statut de l\'entreprise, l\'Office de la protection du consommateur (OPC) pour les plaintes, et CanLII pour les décisions publiées. Batiscore regroupe ces sources pour un même entrepreneur.',
        },
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

export default function VerifierPlaintesEntrepreneurPage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Comment savoir si un entrepreneur"
          titleHighlight="a eu des plaintes"
          subtitle="Les sources publiques à consulter, les signaux d'alerte à repérer et les questions à poser avant de signer un contrat."
        />

        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Où chercher les plaintes ?</h2>
              <p>
                Il n&apos;existe pas un seul registre qui regroupe toutes les plaintes contre un
                entrepreneur. Il faut consulter plusieurs sources, qui couvrent chacune une partie
                du dossier :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>L&apos;Office de la protection du consommateur (OPC)</strong> reçoit les
                  plaintes des consommateurs contre les commerçants et les entrepreneurs.
                </li>
                <li>
                  <strong>La Régie du bâtiment du Québec (RBQ)</strong> publie le statut de la
                  licence et les sanctions, comme une suspension ou une annulation.
                </li>
                <li>
                  <strong>Le Registraire des entreprises (REQ)</strong> indique si l&apos;entreprise
                  est active, radiée ou sous un autre nom.
                </li>
                <li>
                  <strong>CanLII</strong> publie certaines décisions judiciaires et administratives
                  qui concernent l&apos;entrepreneur ou ses dirigeants.
                </li>
              </ul>
              <p>
                Batiscore regroupe ces sources pour un même entrepreneur, à partir de son nom,
                de son numéro de licence RBQ ou de son NEQ.{' '}
                <Link href="/recherche" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Rechercher un entrepreneur &rarr;
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comment interpréter ce que vous trouvez</h2>
              <p>
                Une plainte ou une décision ne dit pas tout. Avant de conclure, vérifiez :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>La date :</strong> une plainte de plusieurs années n&apos;a pas le même poids
                  qu&apos;une plainte récente.
                </li>
                <li>
                  <strong>La nature :</strong> un retard de livraison et des travaux non conformes
                  ou abandonnés ne posent pas les mêmes risques.
                </li>
                <li>
                  <strong>Le suivi :</strong> la plainte a-t-elle été réglée, retirée ou laissée
                  sans suite ?
                </li>
                <li>
                  <strong>Le nombre :</strong> plusieurs plaintes semblables et récentes sont un
                  signal d&apos;alerte sérieux.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Signaux d&apos;alerte</h2>
              <ul className="space-y-3">
                <li>Demande d&apos;acompte important avant le début des travaux.</li>
                <li>Entreprise radiée, ou changement de nom peu après une sanction (voir la <Link href="/guides/societe-phenix" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">société phénix</Link>).</li>
                <li>Licence RBQ suspendue, annulée ou absente.</li>
                <li>Refus de fournir des références de clients récents.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>

              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Une plainte veut-elle dire qu&apos;il est malhonnête ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Pas nécessairement. Une plainte décrit une situation, pas un jugement. Regardez la
                    date, la nature du problème et si la plainte a été réglée. Plusieurs plaintes
                    récentes et non réglées sont un signal plus fort qu&apos;une plainte isolée et ancienne.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Puis-je demander à l&apos;entrepreneur de me montrer ses plaintes ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Vous pouvez lui demander des références de clients récents et ce qu&apos;il a réglé
                    avec eux. Une réponse claire et vérifiable est rassurante. Un refus de répondre ou
                    des réponses vagues sont à prendre en compte.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Quelles sources publiques consulter ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Le registre de la RBQ pour la licence et les sanctions, le REQ pour le statut de
                    l&apos;entreprise, l&apos;OPC pour les plaintes, et CanLII pour les décisions publiées.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Comment vérifier une licence RBQ
                  </Link>
                </li>
                <li>
                  <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Déposer une plainte OPC contre un entrepreneur
                  </Link>
                </li>
                <li>
                  <Link href="/guides/reclamation-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Plainte RBQ et réclamation en rénovation
                  </Link>
                </li>
              </ul>
            </section>

          </div>
        </article>

        <GuideCta />
      </main>
    </>
  )
}
