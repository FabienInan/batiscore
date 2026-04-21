import { HeroSection } from '@/components/landing/HeroSection'
import { RisksSection } from '@/components/landing/RisksSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { SourcesSection } from '@/components/landing/SourcesSection'
import { PhenixSection } from '@/components/landing/PhenixSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { GuidesSection } from '@/components/landing/GuidesSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { VillesGrid } from '@/components/landing/VillesGrid'

export default function Home() {
  return (
    <main>
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