'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Report {
  report_id: string
  tier: string
  contractor: {
    nom_legal: string
    neq: string | null
    licence_rbq: string | null
    adresse: string | null
    ville: string | null
    telephone: string | null
    statut_rbq: string | null
    categories_rbq: string[]
    date_fondation: string | null
    score: number | null
    score_label: string
  }
  events: Array<{
    type: string
    date: string | null
    montant: number | null
    description: string | null
  }>
  litiges: Array<{
    tribunal: string | null
    date: string | null
    type: string | null
    issue: string | null
    montant: number | null
    url: string | null
  }>
  contrats_publics: Array<{
    titre: string | null
    organisme: string | null
    montant: number | null
    date: string | null
  }>
}

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReport()
  }, [params.id])

  const fetchReport = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/report/${params.id}`)

      if (!res.ok) {
        if (res.status === 403) {
          setError('Ce rapport n\'est pas accessible. Veuillez d\'abord effectuer le paiement.')
        } else if (res.status === 410) {
          setError('Ce rapport a expiré.')
        } else {
          setError('Rapport non trouvé.')
        }
        return
      }

      const data = await res.json()
      setReport(data)
    } catch (err) {
      setError('Erreur de chargement')
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-semibold text-gray-900">RBQ Checker</Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">Retour à la recherche</Link>
        </div>
      </main>
    )
  }

  if (!report) return null

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900">RBQ Checker</Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Imprimer / PDF
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.contractor.nom_legal}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {report.contractor.ville && `${report.contractor.ville} · `}
                {report.contractor.licence_rbq && `RBQ ${report.contractor.licence_rbq}`}
                {report.contractor.neq && ` · NEQ ${report.contractor.neq}`}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getScoreColor(report.contractor.score)}`}>
              {report.contractor.score ?? '?'} / 100
            </div>
          </div>

          <div className="mt-4">
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              report.contractor.statut_rbq === 'valide'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Licence {report.contractor.statut_rbq?.toUpperCase() || 'INCONNUE'}
            </span>
            <span className="ml-2 text-sm text-gray-500">{report.contractor.score_label}</span>
          </div>
        </div>

        {/* Score détaillé */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse de fiabilité</h2>
          <p className="text-gray-600">
            Score calculé à partir des données publiques (RBQ, REQ, OPC, CanLII, SEAO).
            Le score reflète le niveau de risque : plus il est élevé, plus l'entrepreneur est fiable.
          </p>
        </div>

        {/* Événements RBQ */}
        {report.events.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Événements RBQ ({report.events.length})
            </h2>
            <div className="space-y-3">
              {report.events.map((event, i) => (
                <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium capitalize">{event.type}</span>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {event.montant && (
                      <span className="text-sm font-medium">{event.montant.toLocaleString('fr-CA')} $</span>
                    )}
                    {event.date && (
                      <p className="text-xs text-gray-400">{event.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Litiges */}
        {report.litiges.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Litiges ({report.litiges.length})
            </h2>
            <div className="space-y-3">
              {report.litiges.map((litige, i) => (
                <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{litige.tribunal || 'Tribunal non spécifié'}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      litige.issue === 'condamné'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {litige.issue || 'En cours'}
                    </span>
                    {litige.url && (
                      <a href={litige.url} target="_blank" rel="noopener" className="block text-sm text-blue-600 hover:underline mt-1">
                        Voir la décision
                      </a>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {litige.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contrats publics */}
        {report.contrats_publics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contrats publics SEAO ({report.contrats_publics.length})
            </h2>
            <p className="text-sm text-green-700 mb-4">
              Ces contrats publics sont un signal positif de crédibilité.
            </p>
            <div className="space-y-3">
              {report.contrats_publics.map((contrat, i) => (
                <div key={i} className="flex justify-between items-start p-3 bg-green-50 rounded">
                  <div>
                    <span className="font-medium">{contrat.titre || 'Contrat non titré'}</span>
                    <p className="text-sm text-gray-500">{contrat.organisme}</p>
                  </div>
                  <div className="text-right">
                    {contrat.montant && (
                      <span className="font-medium">{contrat.montant.toLocaleString('fr-CA')} $</span>
                    )}
                    {contrat.date && (
                      <p className="text-xs text-gray-400">{contrat.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 print:hidden">
          <p>Rapport généré le {new Date().toLocaleDateString('fr-CA')}</p>
          <p className="mt-1">Données issues du registre RBQ, REQ, OPC, CanLII et SEAO.</p>
        </div>
      </div>
    </main>
  )
}