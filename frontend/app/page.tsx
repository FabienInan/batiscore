import { HeroSection } from '@/components/landing/HeroSection'
import { RisksSection } from '@/components/landing/RisksSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { SourcesSection } from '@/components/landing/SourcesSection'
import { PhenixSection } from '@/components/landing/PhenixSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { GuidesSection } from '@/components/landing/GuidesSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { VillesGrid } from '@/components/landing/VillesGrid'

function FaqJsonLd() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Est-ce que la recherche est gratuite ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, la recherche d\'un entrepreneur est 100% gratuite. Vous pouvez vérifier le nom, le numéro RBQ, le statut et le score de fiabilité sans payer.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment vérifier si un entrepreneur a eu des problèmes sous un autre nom ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Certains entrepreneurs ferment leur compagnie pour effacer leurs dettes et leur mauvaise réputation, puis recommencent sous un nouveau nom — souvent avec le même numéro de téléphone et la même adresse. Notre outil détecte automatiquement ces connexions entre entreprises.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment est calculé le score de fiabilité ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le score de 0 à 100 est basé sur : le statut de la licence RBQ, le statut au REQ, les plaintes à l\'OPC, les décisions du Bureau des régisseurs (CanLII), les contrats publics obtenus (SEAO), et la détection de connexions avec des entreprises radiées.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

export default function Home() {
  return (
    <main>
      <FaqJsonLd />
      <HeroSection />
      <RisksSection />
      <HowItWorksSection />
      <SourcesSection />
      <PhenixSection />
      <FaqSection />
      <VillesGrid />
      <GuidesSection />
      <CtaSection />
    </main>
  )
}