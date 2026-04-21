import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const GUIDES = [
  {
    href: '/guides/verifier-licence-rbq',
    title: 'Comment vérifier une licence RBQ',
    description: 'Vérifiez rapidement si une licence RBQ est valide, active et conforme avant d\'engager un entrepreneur.',
  },
  {
    href: '/guides/entrepreneur-sans-licence',
    title: 'Entrepreneur sans licence : risques et recours',
    description: 'Découvrez les dangers de faire affaire avec un entrepreneur non licencié et vos options légales.',
  },
  {
    href: '/guides/societe-phenix',
    title: 'Les sociétés phénix : comment les repérer',
    description: 'Identifiez les entrepreneurs qui ferment et rouvrent sous un nouveau nom pour éviter les arnaques.',
  },
  {
    href: '/guides/plainte-opc-entrepreneur',
    title: 'Déposer une plainte à l\'OPC',
    description: 'Guide étape par étape pour déposer une plainte auprès de l\'Office de la protection du consommateur.',
  },
  {
    href: '/guides/reclamation-rbq',
    title: 'Faire une réclamation à la RBQ',
    description: 'Procédure complète pour déposer une réclamation au garantie financière de la Régie du bâtiment.',
  },
]

export function GuidesSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Guides et ressources
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Tout ce que vous devez savoir pour vérifier un entrepreneur et protéger vos droits au Québec.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block border border-slate-200 rounded-xl p-5 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                  <BookOpen size={16} className="text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {guide.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}