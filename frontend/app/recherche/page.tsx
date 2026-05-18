import type { Metadata } from 'next'
import { Suspense } from 'react'
import RechercheContent from './RechercheContent'
import { Skeleton } from '@/components/ui/Skeleton'

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  const query = searchParams.q
  if (!query) {
    return {
      title: 'Rechercher un entrepreneur au Québec — Batiscore',
      description: 'Vérifiez gratuitement la fiabilité de votre entrepreneur : licence RBQ, statut REQ, plaintes OPC, score de confiance.',
      alternates: { canonical: 'https://batiscore.ca/recherche/' },
    }
  }
  return {
    title: `Résultats pour "${query}" — Vérification entrepreneur Québec`,
    description: `${query} — Vérifiez la licence RBQ, le statut REQ et le score de fiabilité. Recherche gratuite parmi 49 000+ entrepreneurs du Québec.`,
    alternates: { canonical: `https://batiscore.ca/recherche/?q=${encodeURIComponent(query)}` },
    robots: { index: query.length > 2, follow: true },
  }
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
