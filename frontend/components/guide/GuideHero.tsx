import { SearchBar } from '@/components/landing/SearchBar'

interface GuideHeroProps {
  badge: string
  title: string
  titleHighlight: string
  subtitle: string
}

export function GuideHero({ badge, title, titleHighlight, subtitle }: GuideHeroProps) {
  return (
    <section className="bg-slate-900 py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
          {badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
          {title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
            {titleHighlight}
          </span>
        </h1>
        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <SearchBar variant="compact" />
      </div>
    </section>
  )
}