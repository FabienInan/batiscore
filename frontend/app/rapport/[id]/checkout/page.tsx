'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<'complet' | 'premium'>('complet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prices = {
    complet: 7.99,
    premium: 12.99,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/report/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: params.id,
          tier,
          email,
        }),
      })

      const data = await res.json()

      if (data.client_secret) {
        // TODO: Intégrer Stripe Elements pour le paiement
        // Pour l'instant, rediriger vers le rapport
        router.push(`/rapport/${data.report_id}`)
      } else {
        setError('Erreur lors de la création du paiement')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">RBQ Checker</Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Commander le rapport</h1>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de réception
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tier */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rapport
              </label>
              <div className="space-y-2">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${tier === 'complet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="tier"
                    value="complet"
                    checked={tier === 'complet'}
                    onChange={() => setTier('complet')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Rapport complet</div>
                    <div className="text-sm text-gray-500">Score, réclamations, litiges, contrats publics</div>
                  </div>
                  <div className="font-bold">{prices.complet} $</div>
                </label>

                <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${tier === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="tier"
                    value="premium"
                    checked={tier === 'premium'}
                    onChange={() => setTier('premium')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Rapport premium</div>
                    <div className="text-sm text-gray-500">Complet + analyse détaillée + alertes futures</div>
                  </div>
                  <div className="font-bold">{prices.premium} $</div>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Chargement...' : `Payer ${prices[tier]} $`}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-500">
            Paiement sécurisé par Stripe. Rapport valide 30 jours.
          </p>
        </div>
      </div>
    </main>
  )
}