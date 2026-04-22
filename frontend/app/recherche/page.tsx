'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, ShieldCheck, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { SearchBar } from '@/components/landing/SearchBar'

interface SearchResult {
  id: number
  nom: string
  ville: string | null
  licence_rbq: string | null
  statut_rbq: string | null
  statut_req: string | null
  rbq_valide: boolean
  score: number | null
  score_label: string | null
  categories: string[]
}

function RechercheContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      fetchResults(query)
    }
  }, [query])

  const fetchResults = async (q: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-slate-800 text-slate-300 border-slate-700'
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (score >= 70) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    if (score >= 50) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    return 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  // Empty state — no query yet
  if (!query) {
    return (
      <main className="min-h-screen">
        <section className="bg-slate-900 py-16 lg:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 cursor-pointer">
              <ArrowLeft size={16} />
              Retour
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Vérifier un entrepreneur
            </h1>
            <p className="text-slate-400 mb-8">
              Entrez un nom, un numéro RBQ, un NEQ ou un numéro de téléphone.
            </p>
            <SearchBar />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Dark header band */}
      <section className="bg-slate-900 py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer">
            <ArrowLeft size={16} />
            Retour
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <Search size={20} className="text-orange-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Résultats pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">&ldquo;{query}&rdquo;</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-14">
            {!loading && `${results.length} entrepreneur${results.length !== 1 ? 's' : ''} trouvé${results.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-saas border border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertTriangle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} />
            </div>
            <p className="text-slate-900 font-semibold text-lg mb-2">Aucun entrepreneur trouvé.</p>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              Nous n&apos;avons trouvé aucun résultat correspondant à votre recherche.
              Travailler avec un entrepreneur sans licence RBQ est illégal au Québec.
            </p>
          </Card>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/rapport/${result.id}`}
                className="group block bg-white p-6 rounded-xl shadow-saas border border-slate-100 hover:border-orange-300/50 hover:shadow-saas-hover transition-all duration-300 ease-out hover:scale-[1.01] cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {result.nom}
                      </h2>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      {result.ville || 'Ville non spécifiée'}
                      <span className="mx-2 opacity-30">|</span>
                      <span className="font-medium text-slate-700">RBQ {result.licence_rbq || 'N/A'}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {result.rbq_valide ? (
                        <Badge variant="success" icon={ShieldCheck}>Licence valide</Badge>
                      ) : (
                        <Badge variant="danger" icon={AlertTriangle}>
                          Licence {result.statut_rbq === 'valide' ? 'expirée' : (result.statut_rbq || 'inconnue')}
                        </Badge>
                      )}
                      {(result.statut_req === 'radié' || result.statut_req === 'faillite') && (
                        <Badge variant="danger" className="bg-red-600 text-white border-red-500" icon={AlertTriangle}>
                          REQ {result.statut_req === 'faillite' ? 'en faillite' : 'radié'}
                        </Badge>
                      )}
                      {result.categories && result.categories.length > 0 && result.categories.slice(0, 3).map((cat, i) => (
                        <Badge key={i} variant="neutral">{cat}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                    {result.score !== null && (
                      <div className={`px-4 py-2 rounded-lg text-sm font-black border ${getScoreBg(result.score)}`}>
                        {result.score}<span className="font-normal opacity-50">/100</span>
                      </div>
                    )}
                    {result.score_label && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        {result.score_label}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <section className="bg-slate-900 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <Skeleton className="h-8 w-48 bg-slate-800" />
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-saas border border-slate-100">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      </main>
    }>
      <RechercheContent />
    </Suspense>
  )
}