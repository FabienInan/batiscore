'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">RBQ Checker</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Vérifiez un entrepreneur en construction
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Avant de confier vos travaux, vérifiez la licence RBQ, les réclamations et le score de fiabilité.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, numéro RBQ, NEQ ou téléphone..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600">40 000+</div>
            <div className="text-sm text-gray-600">Entrepreneurs vérifiés</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600">Sources publiques</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-blue-600">7,99$</div>
            <div className="text-sm text-gray-600">Rapport complet</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Données issues du registre RBQ, REQ, OPC et autres sources publiques du Québec.
        </div>
      </footer>
    </main>
  )
}