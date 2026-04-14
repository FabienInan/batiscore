import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Comment vérifier un entrepreneur en rénovation au Québec — Guide complet',
  description:
    'Avant de signer, vérifiez la licence RBQ, le statut REQ, les plaintes OPC et les connexions avec des entreprises fermées. Guide complet pour choisir un entrepreneur fiable au Québec.',
  keywords: [
    'vérifier entrepreneur rénovation Québec',
    'comment choisir entrepreneur fiable',
    'vérifier licence RBQ entrepreneur',
    'entrepreneur radié RBQ nouvelle compagnie',
    'entrepreneur qui change de nom',
    'connexions entreprises fermées',
    'vérifier entrepreneur avant de signer',
    'plaintes OPC entrepreneur',
    'entrepreneur en difficulté Québec',
  ],
  alternates: { canonical: 'https://batiscore.ca/verifier-entrepreneur-renovation' },
  openGraph: {
    title: 'Comment vérifier un entrepreneur en rénovation au Québec — Guide complet',
    description:
      'Licence RBQ, statut REQ, plaintes OPC, connexions avec des entreprises fermées — tout ce qu\'il faut vérifier avant de signer un contrat de rénovation.',
    locale: 'fr_CA',
    type: 'article',
  },
}

function ArticleJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Comment vérifier un entrepreneur en rénovation au Québec — Guide complet',
    description:
      'Guide complet pour vérifier la fiabilité d\'un entrepreneur avant de signer un contrat de rénovation au Québec.',
    author: { '@type': 'Organization', name: 'Batiscore' },
    publisher: {
      '@type': 'Organization',
      name: 'Batiscore',
      url: 'https://batiscore.ca',
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: 'https://batiscore.ca/verifier-entrepreneur-renovation',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function ArnaqueEntrepreneurPage() {
  return (
    <>
      <ArticleJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-slate-900 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
              Guide pratique
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Comment vérifier un entrepreneur{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                en rénovation au Québec
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Licence RBQ, statut REQ, plaintes OPC, connexions avec des entreprises fermées —
              voici les vérifications essentielles à faire avant de signer un contrat de rénovation.
            </p>
          </div>
        </section>

        {/* Article body */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose prose-slate prose-lg max-w-none">

            <h2>Pourquoi vérifier un entrepreneur avant de signer ?</h2>
            <p>
              Au Québec, n&apos;importe qui peut incorporer une nouvelle compagnie en quelques jours.
              Un entrepreneur ayant eu des difficultés — poursuites, dettes envers des clients,
              licence suspendue — peut fermer son entreprise et en ouvrir une autre sous un nouveau nom.
            </p>
            <p>
              La Régie du bâtiment du Québec (RBQ) signale régulièrement ce type de situation
              dans ses communications sur les <strong>stratagèmes frauduleux en rénovation</strong>.
              Pour un consommateur, le risque est réel : en cherchant le nouveau nom, aucun antécédent
              négatif n&apos;apparaît — parce que c&apos;est un nom tout neuf.
            </p>
            <p>
              Le lien entre l&apos;ancienne et la nouvelle compagnie se repère souvent grâce à ces indices :
            </p>
            <ul>
              <li>Le même numéro de téléphone</li>
              <li>La même adresse d&apos;affaires</li>
              <li>Un nom similaire (&ldquo;Construction XYZ&rdquo; → &ldquo;Rénovations XYZ&rdquo;)</li>
              <li>Les mêmes spécialités et le même territoire</li>
            </ul>

            <h2>Les risques d&apos;un entrepreneur non vérifié</h2>
            <p>
              Sans vérification préalable, les consommateurs s&apos;exposent à des situations difficiles :
            </p>
            <ul>
              <li>
                <strong>Travaux inachevés :</strong> L&apos;entrepreneur disparaît en cours de chantier
                avec les dépôts versés.
              </li>
              <li>
                <strong>Malfaçons non réparées :</strong> Sans compagnie légale existante, aucun
                recours direct n&apos;est possible contre l&apos;entité qui a signé le contrat.
              </li>
              <li>
                <strong>Garantie sans valeur :</strong> Les garanties contractuelles deviennent
                inapplicables si la compagnie est radiée au REQ.
              </li>
              <li>
                <strong>Recours longs et coûteux :</strong> Prouver devant les tribunaux le lien entre
                l&apos;ancienne et la nouvelle entité est une démarche longue et coûteuse.
              </li>
            </ul>

            <h2>Les signaux d&apos;alerte à surveiller</h2>

            <h3>1. Même numéro de téléphone qu&apos;une compagnie radiée</h3>
            <p>
              C&apos;est l&apos;indice le plus fiable. Un entrepreneur qui ouvre une nouvelle compagnie
              conserve souvent son ancien numéro pour ne pas perdre ses clients. Si ce numéro
              correspond à celui d&apos;une entité radiée ou en faillite, le lien entre les deux
              compagnies est très probable.
            </p>

            <h3>2. Même adresse d&apos;affaires qu&apos;une compagnie fermée</h3>
            <p>
              Une adresse partagée entre une compagnie active et une compagnie radiée est un
              signal fort, à condition que l&apos;adresse ne soit pas un centre d&apos;affaires virtuel.
              Si seulement 2-3 entreprises partagent cette adresse, le lien est probablement réel.
            </p>

            <h3>3. Nom similaire, même ville</h3>
            <p>
              &ldquo;Construction ABC&rdquo; qui ferme et &ldquo;Rénovations ABC&rdquo; qui ouvre quelques mois plus
              tard à la même adresse. La similarité du nom couplée à la même ville est révélatrice.
            </p>

            <h3>4. Compagnie très récente, dirigeant avec antécédents</h3>
            <p>
              Méfiez-vous des compagnies incorporées depuis moins de 2 ans dont le dirigeant
              est associé à d&apos;autres compagnies radiées ou en faillite. Vérifiez le REQ.
            </p>

            <h2>Comment vérifier un entrepreneur avant de signer</h2>
            <ol>
              <li>
                <strong>Vérifiez la licence RBQ :</strong> La licence doit être valide et active.
                Une suspension récente est un signal d&apos;alarme sérieux.
              </li>
              <li>
                <strong>Vérifiez le statut REQ :</strong> La compagnie doit être active. Une
                radiation récente suivie d&apos;une nouvelle incorporation mérite attention.
              </li>
              <li>
                <strong>Consultez les décisions disciplinaires :</strong> Les décisions du Bureau
                des régisseurs de la RBQ sont publiques sur CanLII. Elles documentent les
                manquements graves.
              </li>
              <li>
                <strong>Cherchez les connexions :</strong> Vérifiez si l&apos;entrepreneur partage un
                téléphone ou une adresse avec des compagnies radiées ou en faillite.
              </li>
              <li>
                <strong>Consultez l&apos;OPC :</strong> L&apos;Office de la protection du consommateur
                conserve un registre des plaintes déposées contre les entrepreneurs.
              </li>
            </ol>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 my-8 not-prose">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Vérifiez gratuitement en 30 secondes
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                Notre outil croise automatiquement RBQ, REQ, OPC et CanLII, et détecte les connexions
                entre entreprises (même téléphone, même adresse) pour vous informer avant de signer.
              </p>
              <Link
                href="/recherche"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Vérifier un entrepreneur →
              </Link>
            </div>

            <h2>Questions fréquentes</h2>

            <h3>Est-ce qu&apos;un entrepreneur peut légalement fermer sa compagnie et en ouvrir une autre ?</h3>
            <p>
              Oui, c&apos;est légal. Un entrepreneur peut tout à fait fermer une entreprise et en créer
              une nouvelle. Ce que vous souhaitez savoir, c&apos;est si cette nouvelle compagnie est
              liée à des difficultés passées — et c&apos;est précisément ce que notre outil vérifie
              en croisant téléphone, adresse et nom entre toutes les entreprises.
            </p>

            <h3>La RBQ vérifie-t-elle ces connexions ?</h3>
            <p>
              Partiellement. La RBQ peut refuser ou révoquer une licence si les dirigeants d&apos;une
              nouvelle entreprise sont associés à d&apos;anciennes entités ayant eu des manquements graves.
              Mais des changements de dirigeants nominaux peuvent contourner ces contrôles, et
              la vérification n&apos;est pas systématique pour toutes les nouvelles incorporations.
            </p>

            <h3>Que faire si je suis victime d&apos;un entrepreneur malhonnête ?</h3>
            <p>
              Déposez une plainte à l&apos;OPC (Office de la protection du consommateur) et à la RBQ.
              Pour les constructions neuves, vérifiez si l&apos;entrepreneur est accrédité par la Garantie
              de construction résidentielle (GCR), qui a remplacé la GQH depuis janvier 2015. Consultez Éducaloi pour connaître vos recours légaux, notamment
              la possibilité de lever le voile corporatif pour tenir le dirigeant personnellement
              responsable.
            </p>

            <h3>Comment savoir si une compagnie vient d&apos;être incorporée ?</h3>
            <p>
              Le Registraire des entreprises du Québec (REQ) indique la date d&apos;immatriculation de
              chaque compagnie. Une compagnie incorporée depuis moins de 1-2 ans sans historique
              vérifiable mérite une vigilance accrue, surtout pour des contrats importants.
            </p>
          </div>
        </article>

        {/* CTA finale */}
        <section className="bg-slate-900 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Vérifiez votre entrepreneur avant de signer
            </h2>
            <p className="text-slate-400 mb-8">
              Notre outil croise RBQ, REQ, OPC et CanLII pour vous donner un portrait complet
              de la fiabilité d&apos;un entrepreneur en 30 secondes.
            </p>
            <Link
              href="/recherche"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Rechercher un entrepreneur
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
