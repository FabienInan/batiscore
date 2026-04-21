import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Réclamation RBQ et recours en rénovation — Guide complet',
  description:
    'Guide complet sur les recours en cas de problème avec un entrepreneur en rénovation : garanties légales, cautionnement RBQ, plainte à la RBQ, différence avec la plainte OPC et recours devant les tribunaux.',
  keywords: [
    'réclamation RBQ',
    'plainte RBQ entrepreneur',
    'recours entrepreneur rénovation',
    'malfaçons réclamation',
    'travaux inachevés RBQ',
    'garantie légale rénovation Québec',
    'cautionnement RBQ rénovation',
    'défectuosités travaux rénovation',
    'recours consommateur construction',
    'garanties légales LPC',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/reclamation-rbq' },
  openGraph: {
    title: 'Réclamation RBQ et recours en rénovation — Guide complet',
    description:
      'Apprenez quels recours sont disponibles en cas de problème avec un entrepreneur en rénovation : garanties légales, cautionnement RBQ, plainte et recours devant les tribunaux.',
    locale: 'fr_CA',
    type: 'article',
  },
  robots: { index: true },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Réclamation RBQ et recours en rénovation — Guide complet',
    description:
      'Guide complet sur les recours en cas de problème avec un entrepreneur en rénovation : garanties légales, cautionnement RBQ, plainte à la RBQ et recours devant les tribunaux.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/guides/reclamation-rbq',
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
        name: 'Quelle est la différence entre une réclamation à la RBQ et une plainte à l\'OPC ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "La plainte à la RBQ concerne les manquements liés à la licence de l'entrepreneur (travail sans licence, non-respect des conditions, problèmes de cautionnement). La plainte à l'OPC (Office de la protection du consommateur) concerne les pratiques commerciales déloyales, la fraude ou le non-respect de la Loi sur la protection du consommateur. Les deux démarches sont complémentaires et peuvent être entreprises simultanément.",
        },
      },
      {
        '@type': 'Question',
        name: 'Combien de temps ai-je pour déposer une réclamation ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Le délai de prescription général pour intenter une poursuite en justice est de trois ans à compter du moment où vous découvrez le problème. Pour les garanties légales de la Loi sur la protection du consommateur, les délais varient selon la nature du défaut. Il est recommandé d'agir le plus rapidement possible et de conserver toutes les preuves documentaires.",
        },
      },
      {
        '@type': 'Question',
        name: 'Est-ce que le Plan de garantie s\'applique aux travaux de rénovation ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Non. Le Plan de garantie des bâtiments résidentiels neufs, administré par Garantie de construction résidentielle (GCR), s'applique uniquement aux bâtiments résidentiels neufs. Pour les travaux de rénovation, vous êtes protégé par les garanties légales prévues par la Loi sur la protection du consommateur et le Code civil du Québec, ainsi que par le cautionnement exigé par la RBQ pour les contrats de rénovation.",
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
        name: 'Réclamation RBQ',
        item: 'https://batiscore.ca/guides/reclamation-rbq',
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

export default function ReclamationRbqPage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Réclamation RBQ"
          titleHighlight="et recours en rénovation"
          subtitle="Travaux inachevés, malfaçons, non-conformité — comprenez vos recours légaux et apprenez à déposer une plainte à la RBQ contre un entrepreneur en rénovation."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quels recours en cas de problème avec un entrepreneur ?</h2>
              <p>
                Contrairement à la construction neuve — qui est couverte par le{' '}
                <strong>Plan de garantie des bâtiments résidentiels neufs</strong> administré par
                Garantie de construction résidentielle (GCR) — les travaux de rénovation ne sont
                pas couverts par un plan de garantie spécifique. Cependant, vous disposez de
                plusieurs recours légaux pour vous protéger.
              </p>
              <p>
                Les trois principaux mécanismes de protection pour les consommateurs qui font
                appel à un entrepreneur en rénovation sont : les <strong>garanties légales</strong>{' '}
                (Loi sur la protection du consommateur et Code civil du Québec), le{' '}
                <strong>cautionnement</strong> exigé par la RBQ, et les <strong>recours auprès
                de la RBQ et des tribunaux</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Les garanties légales</h2>
              <p>
                Même sans plan de garantie spécifique, la loi vous protège lorsque vous confiez
                des travaux de rénovation à un entrepreneur. Deux lois principales s&apos;appliquent :
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 not-prose">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Loi sur la protection du consommateur (LPC)</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  La LPC prévoit des garanties légales qui s&apos;appliquent à tout contrat de
                  rénovation. Le bien et les services fournis doivent être d&apos;une qualité
                  acceptable et correspondre à ce qui a été convenu. L&apos;entrepreneur doit
                  respecter les délais raisonnables et les prix convenus. Si l&apos;entrepreneur
                  ne respecte pas ses obligations, vous pouvez demander la résiliation du contrat,
                  la réduction du prix ou des dommages-intérêts.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 not-prose">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Code civil du Québec (garantie de qualité)</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Le Code civil du Québec prévoit une garantie de qualité contre les vices cachés
                  (art. 1726 et suivants). Si l&apos;entrepreneur a réalisé des travaux comportant
                  un vice qui le rend impropre à son usage ou qui diminue son utilité de façon
                  importante, vous pouvez demander la résiliation du contrat ou une réduction du
                  prix. Le délai pour agir est de trois ans à compter de la découverte du vice.
                </p>
              </div>

              <p>
                Ces garanties légales s&apos;appliquent que l&apos;entrepreneur détienne ou non
                une licence RBQ. Toutefois, disposer d&apos;un entrepreneur licencié facilite
                grandement les recours, car la RBQ peut intervenir et le cautionnement offre
                une protection financière.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Le cautionnement de la RBQ</h2>
              <p>
                La RBQ exige que les entrepreneurs détiennent un <strong>cautionnement</strong>{' '}
                (une garantie financière) qui protège les consommateurs en cas de problèmes. Ce
                cautionnement vise à garantir :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>L&apos;exécution des travaux :</strong> Si l&apos;entrepreneur abandonne le
                  chantier ou ne complète pas les travaux, le cautionnement peut servir à
                  payer un autre entrepreneur pour finir le travail.
                </li>
                <li>
                  <strong>La qualité des travaux :</strong> Le cautionnement peut couvrir les
                  coûts de correction de malfaçons ou de défauts de construction.
                </li>
                <li>
                  <strong>Le remboursement des acomptes :</strong> Si l&apos;entrepreneur ne débute
                  pas les travaux après avoir reçu un acompte, le cautionnement peut servir
                  à vous rembourser.
                </li>
              </ul>
              <p>
                Le montant du cautionnement varie selon les sous-catégories de licence détenues
                par l&apos;entrepreneur. Il est important de vérifier que l&apos;entrepreneur détient
                bien le cautionnement requis — un entrepreneur non licencié n&apos;offre aucune
                de ces protections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quand faire une plainte à la RBQ</h2>
              <p>
                Vous pouvez déposer une plainte auprès de la RBQ dans les situations suivantes :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Travaux non complétés :</strong> L&apos;entrepreneur a abandonné le
                  chantier ou n&apos;a pas terminé les travaux convenus dans les délais
                  raisonnables.
                </li>
                <li>
                  <strong>Défauts et malfaçons :</strong> Les travaux réalisés présentent des
                  défauts de construction ou des vices de qualité qui l&apos;entrepreneur refuse
                  de corriger.
                </li>
                <li>
                  <strong>Non-conformité au contrat :</strong> Les travaux ne correspondent pas
                  aux spécifications du contrat ou ne respectent pas le Code de construction
                  du Québec.
                </li>
                <li>
                  <strong>Problèmes de cautionnement :</strong> L&apos;entrepreneur ne respecte
                  pas ses obligations de cautionnement ou la garantie financière est
                  insuffisante.
                </li>
              </ul>
              <p>
                Il est important d&apos;agir rapidement. Le délai de prescription pour les
                recours civils est généralement de <strong>trois ans</strong> à compter de la
                découverte du problème. Conservez toujours une trace écrite de vos échanges
                avec l&apos;entrepreneur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comment déposer une plainte à la RBQ</h2>
              <p>
                Le processus de plainte suit un parcours structuré. Voici les étapes
                à respecter :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>Avisez l&apos;entrepreneur par écrit :</strong> Envoyez une mise en
                  demeure formelle à l&apos;entrepreneur, idéalement par courrier recommandé,
                  en décrivant précisément les problèmes constatés et en demandant la correction
                  des travaux dans un délai raisonnable.
                </li>
                <li>
                  <strong>Accordez un délai raisonnable :</strong> Donnez à l&apos;entrepreneur
                  le temps nécessaire pour corriger les problèmes. Le délai varie selon la
                  nature des travaux, mais il doit être suffisant et raisonnable (généralement
                  entre 10 et 30 jours).
                </li>
                <li>
                  <strong>Déposez la plainte à la RBQ :</strong> Si l&apos;entrepreneur ne
                  corrige pas les problèmes dans le délai accordé, vous pouvez déposer une
                  plainte auprès de la RBQ. La demande se fait en ligne via le portail de
                  la Régie du bâtiment ou par formulaire papier.
                </li>
                <li>
                  <strong>Fournissez toute la documentation :</strong> Joignez à votre
                  plainte l&apos;ensemble des preuves : contrat signé, devis, factures,
                  photos des défauts, correspondance avec l&apos;entrepreneur, rapports
                  d&apos;experts si disponibles. Plus votre dossier est complet, plus il
                  sera traité efficacement.
                </li>
              </ol>
              <p>
                Il est fortement recommandé de faire appel à un expert en bâtiment pour évaluer
                les défauts et produire un rapport écrit. Ce rapport constitue une preuve
                précieuse qui renforce votre dossier.
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez votre entrepreneur avant de signer
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Notre outil croise automatiquement les données RBQ, REQ, OPC et CanLII pour
                détecter les entrepreneurs à risque : licence suspendue, plaintes déposées,
                liens avec des sociétés phénix et décisions disciplinaires.
              </p>
              <Link
                href="/recherche"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Vérifier un entrepreneur &rarr;
              </Link>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Le Plan de garantie (constructions neuves uniquement)</h2>
              <p>
                Il est important de distinguer les travaux de rénovation de la construction neuve.
                Le <strong>Plan de garantie des bâtiments résidentiels neufs</strong>, administré
                par Garantie de construction résidentielle (GCR), s&apos;applique{' '}
                <strong>uniquement aux bâtiments résidentiels neufs</strong> : maisons individuelles,
                copropriétés et immeubles multifamiliaux neufs.
              </p>
              <p>
                Le Plan de garantie couvre cinq volets pour les constructions neuves :
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Parachèvement des travaux :</strong> les travaux inachevés à la
                  réception du bâtiment.
                </li>
                <li>
                  <strong>Vices et malfaçons apparents :</strong> les défauts visibles lors
                  de l&apos;inspection pré-réception.
                </li>
                <li>
                  <strong>Malfaçons non apparentes :</strong> couvertes pendant 1 an à compter
                  de la réception du bâtiment.
                </li>
                <li>
                  <strong>Vices cachés :</strong> couverts pendant 3 ans à compter de la
                  réception du bâtiment.
                </li>
                <li>
                  <strong>Vices de conception, construction ou réalisation et vices de sol :</strong>{' '}
                  couverts pendant 5 ans à compter de la fin des travaux.
                </li>
              </ul>
              <p>
                Pour les travaux de rénovation, ce plan ne s&apos;applique pas. Vos recours se
                limitent aux garanties légales, au cautionnement et aux démarches décrites
                ci-dessus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Différence entre plainte RBQ et plainte OPC</h2>
              <p>
                Il est fréquent de confondre la plainte à la RBQ et la plainte à l&apos;OPC
                (Office de la protection du consommateur). Bien que les deux organismes
                interviennent dans les litiges entre consommateurs et entrepreneurs, leurs
                mandats sont distincts :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 not-prose">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Plainte RBQ</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Concerne les manquements liés à la licence : travail sans licence,
                    non-respect des conditions de licence, problèmes de cautionnement,
                    infractions au Code de construction. La RBQ peut imposer des amendes,
                    suspendre ou révoquer la licence.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Plainte OPC</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Concerne les pratiques commerciales déloyales : fraude, fausses
                    représentations, contrats abusifs, non-respect de la Loi sur la
                    protection du consommateur. L&apos;OPC peut faire de la médiation, enquêter
                    et intenter des poursuites pénales.{' '}
                    <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                      En savoir plus &rarr;
                    </Link>
                  </p>
                </div>
              </div>
              <p>
                Les deux démarches sont <strong>complémentaires</strong> et peuvent être
                entreprises simultanément. Par exemple, si un entrepreneur a fait des
                fausses représentations pour obtenir le contrat (plainte OPC) et a
                ensuite réalisé des travaux défectueux (plainte RBQ), vous avez
                intérêt à agir sur les deux fronts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Quelle est la différence entre une plainte à la RBQ et une plainte à l&apos;OPC ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    La plainte à la RBQ porte sur les manquements liés à la licence de
                    l&apos;entrepreneur (travail sans licence, non-respect des conditions,
                    problèmes de cautionnement). La plainte à l&apos;OPC concerne les pratiques
                    commerciales déloyales, la fraude ou le non-respect de la Loi sur la
                    protection du consommateur. Les deux démarches sont complémentaires et
                    peuvent être entreprises simultanément.{' '}
                    <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                      Consultez notre guide sur la plainte OPC &rarr;
                    </Link>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Combien de temps ai-je pour déposer une plainte ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Le délai de prescription général pour intenter une poursuite en justice est
                    de <strong>trois ans</strong> à compter de la découverte du problème. Les
                    garanties légales de la Loi sur la protection du consommateur n&apos;ont pas
                    de délai fixe, mais il est recommandé d&apos;agir le plus rapidement possible.
                    Conservez toutes les preuves documentaires et ne tardez pas à envoyer votre
                    mise en demeure.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Est-ce que le Plan de garantie s&apos;applique aux travaux de rénovation ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Non. Le Plan de garantie des bâtiments résidentiels neufs, administré par
                    Garantie de construction résidentielle (GCR), s&apos;applique uniquement aux
                    bâtiments résidentiels neufs. Pour les travaux de rénovation, vous êtes
                    protégé par les <strong>garanties légales</strong> (Loi sur la protection du
                    consommateur et Code civil du Québec), le <strong>cautionnement</strong>{' '}
                    exigé par la RBQ, et les <strong>recours devant les tribunaux</strong>{' '}
                    (petite créance jusqu&apos;à 15 000 $).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Plainte OPC contre un entrepreneur : guide complet
                  </Link>
                </li>
                <li>
                  <Link href="/guides/societe-phenix" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Société phénix : comment repérer un entrepreneur qui réouvre sous un nouveau nom
                  </Link>
                </li>
                <li>
                  <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Comment vérifier une licence RBQ
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