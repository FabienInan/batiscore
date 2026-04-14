import { ShieldOff, PhoneOff, AlertOctagon, ShieldX } from 'lucide-react'

const risks = [
  {
    icon: ShieldOff,
    title: 'Entreprise radiée au REQ',
    description: 'Une entreprise radiée au Registre des entreprises peut continuer à opérer et à signer des contrats.',
    stat: '3 200+',
    statLabel: 'radiations par an',
    accent: 'text-red-400',
    iconBg: 'bg-red-500/10',
    iconBorder: 'border-red-500/20',
    statColor: 'text-red-400',
  },
  {
    icon: PhoneOff,
    title: 'Entrepreneur à risque élevé',
    description: 'Même téléphone, même adresse qu\'une entreprise radiée. Certains ferment et rouvrent sous un nouveau nom — notre outil détecte ces connexions.',
    stat: '8%',
    statLabel: 'des entrepreneurs vérifiés',
    accent: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/20',
    statColor: 'text-orange-400',
  },
  {
    icon: AlertOctagon,
    title: 'Cautionnement insuffisant',
    description: 'Près de 1 000 licences sont suspendues chaque année pour défaut de cautionnement. Quand le fonds est épuisé, les clients ne récupèrent rien.',
    stat: '1 000+',
    statLabel: 'suspensions par an',
    accent: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    statColor: 'text-amber-400',
  },
  {
    icon: ShieldX,
    title: 'Licence suspendue ou révoquée',
    description: 'Un entrepreneur avec une licence RBQ suspendue peut encore se présenter comme actif si vous ne vérifiez pas.',
    stat: '1 900+',
    statLabel: 'plaintes OPC par an',
    accent: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    iconBorder: 'border-rose-500/20',
    statColor: 'text-rose-400',
  },
]

export function RisksSection() {
  return (
    <section className="bg-slate-800 py-16 lg:py-20" aria-labelledby="risks-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="risks-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
            Les risques sont <span className="text-red-400">réels</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
            Chaque année, des milliers de Québécois font face à des problèmes avec leur entrepreneur en rénovation.
            Voici les signaux d&apos;alerte que notre vérification détecte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {risks.map((risk) => (
            <div
              key={risk.title}
              className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 ${risk.iconBg} ${risk.iconBorder} border rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                  <risk.icon size={22} className={risk.accent} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-base font-semibold text-white leading-snug">{risk.title}</h3>
                    <div className="shrink-0 text-right">
                      <div className={`text-sm font-bold ${risk.statColor}`}>{risk.stat}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{risk.statLabel}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{risk.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
