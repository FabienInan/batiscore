import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CATEGORIES_LIST } from '@/lib/categories'
import { VILLES_LIST } from '@/lib/locations'

export function generateStaticParams() {
  return CATEGORIES_LIST.map((cat) => ({ categorie: cat.slug }))
}

export function generateMetadata({ params }: { params: { categorie: string } }): Metadata {
  const cat = CATEGORIES[params.categorie]
  if (!cat) return {}

  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    keywords: cat.keywords,
    alternates: { canonical: `https://batiscore.ca/categories/${cat.slug}/` },
    openGraph: {
      title: cat.metaTitle,
      description: cat.metaDescription,
      locale: 'fr_CA',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

function BreadcrumbJsonLd({ cat }: { cat: typeof CATEGORIES_LIST[0] }) {
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
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function CategoryPage({ params }: { params: { categorie: string } }) {
  const cat = CATEGORIES[params.categorie]
  if (!cat) notFound()

  return (
    <main className="min-h-screen bg-white">
      <BreadcrumbJsonLd cat={cat} />

      <section className="bg-slate-900 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            {cat.metaTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {cat.description}
          </p>
        </div>
      </section>

      {/* Villes desservies */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {cat.nom} par ville
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {VILLES_LIST.map((ville) => (
            <Link
              key={ville.slug}
              href={`/categories/${cat.slug}/${ville.slug}/`}
              className="group flex flex-col p-4 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {cat.nom} à {ville.nom}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {ville.nbEntrepreneurs} entrepreneurs
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Contenu SEO */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Pourquoi vérifier un entrepreneur en {cat.nom.toLowerCase()} ?
          </h2>
          <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
            <p>
              Au Québec, tout entrepreneur en {cat.nom.toLowerCase()} doit détenir une licence valide de la Régie du bâtiment du Québec (RBQ).
              Cette licence atteste que l'entrepreneur possède les compétences techniques, la solvabilité et l'assurance responsabilité
              requises pour exercer dans cette catégorie.
            </p>
            <p>
              La catégorie {cat.nom.toLowerCase()} couvre plusieurs sous-catégories de licence RBQ :{' '}
              {cat.codesRbq.join(', ')}. Chaque sous-catégorie définit la nature exacte des travaux autorisés.
              Il est essentiel de vérifier que l'entrepreneur que vous envisagez d'engager détient bien la sous-catégorie
              correspondant à vos travaux.
            </p>
            <p>
              En utilisant Batiscore, vous pouvez vérifier gratuitement la licence RBQ, le statut au REQ,
              les plaintes à l'OPC et les éventuelles connexions à risque de l'entrepreneur.
              Une vérification de 30 secondes peut vous éviter des milliers de dollars de pertes.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Prêt à vérifier votre entrepreneur ?
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
      </section>
    </main>
  )
}
