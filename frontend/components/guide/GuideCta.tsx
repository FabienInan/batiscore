import Link from 'next/link'

interface GuideCtaProps {
  title?: string
  description?: string
  buttonText?: string
}

export function GuideCta({
  title = 'Vérifiez votre entrepreneur avant de signer',
  description = 'Notre outil croise RBQ, REQ, OPC et CanLII pour vous donner un portrait complet de la fiabilité d\'un entrepreneur en 30 secondes.',
  buttonText = 'Rechercher un entrepreneur',
}: GuideCtaProps) {
  return (
    <section className="bg-slate-900 py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-slate-400 mb-8">
          {description}
        </p>
        <Link
          href="/recherche"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  )
}