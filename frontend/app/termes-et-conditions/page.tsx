import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termes et conditions — Batiscore',
  description: 'Conditions d\'utilisation de la plateforme Batiscore.',
  alternates: { canonical: 'https://batiscore.ca/termes-et-conditions' },
  robots: { index: false, follow: false },
}

const LAST_UPDATED = '13 avril 2026'

export default function TermesConditionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Termes et conditions d&apos;utilisation</h1>
        <p className="text-slate-400 text-sm mb-10">Dernière mise à jour : {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptation des conditions</h2>
            <p>
              En accédant à la plateforme Batiscore (le « Service »), vous acceptez d&apos;être lié par les
              présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez cesser
              d&apos;utiliser le Service immédiatement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Description du Service</h2>
            <p>
              Batiscore est une plateforme d&apos;information qui agrège et présente des données
              publiquement disponibles provenant de sources gouvernementales québécoises, notamment la
              Régie du bâtiment du Québec (RBQ), le Registraire des entreprises du Québec (REQ),
              l&apos;Office de la protection du consommateur (OPC), le Système électronique d&apos;appel d&apos;offres
              (SEAO) et CanLII. Le Service génère un score de fiabilité basé sur ces données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Caractère informatif — Absence de conseil professionnel</h2>
            <p>
              Les informations fournies par Batiscore ont un caractère <strong>strictement informatif</strong>.
              Elles ne constituent pas un avis juridique, financier, professionnel ou de toute autre nature.
              Le score de fiabilité est un indicateur algorithmique basé sur des données publiques et ne
              représente pas une évaluation professionnelle ou certifiée de la fiabilité d&apos;un entrepreneur.
            </p>
            <p>
              Batiscore ne recommande ni ne déconseille l&apos;embauche d&apos;un entrepreneur spécifique.
              Toute décision d&apos;embaucher ou de ne pas embaucher un entrepreneur demeure la responsabilité
              exclusive de l&apos;utilisateur.
            </p>
          </section>

          <section className="bg-orange-50 border border-orange-200 rounded-xl p-6 not-prose">
            <h2 className="text-xl font-bold text-orange-900 mb-3">4. Limitation de responsabilité — Clause principale</h2>
            <p className="text-orange-800 leading-relaxed mb-3">
              <strong>L&apos;utilisateur reconnaît et accepte expressément qu&apos;il est seul responsable de
              toute décision prise sur la base des informations fournies par Batiscore.</strong>
            </p>
            <p className="text-orange-800 leading-relaxed mb-3">
              En aucun cas Batiscore, ses propriétaires, dirigeants, employés, partenaires ou
              fournisseurs de données ne pourront être tenus responsables de tout dommage direct,
              indirect, accessoire, spécial, consécutif ou punitif, incluant notamment :
            </p>
            <ul className="text-orange-800 space-y-1 ml-4 list-disc">
              <li>les pertes financières résultant du choix d&apos;un entrepreneur ;</li>
              <li>les dommages liés à des travaux de mauvaise qualité ou non complétés ;</li>
              <li>les préjudices découlant d&apos;informations inexactes, incomplètes ou périmées ;</li>
              <li>toute décision commerciale, contractuelle ou légale prise sur la base du Service.</li>
            </ul>
            <p className="text-orange-800 leading-relaxed mt-3">
              <strong>L&apos;utilisateur renonce à tout recours judiciaire ou extrajudiciaire contre Batiscore
              découlant de l&apos;utilisation des informations présentées sur la plateforme.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Exactitude des données</h2>
            <p>
              Batiscore s&apos;efforce de maintenir des données à jour, mais ne garantit pas l&apos;exactitude,
              l&apos;exhaustivité ou l&apos;actualité des informations présentées. Les données proviennent de
              sources tierces sur lesquelles Batiscore n&apos;a aucun contrôle. Des délais de mise à jour,
              des erreurs ou des omissions peuvent survenir.
            </p>
            <p>
              Les utilisateurs sont invités à vérifier les informations directement auprès des sources
              officielles (RBQ, REQ, OPC) avant de prendre toute décision importante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Utilisation acceptable</h2>
            <p>Il est interdit d&apos;utiliser le Service pour :</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>extraire massivement des données (scraping) sans autorisation écrite ;</li>
              <li>harceler, diffamer ou nuire à la réputation d&apos;un entrepreneur spécifique ;</li>
              <li>toute utilisation contraire aux lois canadiennes et québécoises applicables ;</li>
              <li>revendre ou redistribuer les données sans autorisation écrite.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Propriété intellectuelle</h2>
            <p>
              Le score de fiabilité, l&apos;algorithme de détection de connexions à risque, le design et
              le contenu éditorial de Batiscore sont la propriété exclusive de Batiscore.
              Les données gouvernementales demeurent la propriété de leurs sources respectives.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Modifications des conditions</h2>
            <p>
              Batiscore se réserve le droit de modifier les présentes conditions à tout moment.
              Les modifications prennent effet dès leur publication sur cette page. L&apos;utilisation
              continue du Service après modification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Droit applicable</h2>
            <p>
              Les présentes conditions sont régies par les lois de la province de Québec et les lois
              fédérales du Canada applicables. Tout litige sera soumis à la compétence exclusive des
              tribunaux du district judiciaire de Montréal, Québec.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Contact</h2>
            <p>
              Pour toute question relative aux présentes conditions, contactez-nous à :{' '}
              <a href="mailto:info@batiscore.ca" className="text-orange-600 underline">info@batiscore.ca</a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
