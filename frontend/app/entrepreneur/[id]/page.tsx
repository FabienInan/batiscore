'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </main>
    )
  }

  if (!contractor) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Entrepreneur non trouvé</h1>
          <Link href="/" className="text-blue-600 hover:underline">Retour à la recherche</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">RBQ Checker</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Nom et infos de base */}
          <h1 className="text-2xl font-bold text-gray-900">{contractor.nom}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contractor.ville && `${contractor.ville} · `}
            {contractor.licence_rbq && `RBQ ${contractor.licence_rbq}`}
            {contractor.neq && ` · NEQ ${contractor.neq}`}
          </p>

          {/* Statut licence */}
          <div className="mt-6">
            {contractor.statut_rbq === 'valide' ? (
              <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200">
                <span className="font-medium text-green-800">Licence RBQ valide</span>
                {contractor.categories && contractor.categories.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {contractor.categories.map((cat, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200">
                <span className="font-medium text-red-800">
                  Licence {contractor.statut_rbq || 'invalide'}
                </span>
              </div>
            )}
          </div>

          {/* Score (flou) */}
          <div className="mt-6 relative">
            <div className="text-5xl font-bold text-gray-300 blur-sm select-none">
              {contractor.score ?? '?'}
              <span className="text-xl text-gray-400"> / 100</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-gray-600 bg-white/80 px-2 py-1 rounded">
                Score visible dans le rapport complet
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/rapport/${contractor.id}/checkout`}
            className="mt-8 block w-full text-center py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir le rapport complet — 7,99 $
          </Link>

          <p className="mt-4 text-xs text-center text-gray-500">
            Rapport valide 30 jours. Paiement sécurisé par Stripe.
          </p>
        </div>
      </div>
    </main>
  )
}