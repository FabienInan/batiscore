'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Est-ce que la recherche est gratuite ?',
    answer: 'Oui, la recherche d\'un entrepreneur est 100% gratuite. Vous pouvez vérifier le nom, le numéro RBQ, le statut et le score de fiabilité sans payer. Le rapport détaillé est disponible à partir de 7,99$.',
  },
  {
    question: 'Quelles données vérifiez-vous ?',
    answer: 'Nous croisons les données de 5 sources publiques : la RBQ (licences, événements), le REQ (statut légal), l\'OPC (plaintes des consommateurs), CanLII (décisions du Bureau des régisseurs) et le SEAO (contrats publics). Toutes ces données sont accessibles publiquement.',
  },
  {
    question: 'Comment détecter si un entrepreneur a déjà eu des problèmes sous un autre nom ?',
    answer: 'Certains entrepreneurs ferment leur compagnie puis recommencent sous un nouveau nom, en conservant le même numéro de téléphone ou la même adresse. Notre algorithme détecte ces connexions automatiquement et vous en informe dans le rapport. En savoir plus : batiscore.ca/verifier-entrepreneur-renovation',
  },
  {
    question: 'Comment est calculé le score de fiabilité ?',
    answer: 'Le score de 0 à 100 est basé sur : le statut de la licence RBQ, le statut au REQ, les plaintes à l\'OPC, les décisions du Bureau des régisseurs (CanLII), les contrats publics obtenus (SEAO), et la détection de connexions avec des entreprises radiées. Un score de 85+ est "Fiable", 70-84 "Acceptable", 50-69 "À surveiller", et sous 50 "À risque élevé".',
  },
  {
    question: 'Les données sont-elles à jour ?',
    answer: 'Les données RBQ, REQ et SEAO sont mises à jour quotidiennement. Les plaintes OPC et les décisions CanLII sont vérifiées à chaque consultation de rapport. Vous avez toujours accès aux informations les plus récentes disponibles publiquement.',
  },
  {
    question: 'Comment vérifier si un entrepreneur a des plaintes ?',
    answer: 'Recherchez l\'entrepreneur par nom ou numéro RBQ. Le rapport indique le nombre de plaintes à l\'OPC (Office de la protection du consommateur) et les décisions disciplinaires du Bureau des régisseurs de la RBQ disponibles sur CanLII.',
  },
  {
    question: 'Peut-on vérifier un entrepreneur sans son numéro RBQ ?',
    answer: 'Oui. Vous pouvez rechercher par nom de compagnie. Notre moteur de recherche tolère les fautes d\'orthographe et les variantes de noms pour vous aider à trouver le bon entrepreneur même si vous n\'avez que son nom commercial.',
  },
  {
    question: 'Que faire si mon entrepreneur a un mauvais score ?',
    answer: 'Un score sous 70 mérite vigilance. Demandez à l\'entrepreneur d\'expliquer les événements négatifs dans son dossier. Exigez un contrat écrit détaillé, évitez les paiements en avance importants, et vérifiez s\'il est couvert par la Garantie de construction résidentielle (GCR) pour les constructions neuves.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-background py-16 lg:py-20" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-slate-500 text-lg font-light">
            Tout ce que vous devez savoir pour vérifier un entrepreneur en confiance.
          </p>
        </div>

        <div className="space-y-2.5" role="list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={`bg-white rounded-xl border shadow-saas overflow-hidden transition-colors duration-200 ${
                  isOpen ? 'border-primary/20' : 'border-slate-100'
                }`}
                role="listitem"
              >
                <h3>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className={`font-semibold pr-4 transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-slate-900'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-250 ease-out ${
                        isOpen ? 'rotate-180 text-primary' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`overflow-hidden transition-all duration-250 ease-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{ transitionProperty: 'max-height, opacity' }}
                >
                  <div className="px-5 pb-5 pt-1 text-slate-500 leading-relaxed text-sm border-t border-slate-50">
                    <span id={`faq-question-${index}`} className="sr-only">{faq.question}</span>
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
