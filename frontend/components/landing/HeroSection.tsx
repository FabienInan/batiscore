import { AlertTriangle, Shield, Database, Clock } from 'lucide-react'
import { SearchBar } from './SearchBar'

const stats = [
  { icon: Shield, value: '49 000+', label: 'entrepreneurs vérifiables' },
  { icon: Database, value: '5', label: 'sources officielles' },
  { icon: Clock, value: 'Quotidien', label: 'mise à jour des données' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-24">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 bg-dot-grid" aria-hidden="true" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* Urgency badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-8 motion-safe:animate-pulse-slow"
          role="alert"
        >
          <AlertTriangle size={15} aria-hidden="true" />
          <span>1 900+ plaintes de rénovation déposées à l&apos;OPC chaque année</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
          Vérifiez votre entrepreneur{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            avant de signer
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          Score de fiabilité basé sur les données RBQ, REQ, OPC, CanLII et SEAO.
          Ne confiez pas vos travaux à un entrepreneur non vérifié.
        </p>

        <SearchBar />

        {/* Stats bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <stat.icon size={14} className="text-slate-400" aria-hidden="true" />
              </div>
              <span className="text-sm">
                <span className="font-semibold text-slate-200">{stat.value}</span>
                {' '}{stat.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-600">
          Recherche 100% gratuite &middot; Données publiques &middot; Aucune inscription
        </p>
      </div>
    </section>
  )
}
