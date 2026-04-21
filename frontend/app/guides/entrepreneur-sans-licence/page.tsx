import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Travailler avec un entrepreneur sans licence RBQ — Risques et recours',
  description:
    "Risques et recours lorsqu'on engage un entrepreneur sans licence RBQ au Québec : absence de garantie, pas de couverture d'assurance, amendes, et comment déposer une plainte auprès de l'OPC et de la RBQ.",
  keywords: [
    'entrepreneur sans licence RBQ',
    'travailler sans licence RBQ',
    'amende entrepreneur sans licence',
    'risques entrepreneur non licencié',
    'plainte entrepreneur sans licence',
    'garantie plan rénovation',
    'permis propriétaire-constructeur',
    'vérifier licence RBQ',
    'recours entrepreneur sans licence',
    'construction sans permis Québec',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/entrepreneur-sans-licence' },
  openGraph: {
    title: 'Travailler avec un entrepreneur sans licence RBQ — Risques et recours',
    description:
      "Découvrez les risques liés à l'embauche d'un entrepreneur sans licence RBQ au Québec et les recours possibles : plainte à l'OPC, vérification en ligne, petites créances.",
    locale: 'fr_CA',
    type: 'article',
  },
  robots: { index: true },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Travailler avec un entrepreneur sans licence RBQ — Risques et recours',
    description:
      "Risques et recours lorsqu'on engage un entrepreneur sans licence RBQ au Québec : absence de garantie, pas de couverture d'assurance, amendes, et comment déposer une plainte.",
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/guides/entrepreneur-sans-licence',
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
        name: 'Est-ce que je peux engager un entrepreneur sans licence pour des petits travaux ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui, pour des travaux dont la valeur totale est inférieure à 20 000 $. En dessous de ce seuil, la licence RBQ n'est pas obligatoire. Cependant, il est toujours recommandé de vérifier les références de l'entrepreneur, de signer un contrat détaillé et de vérifier s'il détient une assurance responsabilité civile.",
        },
      },
      {
        '@type': 'Question',
        name: 'Quelles sont les amendes pour travailler sans licence RBQ ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Les amendes pour exercer sans licence RBQ vont de 3 000 $ à 30 000 $, selon la nature de l'infraction et le nombre de récidives. Dans les cas les plus graves, des accusations criminelles peuvent être portées et l'entrepreneur peut se voir interdire d'obtenir une licence pour une période allant jusqu'à cinq ans.",
        },
      },
      {
        '@type': 'Question',
        name: 'Que faire si mon entrepreneur n&apos;a pas de licence ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Arrêtez immédiatement les travaux, documentez tout (contrats, factures, photos, communications), vérifiez le statut de l'entrepreneur sur Batiscore ou le registre de la RBQ, puis déposez une plainte auprès de l'Office de la protection du consommateur (OPC) et de la RBQ. Si les négociations échouent, vous pouvez recourir à la Division des petites créances.",
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
        name: 'Entrepreneur sans licence',
        item: 'https://batiscore.ca/guides/entrepreneur-sans-licence',
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

export default function EntrepreneurSansLicencePage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Travailler avec un entrepreneur"
          titleHighlight="sans licence RBQ"
          subtitle="Risques juridiques, absence de garantie et recours possibles — tout ce que vous devez savoir avant de confier vos travaux à un entrepreneur non licencié au Québec."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none">

            <h2>Le cadre légal</h2>
            <p>
              Au Québec, la <strong>Loi sur le bâtiment</strong> impose à tout entrepreneur qui
              effectue des travaux de construction dont la valeur totale dépasse <strong>20 000 $</strong> de
              détenir une licence délivrée par la Régie du bâtiment du Québec (RBQ). Cette exigence
              s&apos;applique à la construction neuve, à la rénovation majeure, à l&apos;installation de
              systèmes mécaniques et électriques, ainsi qu&apos;à certains travaux de réparation et
              d&apos;entretien.
            </p>
            <p>
              En dessous du seuil de 20 000 $, la licence RBQ n&apos;est pas obligatoire. Cela signifie
              qu&apos;un artisan ou un petit entrepreneur peut légalement réaliser des travaux mineurs —
              peinture, pose de revêtements, petites réparations — sans détenir de licence. Toutefois,
              le consommateur reste protégé par la <strong>Loi sur la protection du consommateur</strong>,
              qui s&apos;applique indépendamment du seuil de la RBQ.
            </p>
            <p>
              Il existe également le <strong>permis de propriétaire-constructeur</strong>, qui permet à
              un particulier de construire ou de rénover sa propre résidence sans licence
              d&apos;entrepreneur. Ce permis est strictement personnel : il ne peut pas être utilisé pour
              construire ou rénover un immeuble destiné à la vente ou à la location. Le propriétaire qui
              l&apos;obtient assume tous les risques liés aux travaux et ne bénéficie pas de la garantie
              plan rénovation.
            </p>

            <h2>Les risques pour le propriétaire</h2>
            <p>
              Engager un entrepreneur sans licence RBQ comporte des risques importants pour le
              propriétaire :
            </p>
            <ul>
              <li>
                <strong>Aucune garantie plan rénovation :</strong> La Garantie de plan rénovation,
                administrée par Garantie de construction Résidentielle (GCR), ne couvre que les travaux
                réalisés par un entrepreneur licencié. Sans licence, vous n&apos;avez aucune protection
                contre les vices de construction, les retards ou l&apos;abandon de chantier.
              </li>
              <li>
                <strong>Aucune couverture d&apos;assurance :</strong> L&apos;assurance responsabilité civile
                de l&apos;entrepreneur est une condition d&apos;obtention de la licence RBQ. Un entrepreneur
                non licencié n&apos;a pas cette obligation — si un accident ou des dommages surviennent
                sur votre chantier, votre propre assurance habitation pourrait refuser de couvrir les
                sinistres liés aux travaux.
              </li>
              <li>
                <strong>Aucun recours via la RBQ :</strong> La RBQ ne peut pas intervenir dans un litige
                opposant un consommateur à un entrepreneur non licencié, puisqu&apos;elle n&apos;a aucune
                juridiction sur ce dernier. Vos seuls recours se trouvent auprès de l&apos;Office de la
                protection du consommateur (OPC) et des tribunaux.
              </li>
              <li>
                <strong>Arrêt de travail municipal :</strong> Les municipalités peuvent émettre un arrêt
                de travail si elles constatent que des travaux sont réalisés par un entrepreneur sans
                licence. Les travaux sont alors suspendus jusqu&apos;à ce qu&apos;un entrepreneur licencié
                reprenne le chantier, ce qui entraîne des délais et des coûts supplémentaires.
              </li>
            </ul>

            <h2>Les pénalités pour l&apos;entrepreneur</h2>
            <p>
              Travailler sans licence RBQ est une infraction à la Loi sur le bâtiment. Les pénalités
              sont sévères :
            </p>
            <ul>
              <li>
                <strong>Amendes de 3 000 $ à 30 000 $ :</strong> Le montant varie selon la nature de
                l&apos;infraction, le nombre de récidives et les circonstances atténuantes. Une première
                infraction entraîne généralement une amende minimale de 3 000 $, tandis que les
                récidives peuvent conduire à des amendes beaucoup plus élevées.
              </li>
              <li>
                <strong>Accusations criminelles possibles :</strong> Dans les cas les plus graves —
                fraude, mise en danger du public, travail répété sans licence — des accusations
                criminelles peuvent être portées en plus des amendes administratives.
              </li>
              <li>
                <strong>Suspension ou révocation de licence :</strong> Un entrepreneur qui obtient
                ultérieurement une licence peut se la faire suspendre ou révoquer s&apos;il est reconnu
                coupable d&apos;avoir exercé sans licence par le passé. La RBQ peut également refuser
                de délivrer une licence pour une période allant jusqu&apos;à cinq ans.
              </li>
            </ul>

            <h2>Que faire si vous avez engagé un entrepreneur sans licence</h2>
            <p>
              Si vous découvrez que l&apos;entrepreneur que vous avez embauché ne détient pas de licence
              RBQ, voici les étapes à suivre :
            </p>
            <ol>
              <li>
                <strong>Arrêtez les travaux :</strong> Suspendez immédiatement tout travail en cours.
                Continuer avec un entrepreneur non licencié augmente vos risques et peut compromettre
                vos recours futurs.
              </li>
              <li>
                <strong>Documentez tout :</strong> Rassemblez le contrat signé, les factures, les
                soumissions, les échanges de courriels et de textos, les photos du chantier et tout
                autre élément prouvant l&apos;entente et l&apos;état des travaux.
              </li>
              <li>
                <strong>Déposez une plainte auprès de l&apos;OPC :</strong> L&apos;Office de la protection du
                consommateur peut vous accompagner dans vos démarches et intervenir auprès de
                l&apos;entrepreneur.{' '}
                <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Consultez notre guide pour déposer une plainte à l&apos;OPC &rarr;
                </Link>
              </li>
              <li>
                <strong>Signalez à la RBQ :</strong> Même si la RBQ ne peut pas résoudre votre litige,
                elle peut enquêter sur l&apos;entrepreneur et imposer des amendes. Votre signalement
                contribue à protéger d&apos;autres consommateurs.
              </li>
              <li>
                <strong>Envisagez les petites créances :</strong> Si les négociations échouent, vous
                pouvez déposer une demande à la Division des petites créances du Tribunal du Québec
                pour les réclamations allant jusqu&apos;à 15 000 $.
              </li>
            </ol>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 my-8 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez un entrepreneur avant de signer
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Notre outil croise automatiquement RBQ, REQ, OPC et CanLII pour vous donner un
                portrait complet de l&apos;entrepreneur : statut de la licence, plaintes déposées,
                connexions avec des entreprises fermées et décisions disciplinaires.
              </p>
              <Link
                href="/recherche"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Vérifier un entrepreneur &rarr;
              </Link>
            </div>

            <h2>Comment vérifier avant d&apos;engager</h2>
            <p>
              La vérification d&apos;un entrepreneur avant de signer un contrat est l&apos;étape la plus
              importante pour éviter les problèmes. Voici les vérifications essentielles :
            </p>
            <ol>
              <li>
                <strong>Vérifiez la licence RBQ :</strong> Utilisez le registre en ligne de la RBQ
                (rbq.gouv.qc.ca) ou notre outil gratuit pour confirmer que la licence est valide, active
                et correspond aux travaux envisagés.{' '}
                <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Guide complet pour vérifier une licence RBQ &rarr;
                </Link>
              </li>
              <li>
                <strong>Vérifiez le statut au REQ :</strong> Le Registraire des entreprises du Québec
                (REQ) permet de confirmer que l&apos;entreprise est bien enregistrée, active et que le nom
                légal correspond à celui figurant sur le contrat.
              </li>
              <li>
                <strong>Recherchez les connexions avec des entreprises fermées :</strong> Certains
                entrepreneurs dont la licence a été révoquée ouvrent une nouvelle entreprise sous un
                autre nom pour contourner la sanction — un phénomène connu sous le nom de
                <em> société phénix</em>. Vérifiez si l&apos;entreprise partage la même adresse, le même
                téléphone ou les mêmes dirigeants qu&apos;une entreprise fermée.
              </li>
            </ol>

            <h2>Questions fréquentes</h2>

            <h3>Est-ce que je peux engager un entrepreneur sans licence pour des petits travaux ?</h3>
            <p>
              Oui, pour des travaux dont la valeur totale est inférieure à <strong>20 000 $</strong>,
              la licence RBQ n&apos;est pas obligatoire. Cependant, il est toujours recommandé de vérifier
              les références de l&apos;entrepreneur, de signer un contrat détaillé et de vous assurer
              qu&apos;il détient une assurance responsabilité civile. Même sans licence, l&apos;entrepreneur
              reste soumis à la Loi sur la protection du consommateur.
            </p>

            <h3>Quelles sont les amendes pour travailler sans licence RBQ ?</h3>
            <p>
              Les amendes pour exercer sans licence RBQ varient de <strong>3 000 $ à 30 000 $</strong>,
              selon la nature de l&apos;infraction et le nombre de récidives. Dans les cas les plus graves,
              des accusations criminelles peuvent être portées et l&apos;entrepreneur peut se voir
              interdire d&apos;obtenir une licence pour une période allant jusqu&apos;à cinq ans.
            </p>

            <h3>Que faire si mon entrepreneur n&apos;a pas de licence ?</h3>
            <p>
              Arrêtez immédiatement les travaux, documentez tout (contrats, factures, photos,
              communications), vérifiez le statut de l&apos;entrepreneur sur{' '}
              <Link href="/recherche" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                Batiscore
              </Link>{' '}
              ou le registre de la RBQ, puis déposez une plainte auprès de l&apos;Office de la protection
              du consommateur (OPC) et de la RBQ. Si les négociations échouent, vous pouvez recourir
              à la Division des petites créances.
            </p>

            <h2>Pour aller plus loin</h2>
            <ul>
              <li>
                <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Comment vérifier une licence RBQ — Guide complet
                </Link>
              </li>
              <li>
                <Link href="/guides/plainte-opc-entrepreneur" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Déposer une plainte à l&apos;OPC contre un entrepreneur
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