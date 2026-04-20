import { ShieldAlert, ArrowRight, Phone, MapPin, Clock, Tag } from 'lucide-react'

const signals = [
  { icon: Clock, label: 'Temporalité critique', desc: 'Fondée juste après la fermeture d\'une entreprise liée' },
  { icon: Phone, label: 'Même téléphone', desc: 'Numéro de téléphone partagé avec une entreprise en difficulté' },
  { icon: MapPin, label: 'Code postal similaire', desc: 'Zone géographique identique à une entreprise radiée' },
  { icon: Tag, label: 'Même catégories RBQ', desc: 'Spécialités identiques à une entreprise fermée' },
]

export function PhenixSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: explanation */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold mb-4 uppercase tracking-wide">
              <ShieldAlert size={14} />
              Détection exclusive
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Identifiez les <span className="text-red-500">entrepreneurs à risque</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">
              Certains entrepreneurs ferment leur compagnie puis recommencent sous un nouveau nom
              avec les mêmes dirigeants. Notre algorithme détecte automatiquement les connexions
              entre entreprises pour vous informer avant de signer.
            </p>

            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <signal.icon size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{signal.label}</div>
                    <div className="text-xs text-slate-500">{signal.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mockup */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Score de fiabilité</div>
                <div className="text-4xl font-black text-red-400">35<span className="text-lg text-slate-500">/100</span></div>
              </div>
              <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold">
                Risque élevé
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">9385-0162 Québec inc.</div>
                  <div className="text-xs text-slate-400">Radiée — Même téléphone</div>
                </div>
                <div className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">-20 pts</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Construction ABC inc.</div>
                  <div className="text-xs text-slate-400">Suspendue — Temporalité critique</div>
                </div>
                <div className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">-25 pts</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-400">
              <ArrowRight size={14} />
              <span>3 entreprises liées détectées</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}