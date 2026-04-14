'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
    <main className="min-h-screen">
      {/* Dark header */}
      <section className="bg-slate-900 py-10">
        <div className="max-w-lg mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer">
            <ArrowLeft size={16} />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CreditCard size={24} className="text-orange-400" />
            Commander le rapport
          </h1>
        </div>
      </section>

      <section className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-saas border border-slate-100 p-6 space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email de réception
            </label>
            <input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Tier */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Type de rapport</p>
            <div className="space-y-2">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${tier === 'complet' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="tier"
                  value="complet"
                  checked={tier === 'complet'}
                  onChange={() => setTier('complet')}
                  className="mr-3 accent-orange-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Rapport complet</div>
                  <div className="text-sm text-slate-500">Score, réclamations, litiges, contrats publics</div>
                </div>
                <div className="font-bold text-slate-900">{prices.complet} $</div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${tier === 'premium' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="tier"
                  value="premium"
                  checked={tier === 'premium'}
                  onChange={() => setTier('premium')}
                  className="mr-3 accent-orange-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Rapport premium</div>
                  <div className="text-sm text-slate-500">Complet + analyse détaillée + alertes futures</div>
                </div>
                <div className="font-bold text-slate-900">{prices.premium} $</div>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="accent"
            disabled={loading || !email}
            className="w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : `Payer ${prices[tier]} $`}
          </Button>

          <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} />
            Paiement sécurisé par Stripe. Rapport valide 30 jours.
          </p>
        </form>
      </section>
    </main>
  )
}