import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Société phénix en construction — Comment détecter une entreprise relance',
  description:
    'Comment détecter une société phénix au Québec : signaux d&apos;alerte, analyse automatique des connexions entre entreprises et recours pour les consommateurs.',
  keywords: [
    'société phénix',
    'entreprise relance',
    'société écran',
    'entrepreneur phénix Québec',
    'détection société phénix',
    'entreprise qui réouvre sous un nouveau nom',
    'fraude construction Québec',
    'vérifier entrepreneur',
    'RBQ phénix',
    'Batiscore phénix',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/societe-phenix' },
  openGraph: {
    title: 'Société phénix en construction — Comment détecter une entreprise relance',
    description:
      'Apprenez à repérer les sociétés phénix dans le secteur de la construction au Québec : mêmes téléphone, adresse, nom ou dirigeant que des entreprises fermées.',
    locale: 'fr_CA',
    type: 'article',
  },
  robots: { index: true },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Société phénix en construction — Comment détecter une entreprise relance',
    description:
      'Comment détecter une société phénix au Québec : signaux d&apos;alerte, analyse automatique des connexions entre entreprises et recours pour les consommateurs.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/guides/societe-phenix',
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
        name: "Est-ce qu'un entrepreneur peut légalement fermer sa compagnie et en ouvrir une autre ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui, c'est légal. Un entrepreneur a le droit de fermer une entreprise et d'en créer une nouvelle. Cependant, les connexions entre les deux entités sont révélatrices : même téléphone, même adresse, même dirigeant ou nom similaire constituent des signaux qu'il s'agit d'une société phénix, c'est-à-dire une entreprise relance créée pour contourner les dettes ou la réputation de l'ancienne.",
        },
      },
      {
        '@type': 'Question',
        name: 'La RBQ vérifie-t-elle ces connexions ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Partiellement. La RBQ vérifie certains antécédents lors de la délivrance d'une nouvelle licence, mais des changements de dirigeants nominaux ou l'utilisation de prête-noms peuvent contourner ces contrôles. C'est pourquoi des outils comme Batiscore, qui croisent automatiquement les données entre toutes les entreprises du secteur, sont essentiels pour détecter les sociétés phénix.",
        },
      },
      {
        '@type': 'Question',
        name: 'Comment Batiscore détecte-t-il les sociétés phénix ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Batiscore croise automatiquement les numéros de téléphone, les adresses, les noms d'entreprise et les dates de création entre toutes les entreprises du secteur de la construction au Québec. Lorsqu'une nouvelle entreprise partage des connexions significatives avec une entreprise fermée, un score phénix est calculé pour évaluer la probabilité qu'il s'agisse d'une relance.",
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
        item: 'https://batiscore.ca/guides',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Société phénix',
        item: 'https://batiscore.ca/guides/societe-phenix',
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

export default function SocietePhenixPage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Société phénix"
          titleHighlight="en construction"
          subtitle="Comment repérer une entreprise qui ferme pour réouvrir sous un nouveau nom — et protéger vos projets de rénovation au Québec."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Qu&apos;est-ce qu&apos;une société phénix ?</h2>
              <p>
                Une <strong>société phénix</strong> — aussi appelée <strong>entreprise relance</strong>{' '}
                ou <strong>société écran</strong> — est une entreprise qui ferme ses portes pour
                échapper à ses dettes, ses poursuites ou sa mauvaise réputation, puis réouvre sous
                une nouvelle identité. Le principe est simple : en créant une nouvelle personne
                morale, l&apos;entrepreneur repart avec un casier judiciaire vierge, une licence
                RBQ fraîchement obtenue et aucun passif visible. Pour le consommateur, la nouvelle
                entreprise semble fiable et sans historique — alors qu&apos;elle partage souvent les
                mêmes dirigeants, la même adresse et le même téléphone que l&apos;ancienne.
              </p>
              <p>
                Ce phénomène est particulièrement répandu dans le secteur de la construction au
                Québec, où les sanctions de la RBQ (suspension, révocation) et les dettes peuvent
                pousser certains entrepreneurs à contourner le système en créant une nouvelle entité.
                Les conséquences pour les consommateurs sont graves : travaux laissés inachevés,
                garanties invalidées et recours quasi impossibles contre une entreprise dissoute.
              </p>
              <p>
                Selon les données croisées par Batiscore, une proportion significative des entreprises
                de construction récemment créées au Québec présente au moins un lien avec une
                entreprise antérieurement fermée. Identifier ces connexions est essentiel pour
                protéger les consommateurs et maintenir l&apos;intégrité du secteur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Les signaux d&apos;alerte</h2>
              <p>
                Plusieurs indices peuvent vous alerter sur la nature phénix d&apos;une entreprise.
                Voici les quatre signaux les plus fiables, classés par ordre de pertinence :
              </p>

              <div className="space-y-4 my-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-red-900 mb-1">Même numéro de téléphone</h3>
                  <p className="text-red-800 text-sm leading-relaxed">
                    Le partage d&apos;un numéro de téléphone entre une entreprise fermée et une
                    entreprise nouvellement créée est le <strong>signal le plus fiable</strong> de
                    reconnexion. Un entrepreneur qui change de nom mais conserve le même téléphone
                    de contact révèle une continuité d&apos;activité sous une nouvelle identité. Ce
                    signal est rarement un faux positif.
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-orange-900 mb-1">Même adresse d&apos;affaires</h3>
                  <p className="text-orange-800 text-sm leading-relaxed">
                    Partager une adresse commerciale entre deux entreprises est courant dans les
                    immeubles à bureaux, mais cela devient suspect lorsqu&apos;une des entreprises
                    antérieures à cette adresse a été fermée. Ce signal est particulièrement
                    révélateur dans le cas des adresses résidentielles ou de petits bureaux.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-amber-900 mb-1">Nom similaire dans la même ville</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Par exemple, &laquo; Construction ABC Inc. &raquo; qui ferme et &laquo; Rénovations ABC
                    Inc. &raquo; qui ouvre peu après dans la même ville. Les variations courantes incluent
                    le remplacement d&apos;un mot, l&apos;ajout ou la suppression d&apos;un terme géographique,
                    ou un changement mineur dans la formulation juridique.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Compagnie très récente avec dirigeant ayant des antécédents</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Lorsqu&apos;une entreprise est créée peu après la fermeture d&apos;une autre et que
                    ses dirigeants ont des antécédents — licences suspendues, plaintes à l&apos;OPC,
                    décisions disciplinaires — le risque de reconnexion phénix est élevé. Dans
                    certains cas, des prête-noms sont utilisés pour masquer la véritable
                    appartenance de l&apos;entreprise.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comment Batiscore détecte les sociétés phénix</h2>
              <p>
                Batiscore utilise une <strong>analyse de réseau</strong> qui croise automatiquement
                les données de milliers d&apos;entreprises de construction au Québec. Chaque connexion
                détectée entre une entreprise active et une entreprise fermée se voit attribuer un
                nombre de points selon sa force prédictive :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Même numéro de téléphone :</strong> 20 points — le signal le plus fort,
                  car un numéro de téléphone unique est rarement partagé entre entreprises
                  indépendantes.
                </li>
                <li>
                  <strong>Proximité temporelle :</strong> 25 points — la création d&apos;une nouvelle
                  entreprise dans les semaines ou mois qui suivent la fermeture de l&apos;ancienne
                  est un indicateur clé de reconnexion.
                </li>
                <li>
                  <strong>Nom similaire :</strong> 8 points — la similarité lexicale entre les noms
                  commerciaux, combinée à la proximité géographique, indique une possible filiation.
                </li>
                <li>
                  <strong>Même adresse :</strong> 5 points — utile en combinaison avec d&apos;autres
                  signaux, mais moins discriminant seul en raison des immeubles à bureaux partagés.
                </li>
              </ul>
              <p>
                La somme des points donne un <strong>score phénix</strong> qui dépasse un seuil
                prédéfini lorsque les connexions sont suffisamment nombreuses et fortes pour
                justifier un signalement. Ce score est visible sur la page de chaque entreprise
                inspectée sur Batiscore, permettant aux consommateurs de prendre une décision
                éclairée avant de signer un contrat.
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez gratuitement une entreprise
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Notre outil détecte automatiquement les connexions entre entreprises actives et
                fermées : même téléphone, même adresse, nom similaire ou dirigeants en commun.
                En 30 secondes, savez si l&apos;entrepreneur qui vous soumet une soumission est
                véritablement nouveau ou s&apos;il s&apos;agit d&apos;une société phénix.
              </p>
              <Link
                href="/recherche"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Vérifier un entrepreneur &rarr;
              </Link>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Que faire si vous suspectez une société phénix</h2>
              <p>
                Si vous repérez des signaux d&apos;alerte lors de votre vérification d&apos;un
                entrepreneur, voici les mesures à prendre :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>Ne signez pas le contrat :</strong> La prudence est de mise. Un entrepreneur
                  qui cache l&apos;existence d&apos;une entreprise antérieure ne mérite pas votre
                  confiance. Prenez le temps de vérifier avant de vous engager.
                </li>
                <li>
                  <strong>Vérifiez sur Batiscore :</strong>{' '}
                  <Link href="/recherche" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Utilisez notre outil de vérification
                  </Link>{' '}
                  pour consulter le score phénix de l&apos;entreprise et les connexions détectées
                  avec des entreprises fermées. Le rapport inclut le détail de chaque signal
                  (téléphone, adresse, nom, dirigeants).
                </li>
                <li>
                  <strong>Déposez une plainte auprès de l&apos;OPC :</strong> L&apos;Office de la
                  protection du consommateur recueille les plaintes contre les entreprises qui
                  pratiquent des tactiques déloyales, y compris les sociétés phénix. Votre plainte
                  peut contribuer à des enquêtes et à des sanctions.
                </li>
                <li>
                  <strong>Signalez à la RBQ :</strong> Si l&apos;entrepreneur utilise sa nouvelle
                  licence pour contourner une sanction antérieure, la Régie du bâtiment du Québec
                  doit en être informée. Vous pouvez déposer un signalement en ligne ou par
                  téléphone.{' '}
                  <Link href="/guides/reclamation-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Consultez notre guide sur les plaintes à la RBQ &rarr;
                  </Link>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Est-ce qu&apos;un entrepreneur peut légalement fermer sa compagnie et en ouvrir une autre ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Oui, c&apos;est légal. Un entrepreneur a le droit de fermer une entreprise et d&apos;en
                    créer une nouvelle. Cependant, les connexions entre les deux entités sont
                    révélatrices : même téléphone, même adresse, même dirigeant ou nom similaire
                    constituent des signaux qu&apos;il s&apos;agit d&apos;une société phénix, c&apos;est-à-dire
                    une entreprise relance créée pour contourner les dettes ou la réputation de
                    l&apos;ancienne.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">La RBQ vérifie-t-elle ces connexions ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Partiellement. La RBQ vérifie certains antécédents lors de la délivrance d&apos;une
                    nouvelle licence, mais des changements de dirigeants nominaux ou l&apos;utilisation de
                    prête-noms peuvent contourner ces contrôles. C&apos;est pourquoi des outils comme
                    Batiscore, qui croisent automatiquement les données entre toutes les entreprises du
                    secteur, sont essentiels pour détecter les sociétés phénix.{' '}
                    <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                      En savoir plus sur la vérification de licence RBQ &rarr;
                    </Link>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Comment Batiscore détecte-t-il les sociétés phénix ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Batiscore croise automatiquement les numéros de téléphone, les adresses, les noms
                    d&apos;entreprise et les dates de création entre toutes les entreprises du secteur de
                    la construction au Québec. Lorsqu&apos;une nouvelle entreprise partage des connexions
                    significatives avec une entreprise fermée — même téléphone (20 pts), même adresse
                    (5 pts), nom similaire (8 pts) ou proximité temporelle (25 pts) — un score phénix
                    est calculé pour évaluer la probabilité qu&apos;il s&apos;agisse d&apos;une relance.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Comment vérifier une licence RBQ — Guide complet
                  </Link>
                </li>
                <li>
                  <Link href="/guides/reclamation-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Réclamation à la RBQ — Étapes et recours
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