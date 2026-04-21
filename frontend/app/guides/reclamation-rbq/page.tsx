import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Réclamation RBQ — Garantie plan rénovation et recours',
  description:
    'Guide complet sur la réclamation RBQ et la garantie plan rénovation : quand et comment déposer une réclamation, délais, types de réclamations et différence avec une plainte OPC.',
  keywords: [
    'réclamation RBQ',
    'garantie plan rénovation',
    'déposer réclamation RBQ',
    'plainte RBQ',
    'recours entrepreneur RBQ',
    'malfaçons réclamation',
    'travaux inachevés RBQ',
    'garantie rénovation Québec',
    'défectuosités travaux rénovation',
    'réclamation garantie construction',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/reclamation-rbq' },
  openGraph: {
    title: 'Réclamation RBQ — Garantie plan rénovation et recours',
    description:
      'Apprenez quand et comment déposer une réclamation à la RBQ dans le cadre de la garantie plan rénovation : délais, étapes et recours disponibles.',
    locale: 'fr_CA',
    type: 'article',
  },
  robots: { index: true },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Réclamation RBQ — Garantie plan rénovation et recours',
    description:
      'Guide complet sur la réclamation RBQ et la garantie plan rénovation : quand et comment déposer une réclamation, délais, types de réclamations et différence avec une plainte OPC.',
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
        name: 'Quelle est la différence entre une réclamation RBQ et une plainte OPC ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "La réclamation à la RBQ concerne la qualité des travaux et les recours liés à la garantie plan rénovation (malfaçons, travaux inachevés, non-conformité). La plainte à l'OPC (Office de la protection du consommateur) concerne les pratiques commerciales déloyales, la fraude ou le non-respect de la Loi sur la protection du consommateur. Les deux démarches sont complémentaires et peuvent être entreprises simultanément.",
        },
      },
      {
        '@type': 'Question',
        name: 'Combien de temps ai-je pour déposer une réclamation ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Vous disposez d'un délai d'un an à compter de la réception des travaux pour déposer une réclamation pour des défauts apparents. Pour les défauts cachés, le délai est de trois ans à compter de la découverte du défaut. Il est recommandé d'agir le plus rapidement possible et de conserver toutes les preuves documentaires.",
        },
      },
      {
        '@type': 'Question',
        name: 'Est-ce que la garantie plan rénovation s\'applique aux contrats signés avant 2021 ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Non. La garantie plan rénovation s'applique uniquement aux contrats de rénovation signés après le 1er janvier 2021. Pour les contrats antérieurs, d'autres recours existent : la petite créance devant le tribunal, la garantie GCR (Garantie de construction résidentielle) pour les constructions neuves, ou une plainte à l'OPC pour les pratiques commerciales déloyales.",
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
          titleHighlight="et garantie plan rénovation"
          subtitle="Travaux inachevés, malfaçons, non-conformité — comprenez vos recours sous la garantie plan rénovation et apprenez à déposer une réclamation à la RBQ."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none">

            <h2>Qu&apos;est-ce que la garantie plan rénovation ?</h2>
            <p>
              La garantie plan rénovation est une <strong>garantie obligatoire</strong> mise en
              place par la Régie du bâtiment du Québec (RBQ) pour les contrats de rénovation
              signés après le <strong>1er janvier 2021</strong>. Elle vise à protéger les
              consommateurs lorsque les travaux de rénovation ne sont pas exécutés conformément
              au contrat ou aux normes de construction en vigueur.
            </p>
            <p>
              Cette garantie couvre quatre grands types de problèmes :
            </p>
            <ul>
              <li>
                <strong>Travaux inachevés :</strong> l&apos;entrepreneur n&apos;a pas terminé
                les travaux prévus au contrat.
              </li>
              <li>
                <strong>Défauts et malfaçons :</strong> les travaux réalisés présentent des
                défauts de construction ou des vices de qualité.
              </li>
              <li>
                <strong>Non-conformité :</strong> les travaux ne respectent pas les plans,
                les devis ou le Code de construction du Québec.
              </li>
              <li>
                <strong>Mauvais ouvrage :</strong> la qualité de l&apos;exécution est inférieure
                aux normes acceptables du métier.
              </li>
            </ul>
            <p>
              La garantie s&apos;applique aux contrats de rénovation dont la valeur dépasse
              <strong> 20 000 $</strong> et qui sont conclus avec un entrepreneur titulaire
              d&apos;une licence RBQ en règle. Elle ne s&apos;applique pas aux contrats signés
              avant 2021, ni aux travaux effectués par un entrepreneur non licencié.
            </p>

            <h2>Quand faire une réclamation</h2>
            <p>
              Vous pouvez déposer une réclamation auprès de la RBQ dans les situations suivantes :
            </p>
            <ul>
              <li>
                <strong>Travaux non complétés :</strong> l&apos;entrepreneur a abandonné le
                chantier ou n&apos;a pas terminé les travaux convenus dans les délais
                raisonnables.
              </li>
              <li>
                <strong>Défauts apparents :</strong> vous constatez des défauts visibles dans
                l&apos;année suivant la réception des travaux (fissures, finitions
                défectueuses, installations non fonctionnelles).
              </li>
              <li>
                <strong>Défauts cachés :</strong> vous découvrez des vices cachés dans les
                trois ans suivant la découverte du problème (problèmes structurels,
                infiltration, défauts électriques non visibles).
              </li>
              <li>
                <strong>Non-conformité au contrat ou au Code de construction :</strong> les
                travaux ne correspondent pas aux spécifications du contrat ou ne respectent
                pas les normes du Code de construction du Québec.
              </li>
            </ul>
            <p>
              Il est important d&apos;agir rapidement. Les délais commencent à courir à
              compter de la réception des travaux ou de la découverte du défaut. Conservez
              toujours une trace écrite de vos échanges avec l&apos;entrepreneur.
            </p>

            <h2>Comment déposer une réclamation à la RBQ</h2>
            <p>
              Le processus de réclamation suit un parcours structuré. Voici les étapes
              à respecter :
            </p>
            <ol>
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
                <strong>Déposez la réclamation à la RBQ :</strong> Si l&apos;entrepreneur ne
                corrige pas les problèmes dans le délai accordé, vous pouvez déposer une
                réclamation auprès de la RBQ. La demande se fait en ligne via le portail de
                la Régie du bâtiment ou par formulaire papier.
              </li>
              <li>
                <strong>Fournissez toute la documentation :</strong> Joignez à votre
                réclamation l&apos;ensemble des preuves : contrat signé, devis, factures,
                photos des défauts, correspondance avec l&apos;entrepreneur, rapports
                d&apos;experts si disponibles. Plus votre dossier est complet, plus il
                sera traité efficacement.
              </li>
            </ol>
            <p>
              Il est fortement recommandé de faire appel à un expert en bâtiment pour évaluer
              les défauts et produire un rapport écrit. Ce rapport constitue une preuve
              précieuse qui renforce votre dossier de réclamation.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 my-8 not-prose">
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

            <h2>Types de réclamations</h2>
            <p>
              La RBQ traite plusieurs catégories de réclamations sous la garantie plan
              rénovation. Voici les principales :
            </p>
            <ul>
              <li>
                <strong>Travaux inachevés :</strong> L&apos;entrepreneur n&apos;a pas terminé
                les travaux prévus au contrat. Cela inclut les abandons de chantier et les
                travaux partiellement réalisés. La garantie peut couvrir le coût de
                complétion des travaux par un autre entrepreneur.
              </li>
              <li>
                <strong>Malfaçons :</strong> Les travaux ont été réalisés de façon
                défectueuse : pose incorrecte de matériaux, finitions de mauvaise qualité,
                joints mal étanchéifiés, installations non conformes aux normes du métier.
              </li>
              <li>
                <strong>Non-conformité :</strong> Les travaux ne correspondent pas aux plans
                et devis convenus, ou ne respectent pas le Code de construction du Québec.
                Cela peut inclure l&apos;utilisation de matériaux non spécifiés, des
                dimensions différentes ou des installations non réglementaires.
              </li>
              <li>
                <strong>Abandon de chantier :</strong> L&apos;entrepreneur a cessé les travaux
                sans justification et ne répond plus aux communications. Il s&apos;agit
                d&apos;un cas grave qui justifie une réclamation immédiate.
              </li>
            </ul>

            <h2>Déroulement et délais</h2>
            <p>
              Une fois votre réclamation déposée, la RBQ entreprend un processus structuré :
            </p>
            <ol>
              <li>
                <strong>Assignation d&apos;un inspecteur :</strong> La RBQ assigne un
                inspecteur qui analyse votre dossier et peut se rendre sur les lieux pour
                constater les problèmes. L&apos;inspecteur évalue la nature et l&apos;étendue
                des défauts allégués.
              </li>
              <li>
                <strong>Tentative de médiation :</strong> Avant toute décision, la RBQ
                tente généralement une médiation entre vous et l&apos;entrepreneur. Cette
                étape vise à trouver une entente à l&apos;amiable sans recourir à une
                décision formelle.
              </li>
              <li>
                <strong>Décision :</strong> Si la médiation échoue, la RBQ rend une décision
                en se basant sur les preuves documentaires, le rapport de l&apos;inspecteur
                et les observations des deux parties. La décision peut ordonner la correction
                des travaux, le paiement de dommages ou d&apos;autres mesures correctives.
              </li>
              <li>
                <strong>Appel possible :</strong> Si vous ou l&apos;entrepreneur n&apos;êtes
                pas satisfait de la décision, il est possible de demander une révision ou
                de contester la décision devant les tribunaux. Les délais d&apos;appel sont
                généralement de 30 jours suivant la notification de la décision.
              </li>
            </ol>
            <p>
              Le traitement complet d&apos;une réclamation peut prendre plusieurs mois,
              selon la complexité du dossier et la disponibilité des inspecteurs. Il est
              recommandé de faire un suivi régulier auprès de la RBQ pour connaître
              l&apos;avancement de votre dossier.
            </p>

            <h2>Différence entre réclamation RBQ et plainte OPC</h2>
            <p>
              Il est fréquent de confondre la réclamation à la RBQ et la plainte à l&apos;OPC
              (Office de la protection du consommateur). Bien que les deux organismes
              interviennent dans les litiges entre consommateurs et entrepreneurs, leurs
              mandats sont distincts :
            </p>
            <ul>
              <li>
                <strong>Réclamation RBQ :</strong> Concerne la qualité des travaux et les
                recours liés à la garantie plan rénovation. La RBQ évalue si les travaux
                sont conformes aux normes de construction et au contrat. Elle peut ordonner
                la correction des défauts, la complétion des travaux inachevés ou le
                paiement de compensations.
              </li>
              <li>
                <strong>Plainte OPC :</strong> Concerne les pratiques commerciales déloyales
                et la protection du consommateur. L&apos;OPC intervient en cas de fraude,
                de fausses représentations, de contrats abusifs ou de non-respect de la
                Loi sur la protection du consommateur.{' '}
                <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  En savoir plus sur la plainte OPC &rarr;
                </Link>
              </li>
            </ul>
            <p>
              Les deux démarches sont <strong>complémentaires</strong> et peuvent être
              entreprises simultanément. Par exemple, si un entrepreneur a fait des
              fausses représentations pour obtenir le contrat (plainte OPC) et a
              ensuite réalisé des travaux défectueux (réclamation RBQ), vous avez
              intérêt à agir sur les deux fronts.
            </p>

            <h2>Questions fréquentes</h2>

            <h3>Quelle est la différence entre une réclamation RBQ et une plainte OPC ?</h3>
            <p>
              La réclamation à la RBQ porte sur la qualité des travaux et les recours liés
              à la garantie plan rénovation (malfaçons, travaux inachevés, non-conformité).
              La plainte à l&apos;OPC concerne les pratiques commerciales déloyales, la fraude
              ou le non-respect de la Loi sur la protection du consommateur. Les deux
              démarches sont complémentaires et peuvent être entreprises simultanément.{' '}
              <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                Consultez notre guide sur la plainte OPC &rarr;
              </Link>
            </p>

            <h3>Combien de temps ai-je pour déposer une réclamation ?</h3>
            <p>
              Vous disposez d&apos;un délai d&apos;<strong>un an</strong> à compter de la
              réception des travaux pour déposer une réclamation pour des défauts apparents.
              Pour les défauts cachés, le délai est de <strong>trois ans</strong> à compter
              de la découverte du défaut. Il est recommandé d&apos;agir le plus rapidement
              possible et de conserver toutes les preuves documentaires.
            </p>

            <h3>Est-ce que la garantie plan rénovation s&apos;applique aux contrats signés avant 2021 ?</h3>
            <p>
              Non. La garantie plan rénovation s&apos;applique uniquement aux contrats de
              rénovation signés après le 1er janvier 2021. Pour les contrats antérieurs,
              d&apos;autres recours existent : la <strong>petite créance</strong> devant le
              tribunal (pour les réclamations de 15 000 $ ou moins), la <strong>garantie
              GCR</strong> (Garantie de construction résidentielle) pour les constructions
              neuves, ou une <strong>plainte à l&apos;OPC</strong> pour les pratiques
              commerciales déloyales.
            </p>

            <h2>Pour aller plus loin</h2>
            <ul>
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

          </div>
        </article>

        <GuideCta />
      </main>
    </>
  )
}