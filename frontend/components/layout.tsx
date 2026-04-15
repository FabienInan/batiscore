'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Shield, Menu, X } from 'lucide-react'

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-white hover:text-orange-400 transition-colors cursor-pointer shrink-0"
          aria-label="Batiscore — Accueil"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
            <Shield size={14} className="text-white" aria-hidden="true" />
          </div>
          <span className="tracking-tight">Batiscore</span>
        </Link>

        {/* Nav links — desktop only */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400" aria-label="Navigation principale">
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">Accueil</Link>
          <Link href="/pro" className="hover:text-white transition-colors cursor-pointer">Pour les Pros</Link>
          <Link href="/contact" className="hover:text-white transition-colors cursor-pointer">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* CTA — always visible */}
          <Link
            href="/recherche"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
            aria-label="Rechercher un entrepreneur"
          >
            <Search size={14} aria-hidden="true" />
            <span>Vérifier</span>
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pb-4 flex flex-col gap-1"
          aria-label="Navigation mobile"
        >
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white py-2.5 border-b border-slate-800 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link
            href="/pro"
            className="text-sm font-medium text-slate-300 hover:text-white py-2.5 border-b border-slate-800 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Pour les Pros
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-slate-300 hover:text-white py-2.5 border-b border-slate-800 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/verifier-entrepreneur-renovation"
            className="text-sm font-medium text-slate-300 hover:text-white py-2.5 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Guide de vérification
          </Link>
        </nav>
      )}
    </header>
  )
}

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 mt-16 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                <Shield size={12} className="text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-white">Batiscore</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vérification des entrepreneurs en construction au Québec à partir des données publiques officielles.
            </p>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Sources officielles</h3>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>Régie du bâtiment du Québec (RBQ)</li>
              <li>Registre des entreprises du Québec (REQ)</li>
              <li>Office de la protection du consommateur (OPC)</li>
              <li>CanLII &amp; SEAO</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><Link href="/" className="hover:text-slate-300 transition-colors cursor-pointer">Accueil</Link></li>
              <li><Link href="/recherche" className="hover:text-slate-300 transition-colors cursor-pointer">Rechercher un entrepreneur</Link></li>
              <li><Link href="/pro" className="hover:text-slate-300 transition-colors cursor-pointer">Pour les professionnels</Link></li>
              <li><Link href="/contact" className="hover:text-slate-300 transition-colors cursor-pointer">Contact</Link></li>
              <li><Link href="/verifier-entrepreneur-renovation" className="hover:text-slate-300 transition-colors cursor-pointer">Guide de vérification</Link></li>
              <li><Link href="/termes-et-conditions" className="hover:text-slate-300 transition-colors cursor-pointer">Termes et conditions</Link></li>
              <li><Link href="/politique-de-confidentialite" className="hover:text-slate-300 transition-colors cursor-pointer">Politique de confidentialité</Link></li>
              <li><Link href="/contester" className="hover:text-slate-300 transition-colors cursor-pointer">Contester les informations</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Batiscore. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-700">
            <Link href="/termes-et-conditions" className="hover:text-slate-500 transition-colors">Termes et conditions</Link>
            {' · '}<Link href="/politique-de-confidentialite" className="hover:text-slate-500 transition-colors">Politique de confidentialité</Link>
            {' · '}Données issues de sources publiques
          </p>
        </div>
      </div>
    </footer>
  )
}
