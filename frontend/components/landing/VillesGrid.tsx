import Link from 'next/link'
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'

export function VillesGrid({ currentSlug }: { currentSlug?: string }) {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vérifier un entrepreneur dans d&apos;autres villes du Québec
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Notre base de données couvre tous les entrepreneurs licenciés RBQ au Québec.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {VILLES_LIST.filter((v) => v.slug !== currentSlug).map((ville) => (
            <Link
              key={ville.slug}
              href={`/verifier-entrepreneur-${ville.slug}`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {ville.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{ville.nbEntrepreneurs} entrepreneurs</span>
            </Link>
          ))}
        </div>

        {/* MRC links */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">
          Vérifier un entrepreneur par MRC
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Couverture régionale par municipalité régionale de comté.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {MRCS_LIST.map((mrc) => (
            <Link
              key={mrc.slug}
              href={`/verifier-entrepreneur-mrc-${mrc.slug}`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-blue-700 leading-tight">
                {mrc.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{mrc.nbEntrepreneurs} entrepreneurs</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}