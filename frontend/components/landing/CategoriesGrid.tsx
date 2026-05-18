import Link from 'next/link'
import { CATEGORIES_LIST } from '@/lib/categories'

export function CategoriesGrid() {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vérifier un entrepreneur par type de travail
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Explorez les licences RBQ par catégorie de construction au Québec.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {CATEGORIES_LIST.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}/`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {cat.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">
                {cat.codesRbq.length} codes RBQ
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
