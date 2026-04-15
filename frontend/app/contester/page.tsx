import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contester les informations — Batiscore',
  description: 'Procédure de contestation pour les entrepreneurs figurant sur Batiscore.',
  alternates: { canonical: 'https://batiscore.ca/contester' },
  robots: { index: false, follow: false },
}

const LAST_UPDATED = '15 avril 2026'

export default function ContesterPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contester les informations</h1>
        <p className="text-slate-400 text-sm mb-10">Dernière mise à jour : {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Pourquoi contester ?</h2>
            <p>
              Si vous êtes un entrepreneur figurant sur Batiscore et que vous estimez que les informations
              présentées sont incorrectes, incomplètes ou périmées, vous pouvez demander une révision.
              Batiscore s&apos;engage à traiter toute demande de contestation de manière équitable et dans les
              meilleurs délais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Comment procéder</h2>
            <ol className="mt-2 space-y-3 ml-4 list-decimal">
              <li>
                <strong>Envoyez un courriel</strong> à{' '}
                <a href="mailto:info@batiscore.ca" className="text-orange-600 underline">info@batiscore.ca</a>{' '}
                avec comme objet : <em>Contestation — [Nom de l&apos;entreprise ou Numéro RBQ]</em>.
              </li>
              <li>
                <strong>Incluez les informations suivantes :</strong>
                <ul className="mt-1 space-y-1 ml-4 list-disc">
                  <li>Nom de l&apos;entreprise tel qu&apos;affiché sur Batiscore ;</li>
                  <li>Numéro de licence RBQ ;</li>
                  <li>Les informations spécifiques que vous contestez ;</li>
                  <li>Toute documentation justificative (lien vers la source officielle montrant les données à jour, capture d&apos;écran, etc.).</li>
                </ul>
              </li>
              <li>
                <strong>Vous pouvez aussi</strong> utiliser le{' '}
                <a href="/contact" className="text-orange-600 underline">formulaire de contact</a>.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Délais de traitement</h2>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>Accusé de réception :</strong> dans les 5 jours ouvrables suivant la réception ;</li>
              <li><strong>Révision complète :</strong> dans les 30 jours ouvrables suivant la réception ;</li>
              <li><strong>Correction :</strong> si les données sont confirmées comme inexactes, elles seront corrigées ou retirées dans les 10 jours ouvrables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Types de corrections possibles</h2>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>Mise à jour :</strong> si la source officielle a été mise à jour et que les données affichées ne reflètent plus la réalité ;</li>
              <li><strong>Retrait :</strong> si les données de la source ne sont plus accessibles publiquement ;</li>
              <li><strong>Clarification :</strong> si les données sont exactes mais manquent de contexte, une note explicative peut être ajoutée.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Recours en cas de désaccord</h2>
            <p>
              Si votre demande de contestation est refusée et que vous estimez que vos droits ne sont pas
              respectés, vous pouvez :
            </p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Communiquer avec la Commission d&apos;accès à l&apos;information du Québec (CAIQ) ;</li>
              <li>Exercer tout recours prévu par la loi applicable.</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nous joindre</h3>
          <p className="text-slate-600 mb-2">
            Pour toute contestation, envoyez un courriel à :
          </p>
          <a
            href="mailto:info@batiscore.ca"
            className="inline-flex items-center gap-2 text-orange-600 font-semibold underline"
          >
            info@batiscore.ca
          </a>
          <p className="text-slate-400 text-xs mt-4">
            Objet suggéré : Contestation — [Nom de l&apos;entreprise / Numéro RBQ]
          </p>
        </div>
      </div>
    </main>
  )
}