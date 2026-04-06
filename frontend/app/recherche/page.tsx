'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  id: number
  nom: string
  ville: string | null
  licence_rbq: string | null
  statut_rbq: string | null
  score: number | null
  score_label: string | null
  categories: string[]
}

export default function RecherchePage() {
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

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600'
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-amber-100 text-amber-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusBadge = (statut: string | null) => {
    if (statut === 'valide') {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Licence valide</span>
    }
    return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">{statut || 'Inconnu'}</span>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">RBQ Checker</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Résultats pour "{query}"
        </h1>

        {loading && (
          <div className="text-center py-8 text-gray-500">Recherche en cours...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">{error}</div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">Aucun entrepreneur trouvé.</p>
            <p className="text-sm text-gray-500">
              Travailler avec un entrepreneur sans licence RBQ est illégal au Québec.
            </p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/entrepreneur/${result.id}`}
                className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{result.nom}</h2>
                    <p className="text-sm text-gray-500">
                      {result.ville && `${result.ville} · `}
                      {result.licence_rbq && `RBQ ${result.licence_rbq}`}
                    </p>
                    {result.categories && result.categories.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {result.categories.slice(0, 3).map((cat, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(result.statut_rbq)}
                    {result.score !== null && (
                      <div className={`px-3 py-1 rounded text-sm font-medium ${getScoreColor(result.score)}`}>
                        {result.score}/100
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}