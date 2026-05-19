import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReportContent from './ReportContent'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ReportContractor {
  id: number
  nom_legal: string
  ville: string | null
  licence_rbq: string | null
  statut_rbq: string | null
  score: number | null
  score_label: string | null
}

interface FullReport {
  contractor: ReportContractor
  events: unknown[]
  litiges: unknown[]
  contrats_publics: unknown[]
  google_reviews?: { rating: number; nb_avis: number }
}

async function getReport(id: string): Promise<FullReport | null> {
  try {
    const res = await fetch(`${API}/api/report/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getReseau(id: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API}/api/report/${id}/reseau`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const report = await getReport(params.id)
  if (!report) {
    return {
      title: 'Rapport non trouvé — Batiscore',
      description: 'Ce rapport n\'existe pas ou a été supprimé.',
      robots: { index: false, follow: true },
    }
  }

  const c = report.contractor
  const ville = c.ville ? ` à ${c.ville}` : ''
  const statut = c.statut_rbq === 'valide' ? '✅ Licence valide' : `⚠️ ${c.statut_rbq || 'statut inconnu'}`
  const score = c.score !== null ? ` — Score ${c.score}/100` : ''

  return {
    title: `${c.nom_legal}${ville} — ${statut} — Batiscore`,
    description: `Score ${c.score ?? '?'}/100. Vérifiez la licence RBQ, les plaintes OPC et les connexions à risque de ${c.nom_legal}${ville}. Données publiques gratuites.`,
    alternates: { canonical: `https://batiscore.ca/rapport/${params.id}/` },
    openGraph: {
      title: `${c.nom_legal} — Score ${c.score ?? '?'}/100`,
      description: `Licence RBQ ${c.licence_rbq || 'N/A'}. ${report.events?.length || 0} événements. ${report.contrats_publics?.length || 0} contrats publics.`,
      locale: 'fr_CA',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const [report, reseau] = await Promise.all([
    getReport(params.id),
    getReseau(params.id),
  ])

  if (!report) {
    notFound()
  }

  return <ReportContent report={report as any} reseau={reseau as any} />
}
