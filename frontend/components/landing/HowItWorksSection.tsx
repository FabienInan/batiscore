import { Search, FileText, ShieldCheck, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Search,
    number: '1',
    title: 'Entrez le nom ou numéro RBQ',
    description: 'Recherchez gratuitement parmi 49 000+ entrepreneurs enregistrés au Québec.',
    time: '5 sec',
  },
  {
    icon: FileText,
    number: '2',
    title: 'Consultez le rapport complet',
    description: 'Licence RBQ, statut REQ, plaintes OPC, décisions CanLII, contrats publics et réseau d\'entreprises.',
    time: '10 sec',
  },
  {
    icon: ShieldCheck,
    number: '3',
    title: 'Prenez une décision éclairée',
    description: 'Score de fiabilité 0-100 avec détection de connexions à risque. Signez en confiance.',
    time: '30 sec',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Comment ça marche
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto font-light">
            En 30 secondes, passez d&apos;un nom d&apos;entrepreneur à un rapport complet.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden md:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center group">
              {/* Step icon */}
              <div className="relative inline-block mb-5">
                <div className="w-16 h-16 bg-primary/8 border border-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/12 group-hover:border-primary/30 transition-colors duration-200">
                  <step.icon size={28} className="text-primary" aria-hidden="true" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-glow-blue">
                  {step.number}
                </span>
              </div>

              {/* Arrow between steps (desktop, between cards) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-8 -right-4 z-10 items-center justify-center w-8 h-8 -translate-y-1/2" aria-hidden="true">
                  <ArrowRight size={16} className="text-primary/40" />
                </div>
              )}

              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{step.description}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary/70 bg-primary/6 px-2.5 py-1 rounded-full">
                <span>≈ {step.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
