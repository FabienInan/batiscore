import { SearchBar } from './SearchBar'
import { ShieldCheck } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="relative bg-slate-900 py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" aria-hidden="true" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6 border border-emerald-500/20">
          <ShieldCheck size={13} aria-hidden="true" />
          Gratuit &middot; Instantané &middot; Sans inscription
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ne prenez pas de risque <span className="text-red-400">inutile</span>
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-light">
          Une vérification de 30 secondes peut vous éviter des milliers de dollars de pertes.
        </p>

        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar variant="compact" />
        </div>

        <p className="text-xs text-slate-600">
          49 000+ entrepreneurs vérifiables &middot; Données publiques officielles
        </p>
      </div>
    </section>
  )
}
