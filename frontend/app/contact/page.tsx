import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — Batiscore',
  description: 'Contactez l\'équipe Batiscore pour toute question ou suggestion.',
  alternates: { canonical: 'https://batiscore.ca/contact' },
  robots: { index: false, follow: true },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contact</h1>
        <p className="text-slate-500 text-sm mb-10">
          Une question, une suggestion ou un signalement ? Écrivez-nous.
        </p>

        <div className="space-y-6">
          {/* Email */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
                <Mail size={20} className="text-orange-600" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Par courriel</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Pour toute question relative à Batiscore, aux données affichées ou pour signaler
              une erreur, contactez-nous à :
            </p>
            <a
              href="mailto:cont@racine-numerique.ca"
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-500 transition-colors"
            >
              <Mail size={14} aria-hidden="true" />
              cont@racine-numerique.ca
            </a>
          </div>

          {/* Racine numérique */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
                <ExternalLink size={20} className="text-orange-600" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Racine numérique</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Batiscore est un projet de Racine numérique. Découvrez nos autres réalisations :
            </p>
            <a
              href="https://racine-numerique.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-500 transition-colors"
            >
              <ExternalLink size={14} aria-hidden="true" />
              racine-numerique.ca
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}