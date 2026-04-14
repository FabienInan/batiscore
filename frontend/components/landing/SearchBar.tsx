'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  className?: string
}

export function SearchBar({ variant = 'hero', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query)}`)
    }
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className={`relative ${className}`} role="search">
        <label htmlFor="search-compact" className="sr-only">
          Rechercher un entrepreneur
        </label>
        <div className="flex gap-2 p-1.5 bg-white rounded-xl shadow-lg border border-slate-200 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <Input
              id="search-compact"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, RBQ, NEQ ou téléphone..."
              className="pl-9 border-none focus-visible:ring-0 h-10 text-sm"
              aria-label="Rechercher un entrepreneur par nom, numéro RBQ, NEQ ou téléphone"
            />
          </div>
          <Button type="submit" variant="accent" size="sm" className="h-10 whitespace-nowrap cursor-pointer">
            Vérifier
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`} role="search">
      <label htmlFor="search-hero" className="sr-only">
        Rechercher un entrepreneur
      </label>
      <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all duration-300">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <Input
            id="search-hero"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, numéro RBQ, NEQ ou téléphone..."
            className="pl-9 border-none focus-visible:ring-0 h-11 text-sm"
            aria-label="Rechercher un entrepreneur par nom, numéro RBQ, NEQ ou téléphone"
          />
        </div>
        <Button
          type="submit"
          variant="accent"
          className="h-11 whitespace-nowrap px-5 text-sm font-semibold cursor-pointer shrink-0"
        >
          Vérifier
        </Button>
      </div>
    </form>
  )
}