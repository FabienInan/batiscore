'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface Contractor {
  id: number
  nom: string
  ville: string | null
  licence_rbq: string | null
  neq: string | null
  statut_rbq: string | null
  categories: string[]
  score: number | null
  score_label: string | null
}

export default function EntrepreneurContent() {
  const params = useParams()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContractor()
  }, [params.id])

  const fetchContractor = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/contractor/${params.id}`)
      const data = await res.json()
      setContractor(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400'
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-slate-800 border-slate-700'
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20'
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </main>
    )
  }

  if (!contractor) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Entrepreneur non trouvé</h1>
          <Link href="/">
            <Button variant="accent">Retour à la recherche</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Dark hero */}
      <section className="bg-slate-900 py-10 lg:py-14">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer">
            <ArrowLeft size={16} />
            Retour
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{contractor.nom}</h1>
              <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
                <span className="font-medium text-slate-300">RBQ {contractor.licence_rbq || 'N/A'}</span>
                {contractor.neq && <><span className="opacity-30">|</span><span>NEQ {contractor.neq}</span></>}
                {contractor.ville && <><span className="opacity-30">|</span><span>{contractor.ville}</span></>}
              </div>
              <Badge
                variant={contractor.statut_rbq === 'valide' ? 'success' : contractor.statut_rbq === 'réouverte' ? 'warning' : 'danger'}
                icon={contractor.statut_rbq === 'valide' ? ShieldCheck : AlertTriangle}
              >
                Licence RBQ {contractor.statut_rbq === 'réouverte' ? 'RÉOUVERTE' : (contractor.statut_rbq?.toUpperCase() || 'INCONNUE')}
              </Badge>
              {contractor.statut_rbq === 'réouverte' && (
                <Badge variant="warning" icon={AlertTriangle}>
                  Anciennement fermée
                </Badge>
              )}
            </div>

            <div className={`flex flex-col items-center p-5 rounded-2xl border min-w-32 ${getScoreBg(contractor.score)}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Confiance</div>
              <div className={`text-4xl font-black ${getScoreColor(contractor.score)}`}>
                {contractor.score ?? '?'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-1">{contractor.score_label || 'Non évalué'}</div>
              <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">Estimation algorithmique</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-saas border border-slate-100 p-6">
          {contractor.categories && contractor.categories.length > 0 && (
            (() => {
            const groups: Record<string, string[]> = {}
            let currentType = 'Generale'
            for (const item of contractor.categories) {
              if (item === 'Generale' || item === 'Specialisee') {
                currentType = item
              } else {
                if (!groups[currentType]) groups[currentType] = []
                groups[currentType].push(item)
              }
            }
            const RBQ_LABELS: Record<string, string> = {
              '1.1.1': 'Bâtiments résidentiels neufs (classe I)',
              '1.1.2': 'Bâtiments résidentiels neufs (classe II)',
              '1.2': 'Petits bâtiments',
              '1.3': 'Bâtiments de tout genre',
              '1.4': 'Routes et canalisation',
              '1.5': 'Structures d\'ouvrages de génie civil',
              '1.6': 'Ouvrages de génie civil immergés',
              '1.7': 'Télécom et énergie électrique',
              '1.8': 'Équipements pétroliers',
              '1.9': 'Mécanique du bâtiment',
              '1.10': 'Remontées mécaniques',
              '2.1': 'Puits forés', '2.2': 'Captage d\'eau', '2.3': 'Pompage eaux souterraines',
              '2.4': 'Assainissement autonome', '2.5': 'Excavation et terrassement',
              '2.6': 'Pieux et fondations', '2.7': 'Travaux d\'emplacement', '2.8': 'Sautage',
              '3.1': 'Structures de béton', '3.2': 'Petits ouvrages de béton',
              '4.1': 'Structures de maçonnerie', '4.2': 'Maçonnerie non structurale',
              '5.1': 'Structures métalliques', '5.2': 'Ouvrages métalliques',
              '6.1': 'Charpentes de bois', '6.2': 'Travaux de bois et plastique',
              '7': 'Isolation, étanchéité, couvertures', '8': 'Portes et fenêtres',
              '9': 'Travaux de finition', '10': 'Chauffage combustible solide',
              '11.1': 'Tuyauterie industrielle', '11.2': 'Équipements et produits spéciaux',
              '12': 'Armoires et comptoirs', '13.1': 'Protection contre la foudre',
              '13.2': 'Alarme incendie', '13.3': 'Extinction d\'incendie',
              '13.4': 'Extinction localisée', '13.5': 'Installations spéciales',
              '14.1': 'Ascenseurs et monte-charges', '14.2': 'Appareils élévateurs (handicapés)',
              '14.3': 'Autres appareils élévateurs', '15.1': 'Chauffage à air pulsé',
              '15.2': 'Brûleurs gaz naturel', '15.3': 'Brûleurs à l\'huile',
              '15.4': 'Chauffage hydronique', '15.5': 'Plomberie', '15.6': 'Propane',
              '15.7': 'Ventilation résidentielle', '15.8': 'Ventilation',
              '15.9': 'Petite réfrigération', '15.10': 'Réfrigération',
              '16': 'Électricité', '17.1': 'Instrumentation et contrôle',
              '17.2': 'Intercommunication et surveillance',
              'ADM': 'Administration', 'GPC': 'Gaz de pétrole comprimé',
              'SEC': 'Sécurité',
            }
            return (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Spécialités RBQ</h2>
                {Object.entries(groups).map(([type, codes]) => (
                  <div key={type} className="mb-3 last:mb-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {type === 'Generale' ? 'Licence générale' : type === 'Specialisee' ? 'Licence spécialisée' : type}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {codes.map((code) => (
                        <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs" title={RBQ_LABELS[code] ?? code}>
                          <span className="font-semibold text-slate-700">{code}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{RBQ_LABELS[code] ?? code}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
          )}

          <Link
            href={`/rapport/${contractor.id}`}
            className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Voir le rapport complet
          </Link>

          <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
            Données issues de sources publiques, présentées à titre informatif uniquement.
          </p>
        </div>
      </section>
    </main>
  )
}