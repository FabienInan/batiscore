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

export default function EntrepreneurPage() {
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
              <Badge variant={contractor.statut_rbq === 'valide' ? 'success' : 'danger'} icon={contractor.statut_rbq === 'valide' ? ShieldCheck : AlertTriangle}>
                Licence RBQ {contractor.statut_rbq?.toUpperCase() || 'INCONNUE'}
              </Badge>
            </div>

            <div className={`flex flex-col items-center p-5 rounded-2xl border min-w-32 ${getScoreBg(contractor.score)}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
              <div className={`text-4xl font-black ${getScoreColor(contractor.score)}`}>
                {contractor.score ?? '?'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-1">{contractor.score_label || 'Non évalué'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-saas border border-slate-100 p-6">
          {contractor.categories && contractor.categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Catégories RBQ</h2>
              <div className="flex gap-2 flex-wrap">
                {contractor.categories.map((cat, i) => (
                  <span key={i} className="px-3 py-1.5 text-xs bg-slate-50 text-slate-600 border border-slate-100 rounded-lg font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/rapport/${contractor.id}`}
            className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            Voir le rapport complet
          </Link>
        </div>
      </section>
    </main>
  )
}