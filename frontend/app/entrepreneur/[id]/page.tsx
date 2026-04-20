import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EntrepreneurContent from './EntrepreneurContent'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ContractorData {
  id: number
  nom: string
  ville: string | null
  licence_rbq: string | null
  statut_rbq: string | null
  score: number | null
  score_label: string | null
}

async function getContractor(id: string): Promise<ContractorData | null> {
  try {
    const res = await fetch(`${API_URL}/api/contractor/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const contractor = await getContractor(params.id)
  if (!contractor) return { title: 'Entrepreneur non trouvé' }

  const ville = contractor.ville ? ` à ${contractor.ville}` : ''
  const statut = contractor.statut_rbq === 'valide' ? 'licence valide' : (contractor.statut_rbq || 'statut inconnu')
  const score = contractor.score !== null ? ` — Score ${contractor.score}/100` : ''

  return {
    title: `${contractor.nom}${ville} — Batiscore`,
    description: `Vérifiez la fiabilité de ${contractor.nom}${ville}. Licence RBQ ${contractor.licence_rbq || 'N/A'}, ${statut}${score}. Données publiques RBQ, REQ et OPC.`,
    alternates: { canonical: `https://batiscore.ca/entrepreneur/${contractor.id}` },
    openGraph: {
      title: `${contractor.nom}${ville} — Batiscore`,
      description: `Score de fiabilité, licence RBQ et statut de ${contractor.nom}${ville}. Vérification gratuite à partir de données publiques.`,
      locale: 'fr_CA',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export default function EntrepreneurPage({ params }: { params: { id: string } }) {
  return <EntrepreneurContent />
}