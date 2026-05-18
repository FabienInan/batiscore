import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CATEGORIES_LIST } from '@/lib/categories'
import { VILLES, VILLES_LIST } from '@/lib/locations'

export function generateStaticParams() {
  const params: { categorie: string; ville: string }[] = []
  for (const cat of CATEGORIES_LIST) {
    for (const ville of VILLES_LIST) {
      params.push({ categorie: cat.slug, ville: ville.slug })
    }
  }
  return params
}

export function generateMetadata({ params }: { params: { categorie: string; ville: string } }): Metadata {
  const cat = CATEGORIES[params.categorie]
  const ville = VILLES[params.ville]
  if (!cat || !ville) return {}

  return {
    title: `${cat.nom} à ${ville.nom} — Vérification entrepreneur RBQ`,
    description: `Trouvez des entrepreneurs en ${cat.nom.toLowerCase()} à ${ville.nom}. Vérifiez leur licence RBQ, score de fiabilité et antécédents avant d'engager.`,
    keywords: [
      `entrepreneur ${cat.nom.toLowerCase()} ${ville.nom}`,
      `${cat.nom.toLowerCase()} ${ville.nom} RBQ`,
      `licence RBQ ${cat.nom.toLowerCase()} ${ville.nom}`,
      `vérifier entrepreneur ${ville.nom}`,
    ],
    alternates: { canonical: `https://batiscore.ca/categories/${cat.slug}/${ville.slug}/` },
    openGraph: {
      title: `${cat.nom} à ${ville.nom} — Vérification entrepreneur`,
      description: `Entrepreneurs en ${cat.nom.toLowerCase()} à ${ville.nom} : vérifiez la licence RBQ, le score de fiabilité et les antécédents.`,
      locale: 'fr_CA',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

function BreadcrumbJsonLd({ cat, ville }: { cat: typeof CATEGORIES_LIST[0]; ville: typeof VILLES_LIST[0] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://batiscore.ca',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cat.nom,
        item: `https://batiscore.ca/categories/${cat.slug}/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: ville.nom,
        item: `https://batiscore.ca/categories/${cat.slug}/${ville.slug}/`,
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function CategoryVillePage({ params }: { params: { categorie: string; ville: string } }) {
  const cat = CATEGORIES[params.categorie]
  const ville = VILLES[params.ville]
  if (!cat || !ville) notFound()

  return (
    <main className="min-h-screen bg-white">
      <BreadcrumbJsonLd cat={cat} ville={ville} />

      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            {cat.nom} à <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">{ville.nom}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Vérifiez la fiabilité des entrepreneurs en {cat.nom.toLowerCase()} à {ville.nom}.
            Licence RBQ, score de confiance, plaintes OPC et connexions à risque.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Trouver un entrepreneur en {cat.nom.toLowerCase()} à {ville.nom}
        </h2>
        <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
          <p>
            {ville.nom} compte de nombreux entrepreneurs en {cat.nom.toLowerCase()} détenteurs d'une licence RBQ.
            Avant de confier vos travaux, il est essentiel de vérifier que l'entrepreneur détient bien
            la sous-catégorie de licence adaptée à votre projet : {cat.codesRbq.join(', ')}.
          </p>
          <p>
            Notre outil vous permet de vérifier gratuitement la validité de la licence RBQ,
            le statut au Registre des entreprises du Québec (REQ), les plaintes à l'Office de la protection
            du consommateur (OPC) et d'éventuelles connexions avec des entreprises fermées.
          </p>
          <p>
            Une vérification rapide de 30 secondes peut vous éviter des mauvaises surprises
            et sécuriser votre investissement en {cat.nom.toLowerCase()}.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Vérifier un entrepreneur à {ville.nom}
          </h2>
          <p className="text-slate-600 mb-8">
            Recherchez par nom, numéro RBQ ou NEQ pour obtenir un score de fiabilité complet.
          </p>
          <Link
            href="/recherche/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Vérifier un entrepreneur &rarr;
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Autres villes pour {cat.nom.toLowerCase()}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {VILLES_LIST.filter((v) => v.slug !== ville.slug).map((v) => (
            <Link
              key={v.slug}
              href={`/categories/${cat.slug}/${v.slug}/`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {cat.nom} à {v.nom}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Autres catégories à {ville.nom}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATEGORIES_LIST.filter((c) => c.slug !== cat.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}/${ville.slug}/`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-blue-700 leading-tight">
                {c.nom} à {ville.nom}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
