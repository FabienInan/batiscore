import { Building2, FileCheck, Scale, Landmark, Gavel, CheckCircle } from 'lucide-react'

const sources = [
  {
    icon: Building2,
    name: 'RBQ',
    fullName: 'Régie du bâtiment du Québec',
    description: 'Licences, catégories, statut, événements disciplinaires',
  },
  {
    icon: FileCheck,
    name: 'REQ',
    fullName: 'Registre des entreprises du Québec',
    description: 'Statut légal, date de constitution, radiations',
  },
  {
    icon: Scale,
    name: 'OPC',
    fullName: 'Office de la protection du consommateur',
    description: 'Plaintes et réclamations déposées par les consommateurs',
  },
  {
    icon: Gavel,
    name: 'CanLII',
    fullName: 'Canadian Legal Information Institute',
    description: 'Décisions du Bureau des régisseurs, litiges juridiques',
  },
  {
    icon: Landmark,
    name: 'SEAO',
    fullName: 'Système électronique d\'appels d\'offres',
    description: 'Contrats publics, montants, organismes adjudicateurs',
  },
]

export function SourcesSection() {
  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold mb-4 border border-emerald-500/20">
            <CheckCircle size={13} aria-hidden="true" />
            Données 100% publiques
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            5 sources officielles du Québec
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-light">
            Notre vérification croise les registres officiels pour vous donner une image complète et vérifiable.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {sources.map((source) => (
            <div
              key={source.name}
              className="bg-white rounded-xl p-5 border border-slate-100 shadow-saas hover:border-primary/25 hover:shadow-saas-hover transition-all duration-200 text-center group"
            >
              <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/12 transition-colors duration-200">
                <source.icon size={20} className="text-primary" aria-hidden="true" />
              </div>
              <div className="text-sm font-bold text-slate-900 mb-0.5">{source.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2 leading-tight">{source.fullName}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{source.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <CheckCircle size={12} className="text-emerald-500" aria-hidden="true" />
          Aucune information privée n&apos;est utilisée. Données accessibles publiquement.
        </p>
      </div>
    </section>
  )
}
