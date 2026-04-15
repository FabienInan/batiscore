import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Batiscore',
  description: 'Politique de protection des renseignements personnels conforme à la Loi 25 du Québec.',
  alternates: { canonical: 'https://batiscore.ca/politique-de-confidentialite' },
  robots: { index: false, follow: false },
}

const LAST_UPDATED = '15 avril 2026'

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de protection des renseignements personnels</h1>
        <p className="text-slate-400 text-sm mb-10">Dernière mise à jour : {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Responsable de la protection des renseignements personnels</h2>
            <p>
              Le responsable de la protection des renseignements personnels est Batiscore (Racine numérique).
              Pour toute question relative à la présente politique, contactez-nous à :{' '}
              <a href="mailto:info@batiscore.ca" className="text-orange-600 underline">info@batiscore.ca</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Renseignements collectés</h2>
            <p>
              <strong>Données des visiteurs :</strong> Aucune information personnelle n&apos;est collectée lors de la visite
              du site. Aucun compte n&apos;est requis pour utiliser le service gratuit. Les recherches sont anonymes.
            </p>
            <p>
              <strong>Données des entrepreneurs :</strong> La plateforme agrège et présente des données publiquement
              disponibles provenant de sources gouvernementales québécoises, notamment la Régie du bâtiment du Québec
              (RBQ), le Registraire des entreprises du Québec (REQ), l&apos;Office de la protection du consommateur (OPC),
              CanLII et le Système électronique d&apos;appel d&apos;offres (SEAO). Les noms d&apos;entreprises, numéros de licence,
              adresses, numéros de téléphone, statuts légaux et événements publics sont tous tirés de ces registres publics.
            </p>
            <p>
              <strong>Données techniques :</strong> Les journaux de serveur standard (adresse IP, agent utilisateur,
              pages visitées) sont collectés automatiquement et utilisés uniquement à des fins de sécurité et
              de performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Sources des données</h2>
            <p>
              Toutes les données sur les entrepreneurs proviennent exclusivement de sources accessibles au public :
            </p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Régie du bâtiment du Québec (RBQ) — <a href="https://www.rbq.gouv.qc.ca" className="text-orange-600 underline" target="_blank" rel="noopener noreferrer">rbq.gouv.qc.ca</a></li>
              <li>Registraire des entreprises du Québec (REQ) — <a href="https://www.registreentreprises.gouv.qc.ca" className="text-orange-600 underline" target="_blank" rel="noopener noreferrer">registreentreprises.gouv.qc.ca</a></li>
              <li>Office de la protection du consommateur (OPC) — <a href="https://www.opc.gouv.qc.ca" className="text-orange-600 underline" target="_blank" rel="noopener noreferrer">opc.gouv.qc.ca</a></li>
              <li>CanLII — <a href="https://www.canlii.org" className="text-orange-600 underline" target="_blank" rel="noopener noreferrer">canlii.org</a></li>
              <li>SEAO — <a href="https://www.seao.ca" className="text-orange-600 underline" target="_blank" rel="noopener noreferrer">seao.ca</a></li>
            </ul>
            <p>
              Aucune information privée, confidentielle ou non publique n&apos;est utilisée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Finalités du traitement</h2>
            <p>Les données sont traitées aux fins suivantes :</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Agrégation et présentation de données publiques pour l&apos;information des consommateurs ;</li>
              <li>Calcul d&apos;un indicateur de fiabilité algorithmique ;</li>
              <li>Fourniture du service de recherche et de consultation des rapports.</li>
            </ul>
            <p>
              Batiscore ne pratique aucun profilage, ne vend aucune donnée et ne prend aucune décision automatisée
              affectant des personnes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Conservation des données</h2>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>Données publiques :</strong> conservées tant qu&apos;elles demeurent pertinentes et actualisées à partir des sources officielles ;</li>
              <li><strong>Journaux de serveur :</strong> conservés 90 jours, puis supprimés ;</li>
              <li><strong>Données de paiement :</strong> traitées par Stripe et conservées conformément à la politique de Stripe. Aucune donnée de carte bancaire n&apos;est stockée par Batiscore.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Droits des personnes concernées</h2>
            <p>
              Conformément à la Loi 25 du Québec, toute personne concernée peut exercer les droits suivants :
            </p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li><strong>Droit d&apos;accès :</strong> obtenir une copie des renseignements personnels détenus ;</li>
              <li><strong>Droit de rectification :</strong> faire corriger des renseignements inexacts ;</li>
              <li><strong>Droit de retrait :</strong> demander la suppression de renseignements personnels ;</li>
              <li><strong>Droit de contestation :</strong> contester les informations affichées (voir la <a href="/contester" className="text-orange-600 underline">procédure de contestation</a>).</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez :{' '}
              <a href="mailto:info@batiscore.ca" className="text-orange-600 underline">info@batiscore.ca</a>.
              Batiscore s&apos;engage à répondre dans les 30 jours suivant la réception de la demande, conformément à la Loi 25.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Partage des données</h2>
            <p>
              Aucune donnée n&apos;est vendue ou partagée avec des tiers à des fins commerciales. Les données peuvent
              être partagées uniquement si exigé par la loi ou pour protéger les droits de Batiscore.
              Le traitement des paiements est assuré par Stripe, qui dispose de sa propre politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Sécurité</h2>
            <p>
              Les données sont hébergées sur des serveurs sécurisés au Canada. Le site utilise le chiffrement HTTPS,
              des contrôles d&apos;accès et des audits de sécurité réguliers. Aucune garantie de sécurité absolue n&apos;est fournie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Témoins de connexion (cookies)</h2>
            <p>
              Seuls des témoins essentiels (session, préférences) sont utilisés. Aucun témoin de pistage ni de
              publicité tierce n&apos;est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Modifications</h2>
            <p>
              La présente politique peut être modifiée en tout temps. La date de dernière mise à jour est indiquée
              en haut de page. Les modifications significatives seront communiquées via la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">11. Contact</h2>
            <p>
              Pour toute question relative à la présente politique ou pour exercer vos droits :{' '}
              <a href="mailto:info@batiscore.ca" className="text-orange-600 underline">info@batiscore.ca</a>
            </p>
            <p>
              Pour contester des informations affichées sur votre entreprise :{' '}
              <a href="/contester" className="text-orange-600 underline">Procédure de contestation</a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}