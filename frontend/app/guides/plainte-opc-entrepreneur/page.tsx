import type { Metadata } from 'next'
import Link from 'next/link'

import { GuideHero } from '@/components/guide/GuideHero'
import { GuideCta } from '@/components/guide/GuideCta'

export const metadata: Metadata = {
  title: 'Comment déposer une plainte contre un entrepreneur à l\'OPC — Guide',
  description:
    'Guide pratique pour déposer une plainte contre un entrepreneur à l\'Office de la protection du consommateur : quand et comment déposer, délais, recours alternatifs et FAQ.',
  keywords: [
    'plainte OPC entrepreneur',
    'déposer plainte OPC',
    'plainte Office de la protection du consommateur',
    'plainte entrepreneur construction',
    'réclamation OPC',
    'comment porter plainte entrepreneur',
    'OPC plainte travaux',
    'recours consommateur OPC',
    'entrepreneur arnaque plainte',
    'protection consommateur entrepreneur',
  ],
  alternates: { canonical: 'https://batiscore.ca/guides/plainte-opc-entrepreneur' },
  openGraph: {
    title: 'Comment déposer une plainte contre un entrepreneur à l\'OPC — Guide',
    description:
      'Apprenez comment déposer une plainte à l\'Office de la protection du consommateur contre un entrepreneur : démarches, délais et recours alternatifs.',
    locale: 'fr_CA',
    type: 'article',
  },
  robots: { index: true },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment déposer une plainte contre un entrepreneur à l\'OPC — Guide',
    description:
      'Guide pratique pour déposer une plainte contre un entrepreneur à l\'Office de la protection du consommateur : quand et comment déposer, délais, recours alternatifs et FAQ.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/guides/plainte-opc-entrepreneur',
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
        name: "Combien de temps prend le traitement d'une plainte à l'OPC ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Le traitement d'une plainte à l'OPC peut prendre de quelques semaines à quelques mois, selon la complexité du dossier, la disponibilité des parties et la nécessité ou non d'une médiation ou d'une enquête approfondie.",
        },
      },
      {
        '@type': 'Question',
        name: "Est-ce que déposer une plainte à l'OPC coûte quelque chose ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Non, déposer une plainte à l'Office de la protection du consommateur est entièrement gratuit. Le service est offert à tout consommateur québécois sans aucun frais.",
        },
      },
      {
        '@type': 'Question',
        name: "Puis-je déposer une plainte si je n'ai pas de contrat écrit ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui, un contrat verbal est aussi valable au Québec. Cependant, il est plus difficile à prouver devant l'OPC ou un tribunal. Il est recommandé de rassembler tous les éléments pouvant attester de l'entente : courriels, messages texte, témoignages, reçus de dépôt ou factures.",
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
        name: 'Plainte à l\'OPC',
        item: 'https://batiscore.ca/guides/plainte-opc-entrepreneur',
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

export default function PlainteOpcEntrepreneurPage() {
  return (
    <>
      <ArticleJsonLd />
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <main className="min-h-screen bg-white">
        <GuideHero
          badge="Guide pratique"
          title="Déposer une plainte"
          titleHighlight="à l&apos;OPC"
          subtitle="Travaux non faits, malfaçons, contrat non respecté — apprenez quand et comment déposer une plainte à l&apos;Office de la protection du consommateur contre un entrepreneur."
        />

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quand déposer une plainte à l&apos;OPC</h2>
              <p>
                L&apos;Office de la protection du consommateur (OPC) est l&apos;organisme gouvernemental
                qui veille au respect de la <strong>Loi sur la protection du consommateur</strong> au
                Québec. Vous pouvez déposer une plainte à l&apos;OPC lorsqu&apos;un entrepreneur
                en construction ne respecte pas ses obligations envers vous. Voici les situations
                les plus courantes :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Travaux non exécutés :</strong> l&apos;entrepreneur a reçu un acompte ou
                  le paiement complet, mais n&apos;a jamais commencé ou terminé les travaux convenus.
                </li>
                <li>
                  <strong>Malfaçons non réparées :</strong> les travaux ont été réalisés, mais
                  présentent des défauts importants que l&apos;entrepreneur refuse ou néglige de corriger.
                </li>
                <li>
                  <strong>Contrat non respecté :</strong> les matériaux promis ont été remplacés par
                  des matériaux de qualité inférieure, les délais n&apos;ont pas été honorés ou les
                  conditions du contrat ont été modifiées sans votre accord.
                </li>
                <li>
                  <strong>Fausse représentation :</strong> l&apos;entrepreneur a fait des affirmations
                  fausses ou trompeuses sur ses compétences, ses licences, ses réalisations antérieures
                  ou les caractéristiques des matériaux utilisés.
                </li>
                <li>
                  <strong>Dépôt non remboursé :</strong> vous avez versé un acompte et l&apos;entrepreneur
                  a annulé le projet ou n&apos;a jamais débuté les travaux, et il refuse de vous
                  rembourser.
                </li>
              </ul>
              <p>
                Toute situation où un entrepreneur enfreint la Loi sur la protection du consommateur
                peut justifier le dépôt d&apos;une plainte. Il n&apos;est pas nécessaire d&apos;être
                certain qu&apos;une infraction a été commise — l&apos;OPC évaluera le bien-fondé de
                votre plainte.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comment déposer une plainte</h2>
              <p>
                Déposer une plainte à l&apos;OPC est une démarche accessible et gratuite. Voici les
                étapes à suivre pour maximiser vos chances d&apos;obtenir gain de cause :
              </p>
              <ol className="space-y-4">
                <li>
                  <strong>Rassemblez vos preuves :</strong> avant de déposer votre plainte, compilez
                  tous les documents pertinents : le contrat signé, les devis et factures, les
                  échanges de courriels ou messages texte avec l&apos;entrepreneur, les photos des
                  malfaçons ou travaux non terminés, les preuves de paiement (reçus, relevés bancaires)
                  et tout autre élément qui appuie votre version des faits. Plus votre dossier est
                  complet, plus l&apos;OPC pourra intervenir efficacement.
                </li>
                <li>
                  <strong>Déposez votre plainte en ligne ou par téléphone :</strong> rendez-vous sur
                  le site de l&apos;OPC à l&apos;adresse <strong>opc.gouv.qc.ca</strong> et utilisez
                  le formulaire de plainte en ligne. Vous pouvez également déposer votre plainte par
                  téléphone en communiquant avec le service à la clientèle de l&apos;OPC. Le formulaire
                  en ligne est généralement la méthode la plus rapide et vous permet de joindre vos
                  documents directement.
                </li>
                <li>
                  <strong>Incluez tous les détails pertinents :</strong> dans votre plainte, identifiez
                  clairement l&apos;entrepreneur (nom de l&apos;entreprise, numéro de licence RBQ le
                  cas échéant), décrivez les faits de manière chronologique, précisez les montants en
                  jeu et indiquez les résultats que vous attendez (remboursement, exécution des travaux,
                  annulation du contrat, etc.).
                </li>
                <li>
                  <strong>Assurez un suivi régulier :</strong> après le dépôt, suivez l&apos;évolution
                  de votre dossier. L&apos;OPC vous assignera un agent qui communiquera avec vous et
                  avec l&apos;entrepreneur. Répondez rapidement à toute demande d&apos;information
                  supplémentaire et conservez une copie de toutes vos communications.
                </li>
              </ol>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez l&apos;entrepreneur avant de signer
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Avant de confier vos travaux à un entrepreneur, vérifiez son statut auprès de la RBQ,
                l&apos;OPC et le REQ en une seule recherche. Notre outil gratuit détecte les licences
                invalides, les plaintes déposées et les connexions avec des entreprises fermées.
              </p>
              <Link
                href="/recherche"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Vérifier un entrepreneur &rarr;
              </Link>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Que peut faire l&apos;OPC</h2>
              <p>
                L&apos;OPC dispose de plusieurs moyens d&apos;action pour vous aider à résoudre un
                litige avec un entrepreneur :
              </p>
              <div className="space-y-4 my-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Médiation entre les parties</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Dans la majorité des cas, l&apos;OPC tente d&apos;abord de faciliter un règlement
                    à l&apos;amiable entre vous et l&apos;entrepreneur. Un agent communique avec les
                    deux parties pour trouver une solution acceptable sans recourir à des mesures
                    coercitives. C&apos;est l&apos;étape la plus fréquente et souvent la plus rapide.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Enquête formelle</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Si la médiation échoue ou si les faits signalés sont graves, l&apos;OPC peut ouvrir
                    une enquête formelle. Les enquêteurs disposent de pouvoirs d&apos;inspection et
                    peuvent exiger la production de documents, visiter les lieux et interroger
                    des témoins.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Poursuite pénale</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Lorsque l&apos;enquête révèle des infractions à la Loi sur la protection du
                    consommateur, l&apos;OPC peut intenter des poursuites pénales contre
                    l&apos;entrepreneur. Les amendes peuvent atteindre plusieurs milliers de
                    dollars, selon la nature et la gravité de l&apos;infraction.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Publication des décisions</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    L&apos;OPC publie les décisions disciplinaires et les condamnations sur son site
                    Web. Cette transparence aide les autres consommateurs à identifier les
                    entrepreneurs problématiques et constitue un incitatif pour les entreprises à
                    respecter leurs obligations.
                  </p>
                </div>
              </div>
              <p>
                Il est important de noter que l&apos;OPC ne peut pas vous obtenir un remboursement
                direct ou forcer l&apos;entrepreneur à exécuter les travaux. Son rôle est de faire
                respecter la loi et de favoriser un règlement. Si vous cherchez une compensation
                monétaire, la Cour du Québec (petite créance) peut être plus appropriée.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Délais importants</h2>
              <p>
                Le temps joue contre vous lorsque vous avez un litige avec un entrepreneur.
                Voici les délais à connaître :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Déposez votre plainte dans un délai raisonnable :</strong> plus vous attendez,
                  plus il devient difficile de prouver votre version des faits. L&apos;OPC recommande
                  de déposer votre plainte dès que vous constatez le problème.
                </li>
                <li>
                  <strong>Prescription de trois ans :</strong> en matière civile au Québec, le délai
                  de prescription pour intenter une poursuite en justice est généralement de
                  <strong> trois ans</strong> à compter du moment où vous découvrez le problème.
                  Passé ce délai, vous perdez votre droit de recours devant les tribunaux.
                </li>
                <li>
                  <strong>N&apos;attendez pas :</strong> même si le délai de prescription est de trois
                  ans, les preuves se détériorent avec le temps. Les courriels sont effacés, les
                  témoins deviennent difficiles à joindre et les photos perdent de leur pertinence.
                  Agissez rapidement pour protéger vos droits.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Autres recours</h2>
              <p>
                Déposer une plainte à l&apos;OPC n&apos;est pas votre seul recours. Selon la nature
                de votre litige, d&apos;autres avenues peuvent s&apos;avérer plus efficaces :
              </p>
              <ul className="space-y-3">
                <li>
                  <strong>Régie du bâtiment du Québec (RBQ) :</strong> si votre plainte concerne
                  spécifiquement la licence de l&apos;entrepreneur (travailler sans licence,
                  licence expirée, non-respect des conditions de licence), vous pouvez déposer
                  une plainte directement à la RBQ.{' '}
                  <Link href="/guides/reclamation-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Consultez notre guide sur les plaintes à la RBQ &rarr;
                  </Link>
                </li>
                <li>
                  <strong>Cour du Québec — Division des petites créances :</strong> si vous cherchez
                  une compensation financière, vous pouvez poursuivre l&apos;entrepreneur devant la
                  Cour du Québec en petite créance pour des montants allant jusqu&apos;à
                  <strong> 15 000 $</strong>. Cette procédure est accessible sans avocat et les
                  frais de dépôt sont minimes. Le jugement est exécutoire et contraignant.
                </li>
                <li>
                  <strong>Garantie de construction résidentielle (GCR) :</strong> si votre litige
                  concerne la construction d&apos;un bâtiment neuf couvert par le Plan de garantie,
                  vous pouvez déposer une réclamation auprès de la GCR. Le plan de garantie couvre
                  les malfaçons, les vices de construction et le non-achèvement des travaux pour
                  les bâtiments résidentiels neufs uniquement.
                </li>
              </ul>
              <p>
                Ces recours ne sont pas exclusifs : vous pouvez déposer une plainte à l&apos;OPC
                et simultanément engager des démarches auprès de la RBQ ou en Cour du Québec.{' '}
                <Link href="/guides/entrepreneur-sans-licence" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                  Consultez notre guide sur les entrepreneurs sans licence pour en savoir plus
                  sur vos recours &rarr;
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Combien de temps prend le traitement d&apos;une plainte à l&apos;OPC ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Le traitement d&apos;une plainte à l&apos;OPC peut prendre de quelques semaines à
                    quelques mois, selon la complexité du dossier, la disponibilité des parties et la
                    nécessité ou non d&apos;une médiation ou d&apos;une enquête approfondie. Les plaintes
                    simples qui se règlent par médiation sont généralement traitées plus rapidement.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Est-ce que déposer une plainte à l&apos;OPC coûte quelque chose ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Non, déposer une plainte à l&apos;Office de la protection du consommateur est
                    entièrement gratuit. Le service est offert à tout consommateur québécois sans aucun
                    frais. Vous n&apos;avez pas besoin d&apos;engager un avocat pour déposer votre plainte.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 not-prose">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Puis-je déposer une plainte si je n&apos;ai pas de contrat écrit ?</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Oui, un contrat verbal est aussi valable au Québec. Cependant, il est plus difficile
                    à prouver devant l&apos;OPC ou un tribunal. Il est recommandé de rassembler tous les
                    éléments pouvant attester de l&apos;entente : courriels, messages texte, témoignages,
                    reçus de dépôt ou factures. Plus vous avez de preuves documentaires, plus votre
                    plainte sera prise au sérieux.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pour aller plus loin</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/guides/reclamation-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Réclamation à la RBQ : comment déposer une plainte pour problèmes de licence
                  </Link>
                </li>
                <li>
                  <Link href="/guides/entrepreneur-sans-licence" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Entrepreneur sans licence : risques et recours
                  </Link>
                </li>
                <li>
                  <Link href="/guides/verifier-licence-rbq" className="text-orange-600 hover:text-orange-700 no-underline font-semibold">
                    Comment vérifier une licence RBQ avant d&apos;engager un entrepreneur
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