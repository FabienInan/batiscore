import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Comment vérifier une licence RBQ — Guide complet',
  description:
    'Guide complet pour vérifier une licence RBQ : statuts (valide, suspendue, annulée), licence générale vs spécialisée, vérification en ligne et recours en cas de problème.',
  keywords: [
    'vérifier licence RBQ',
    'licence RBQ valide',
    'statut licence RBQ',
    'licence générale RBQ',
    'licence spécialisée RBQ',
    'vérifier entrepreneur RBQ',
    'licence suspendue RBQ',
    'licence annulée RBQ',
    'registre RBQ en ligne',
    'catégories licence RBQ',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/verifier-licence-rbq' },
  openGraph: {
    title: 'Comment vérifier une licence RBQ — Guide complet',
    description:
      'Apprenez à vérifier une licence RBQ en ligne, comprendre les statuts (valide, suspendue, annulée) et les différences entre licence générale et spécialisée.',
    locale: 'fr_CA',
    type: 'article',
  },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment vérifier une licence RBQ — Guide complet',
    description:
      'Guide complet pour vérifier une licence RBQ : statuts, licence générale vs spécialisée, vérification en ligne et recours en cas de problème.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/guides/verifier-licence-rbq',
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
        name: "Est-ce qu'un entrepreneur peut travailler sans licence RBQ ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Non. Au Québec, tout entrepreneur qui effectue des travaux de construction pour autrui doit détenir une licence RBQ, quelle que soit la valeur des travaux. Travailler sans licence constitue une infraction à la Loi sur le bâtiment et expose l'entrepreneur à des amendes pouvant atteindre plus de 100 000 $. Pour le consommateur, un contrat signé avec un entrepreneur non licencié peut être difficile à faire valoir.",
        },
      },
      {
        '@type': 'Question',
        name: 'Comment savoir si une licence RBQ est encore valide ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Vous pouvez vérifier la validité d'une licence RBQ en consultant le registre en ligne de la Régie du bâtiment du Québec (rbq.gouv.qc.ca) ou en utilisant l'outil gratuit Batiscore, qui croise les données de la RBQ avec celles du REQ, de l'OPC et de CanLII pour un portrait complet de l'entrepreneur.",
        },
      },
      {
        '@type': 'Question',
        name: 'Quelle est la différence entre une licence générale et spécialisée ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "La licence d'entrepreneur général permet de construire, rénover ou modifier des bâtiments de toute nature selon les sous-catégories détenues. La licence d'entrepreneur spécialisé est restreinte à des travaux spécifiques comme la plomberie (sous-catégorie 15.5), l'électricité (sous-catégorie 16) ou la ventilation (sous-catégorie 15.8). Un entrepreneur spécialisé ne peut effectuer que les travaux couverts par sa sous-catégorie.",
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
        name: 'Comment vérifier une licence RBQ',
        item: 'https://batiscore.ca/guides/verifier-licence-rbq',
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

export default function VerifierLicenceRbqPage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Comment vérifier"
          titleHighlight="une licence RBQ"
          subtitle="Licence valide, suspendue ou annulée — apprenez à vérifier le statut d&apos;un entrepreneur et à comprendre les différentes catégories de licence au Québec."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Qu&apos;est-ce qu&apos;une licence RBQ ?</h2>
              <p>
                La licence de la Régie du bâtiment du Québec (RBQ) est un permis obligatoire pour
                tout entrepreneur qui souhaite effectuer des travaux de construction au Québec.
                Délivrée en vertu de la <strong>Loi sur le bâtiment</strong>, elle atteste que
                l&apos;entrepreneur possède les compétences techniques, la solvabilité et
                l&apos;assurance responsabilité requises pour exercer son métier.
              </p>
              <p>
                Tout entrepreneur qui réalise des travaux de construction pour autrui doit détenir
                une licence RBQ, <strong>quelle que soit la valeur des travaux</strong>. Cela inclut
                la construction neuve, la rénovation majeure, l&apos;installation de systèmes
                mécaniques et électriques, ainsi que certains travaux de réparation.
              </p>
              <p>
                Le seuil de <strong>20 000 $</strong> est souvent mentionné, mais il s&apos;agit
                d&apos;une exemption spécifique pour les <strong>constructeurs-propriétaires</strong>{' '}
                qui effectuent des travaux sur leur propre résidence. En dessous de ce seuil, un
                propriétaire n&apos;a pas besoin de licence pour rénover sa propre maison — mais
                un entrepreneur qui fait des travaux pour un client doit toujours être licencié.
              </p>
              <p>
                La RBQ distingue deux grands types de licences : la <strong>licence d&apos;entrepreneur général</strong>,
                qui couvre la construction et la rénovation de bâtiments selon ses sous-catégories,
                et la <strong>licence d&apos;entrepreneur spécialisé</strong>, qui est restreinte à des
                corps de métier précis. Chaque licence est associée à des <strong>sous-catégories</strong>{' '}
                numérotées (de 1.1 à 17), qui définissent la nature des travaux autorisés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comment vérifier une licence RBQ ?</h2>
              <p>
                Vérifier une licence RBQ est une étape essentielle avant de confier des travaux
                à un entrepreneur. Voici les principales méthodes :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>Registre en ligne de la RBQ :</strong> Le site de la Régie du bâtiment
                  du Québec (rbq.gouv.qc.ca) propose un répertoire consultable gratuitement. Vous
                  y trouvez le numéro de licence, les sous-catégories, le statut et la date d&apos;expiration.
                </li>
                <li>
                  <strong>Outil Batiscore :</strong> En plus des informations de la RBQ, Batiscore
                  croise les données du REQ (Registraire des entreprises), de l&apos;OPC (Office de
                  la protection du consommateur) et de CanLII (décisions disciplinaires) pour
                  offrir un portrait complet de l&apos;entrepreneur en une seule recherche.
                </li>
                <li>
                  <strong>Appel téléphonique à la RBQ :</strong> Vous pouvez joindre la RBQ par
                  téléphone pour confirmer la validité d&apos;une licence, bien que cette méthode
                  soit plus lente et moins pratique que la vérification en ligne.
                </li>
              </ol>
              <p>
                Lors de la vérification, assurez-vous de relever les informations suivantes :
                le <strong>numéro de licence</strong>, les <strong>sous-catégories</strong> (qui doivent
                correspondre aux travaux envisagés), le <strong>statut</strong> (qui doit être
                actif), la <strong>date d&apos;expiration</strong> et le <strong>nom légal</strong>
                de l&apos;entreprise (qui doit correspondre à celui figurant sur le contrat).
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez gratuitement en 30 secondes
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

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Que signifient les différents statuts ?</h2>
              <p>
                Le registre de la RBQ affiche plusieurs statuts possibles pour une licence.
                Comprendre ces statuts est crucial pour évaluer la fiabilité d&apos;un entrepreneur :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Valide :</strong> La licence est active et en règle. L&apos;entrepreneur
                  est autorisé à exercer les travaux couverts par ses sous-catégories de licence.
                </li>
                <li>
                  <strong>Suspendue :</strong> La licence a été temporairement retirée, souvent en
                  raison d&apos;un manquement (non-paiement de dette, infraction aux règles de
                  sécurité, non-respect des conditions de licence). Un entrepreneur dont la licence
                  est suspendue n&apos;a pas le droit d&apos;exercer.
                </li>
                <li>
                  <strong>Annulée :</strong> La licence a été résiliée, généralement à la demande
                  de l&apos;entrepreneur ou parce que les conditions de renouvellement n&apos;ont
                  pas été remplies. L&apos;entrepreneur ne peut plus exercer sous cette licence.
                </li>
                <li>
                  <strong>Révoquée :</strong> La licence a été retirée par la RBQ pour des manquements
                  graves (fraude, négligence répétée, danger pour le public). Il s&apos;agit du
                  statut le plus sévère. L&apos;entrepreneur peut se voir interdire d&apos;obtenir
                  une nouvelle licence, notamment s&apos;il a été emprisonné pour des infractions
                  criminelles liées à la construction.
                </li>
                <li>
                  <strong>Réouverte :</strong> La licence, précédemment suspendue ou annulée, a été
                  rétablie après que l&apos;entrepreneur a corrigé la situation. Bien que la licence
                  soit à nouveau active, il convient de vérifier les raisons de la suspension ou
                  de l&apos;annulation antérieure.
                </li>
              </ul>
              <p>
                Un entrepreneur dont la licence a été suspendue, annulée ou révoquée puis réouverte
                mérite une attention particulière. Vérifiez les motifs de la sanction initiale
                avant de lui confier des travaux.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Entrepreneur général vs spécialisé</h2>
              <p>
                La RBQ émet deux grands types de licence, chacune couvrant un périmètre de travaux
                différent :
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 not-prose">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Entrepreneur général</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  L&apos;entrepreneur général peut construire, rénover ou modifier des bâtiments
                  selon les sous-catégories détenues (p. ex. 1.1.1 pour les bâtiments résidentiels
                  neufs, 1.3 pour les bâtiments de tout genre). Il peut agir comme maître
                  d&apos;œuvre et coordonner l&apos;ensemble d&apos;un projet. Cette licence exige
                  une garantie financière et une assurance responsabilité civile plus élevées.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 not-prose">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Entrepreneur spécialisé</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  L&apos;entrepreneur spécialisé est restreint à des travaux spécifiques définis
                  par sa sous-catégorie de licence. Par exemple, la sous-catégorie 15.5 couvre la
                  plomberie, la sous-catégorie 16 l&apos;électricité et la sous-catégorie 1.9 la
                  mécanique du bâtiment. Un entrepreneur spécialisé ne peut pas agir comme
                  entrepreneur général et coordonner l&apos;ensemble d&apos;un projet de rénovation.
                </p>
              </div>

              <p>
                Pour le consommateur, il est important de s&apos;assurer que les sous-catégories
                de licence de l&apos;entrepreneur correspondent bien aux travaux envisagés. Un
                entrepreneur spécialisé en plomberie ne peut pas légalement superviser l&apos;ensemble
                d&apos;un projet de rénovation comprenant de la charpenterie ou de l&apos;électricité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Que faire si la licence est invalide ?</h2>
              <p>
                Si la vérification révèle que la licence de l&apos;entrepreneur est suspendue,
                annulée ou révoquée, voici les mesures à prendre :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>Ne signez pas le contrat :</strong> Un entrepreneur sans licence valide
                  n&apos;est pas autorisé à effectuer les travaux. Un contrat signé avec un
                  entrepreneur non licencié peut être difficile à faire valoir et vous prive
                  des recours habituels.
                </li>
                <li>
                  <strong>Signalez la situation à la RBQ :</strong> La RBQ prend les plaintes au
                  sérieux. Tout entrepreneur qui exerce sans licence valide commet une infraction
                  à la Loi sur le bâtiment et s&apos;expose à des amendes importantes.
                </li>
                <li>
                  <strong>Vérifiez s&apos;il s&apos;agit d&apos;une société phénix :</strong> Un
                  entrepreneur dont la licence a été révoquée peut avoir ouvert une nouvelle
                  compagnie sous un autre nom pour contourner la sanction. Vérifiez si la nouvelle
                  entreprise partage des liens (même adresse, même téléphone, même dirigeant) avec
                  l&apos;ancienne.{' '}
                  <Link href="/guides/societe-phenix" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    En savoir plus sur les sociétés phénix &rarr;
                  </Link>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>

              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Est-ce qu&apos;un entrepreneur peut travailler sans licence RBQ ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Non. Au Québec, tout entrepreneur qui effectue des travaux de construction pour
                    autrui doit détenir une licence RBQ, quelle que soit la valeur des travaux.
                    Travailler sans licence constitue une infraction à la Loi sur le bâtiment et
                    expose l&apos;entrepreneur à des amendes pouvant atteindre plus de 100 000 $.
                    Pour le consommateur, un contrat signé avec un entrepreneur non licencié peut
                    être difficile à faire valoir.{' '}
                    <Link href="/guides/entrepreneur-sans-licence" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                      Consultez notre guide sur les entrepreneurs sans licence &rarr;
                    </Link>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Comment savoir si une licence RBQ est encore valide ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Vous pouvez vérifier la validité d&apos;une licence RBQ en consultant le registre
                    en ligne de la Régie du bâtiment du Québec (rbq.gouv.qc.ca) ou en utilisant
                    l&apos;outil gratuit Batiscore, qui croise les données de la RBQ avec celles du
                    REQ, de l&apos;OPC et de CanLII pour un portrait complet de l&apos;entrepreneur.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Quelle est la différence entre un entrepreneur général et spécialisé ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    L&apos;entrepreneur général peut construire, rénover ou modifier des bâtiments
                    selon ses sous-catégories. L&apos;entrepreneur spécialisé est restreint à
                    des travaux spécifiques comme la plomberie (sous-catégorie 15.5), l&apos;électricité
                    (sous-catégorie 16) ou la mécanique du bâtiment (sous-catégorie 1.9). Un
                    entrepreneur spécialisé ne peut effectuer que les travaux couverts par sa
                    sous-catégorie.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/guides/societe-phenix" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Société phénix : comment repérer un entrepreneur qui réouvre sous un nouveau nom
                  </Link>
                </li>
                <li>
                  <Link href="/guides/entrepreneur-sans-licence" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Entrepreneur sans licence : risques et recours
                  </Link>
                </li>
                <li>
                  <Link href="/verifier-entrepreneur-montreal" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Entrepreneurs vérifiés à Montréal
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