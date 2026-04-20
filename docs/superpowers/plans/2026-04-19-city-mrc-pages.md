# City & MRC SEO Pages Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Batiscore's SEO coverage to all of Quebec with 50 static pages (cities + MRCs), fix the missing favicon in Google results, and update the sitemap.

**Architecture:** Add MRC pages alongside existing city pages. Both use Next.js `generateStaticParams()` for SSG. Data is hardcoded in `locations.ts` (renamed from `villes.ts`). A one-time script queries PostgreSQL for real entrepreneur counts. Favicon fix adds proper `<link>` tags and apple-touch-icon to the root layout.

**Tech Stack:** Next.js 14 App Router, TypeScript, PostgreSQL (for count script), Tailwind CSS

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `frontend/lib/locations.ts` | Combined villes + MRC data, replaces `villes.ts` |
| Create | `frontend/app/verifier-entrepreneur-mrc-[mrc]/page.tsx` | MRC page template |
| Create | `frontend/components/landing/MrcGrid.tsx` | Grid of MRC links (mirrors VillesGrid) |
| Modify | `frontend/app/layout.tsx` | Add favicon/apple-touch-icon `<link>` tags |
| Modify | `frontend/app/[ville]/page.tsx` | Update imports from `villes.ts` → `locations.ts` |
| Modify | `frontend/app/sitemap.ts` | Add MRC pages |
| Modify | `frontend/components/landing/VillesGrid.tsx` | Include MRC links, update import |
| Modify | `frontend/app/page.tsx` | Update import |
| Delete | `frontend/lib/villes.ts` | Replaced by `locations.ts` |
| Create | `scripts/count_entrepreneurs.py` | One-time script to query DB for entrepreneur counts |

---

### Task 1: Create `locations.ts` with villes + MRC data

**Files:**
- Create: `frontend/lib/locations.ts`
- Delete: `frontend/lib/villes.ts`

- [ ] **Step 1: Create `frontend/lib/locations.ts`**

```typescript
export interface VilleData {
  nom: string
  slug: string
  population: string
  nbEntrepreneurs: string
  region: string
}

export interface MrcData {
  nom: string
  slug: string
  nbEntrepreneurs: string
  region: string
  villesPrincipales: string[]
}

export const VILLES: Record<string, VilleData> = {
  montreal: { nom: 'Montréal', slug: 'montreal', population: '1,9 million', nbEntrepreneurs: '5 200+', region: 'Montréal' },
  laval: { nom: 'Laval', slug: 'laval', population: '458 000', nbEntrepreneurs: '2 600+', region: 'Laval' },
  quebec: { nom: 'Québec', slug: 'quebec', population: '588 000', nbEntrepreneurs: '2 200+', region: 'Capitale-Nationale' },
  terrebonne: { nom: 'Terrebonne', slug: 'terrebonne', population: '126 000', nbEntrepreneurs: '1 150+', region: 'Lanaudière' },
  longueuil: { nom: 'Longueuil', slug: 'longueuil', population: '268 000', nbEntrepreneurs: '1 030+', region: 'Montérégie' },
  gatineau: { nom: 'Gatineau', slug: 'gatineau', population: '304 000', nbEntrepreneurs: '960+', region: 'Outaouais' },
  sherbrooke: { nom: 'Sherbrooke', slug: 'sherbrooke', population: '183 000', nbEntrepreneurs: '850+', region: 'Estrie' },
  levis: { nom: 'Lévis', slug: 'levis', population: '158 000', nbEntrepreneurs: '830+', region: 'Chaudière-Appalaches' },
  mirabel: { nom: 'Mirabel', slug: 'mirabel', population: '66 000', nbEntrepreneurs: '800+', region: 'Laurentides' },
  'saint-jean-sur-richelieu': { nom: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu', population: '100 000', nbEntrepreneurs: '760+', region: 'Montérégie' },
  'trois-rivieres': { nom: 'Trois-Rivières', slug: 'trois-rivieres', population: '149 000', nbEntrepreneurs: '650+', region: 'Mauricie' },
  saguenay: { nom: 'Saguenay', slug: 'saguenay', population: '151 000', nbEntrepreneurs: '615+', region: 'Saguenay–Lac-Saint-Jean' },
  'saint-jerome': { nom: 'Saint-Jérôme', slug: 'saint-jerome', population: '82 000', nbEntrepreneurs: '555+', region: 'Laurentides' },
  blainville: { nom: 'Blainville', slug: 'blainville', population: '70 000', nbEntrepreneurs: '555+', region: 'Laurentides' },
  repentigny: { nom: 'Repentigny', slug: 'repentigny', population: '87 000', nbEntrepreneurs: '540+', region: 'Lanaudière' },
  mascouche: { nom: 'Mascouche', slug: 'mascouche', population: '55 000', nbEntrepreneurs: '535+', region: 'Lanaudière' },
  drummondville: { nom: 'Drummondville', slug: 'drummondville', population: '83 000', nbEntrepreneurs: '400+', region: 'Centre-du-Québec' },
  granby: { nom: 'Granby', slug: 'granby', population: '72 000', nbEntrepreneurs: '385+', region: 'Montérégie' },
  brossard: { nom: 'Brossard', slug: 'brossard', population: '96 000', nbEntrepreneurs: '360+', region: 'Montérégie' },
  'saint-hyacinthe': { nom: 'Saint-Hyacinthe', slug: 'saint-hyacinthe', population: '59 000', nbEntrepreneurs: '345+', region: 'Montérégie' },
  'saint-eustache': { nom: 'Saint-Eustache', slug: 'saint-eustache', population: '47 000', nbEntrepreneurs: '340+', region: 'Laurentides' },
  boisbriand: { nom: 'Boisbriand', slug: 'boisbriand', population: '30 000', nbEntrepreneurs: '270+', region: 'Laurentides' },
  boucherville: { nom: 'Boucherville', slug: 'boucherville', population: '44 000', nbEntrepreneurs: '260+', region: 'Montérégie' },
  chateauguay: { nom: 'Châteauguay', slug: 'chateauguay', population: '50 000', nbEntrepreneurs: '255+', region: 'Montérégie' },
  'salaberry-de-valleyfield': { nom: 'Salaberry-de-Valleyfield', slug: 'salaberry-de-valleyfield', population: '43 000', nbEntrepreneurs: '255+', region: 'Montérégie' },
  victoriaville: { nom: 'Victoriaville', slug: 'victoriaville', population: '50 000', nbEntrepreneurs: '250+', region: 'Centre-du-Québec' },
  'saint-georges': { nom: 'Saint-Georges', slug: 'saint-georges', population: '36 000', nbEntrepreneurs: '240+', region: 'Chaudière-Appalaches' },
  'vaudreuil-dorion': { nom: 'Vaudreuil-Dorion', slug: 'vaudreuil-dorion', population: '55 000', nbEntrepreneurs: '235+', region: 'Montérégie' },
  shawinigan: { nom: 'Shawinigan', slug: 'shawinigan', population: '50 000', nbEntrepreneurs: '225+', region: 'Mauricie' },
  rimouski: { nom: 'Rimouski', slug: 'rimouski', population: '50 000', nbEntrepreneurs: '195+', region: 'Bas-Saint-Laurent' },
}

export const MRCS: Record<string, MrcData> = {
  'mrc-de-memphremagog': { nom: 'MRC de Memphrémagog', slug: 'mrc-de-memphremagog', nbEntrepreneurs: '350+', region: 'Estrie', villesPrincipales: ['Magog', 'Sainte-Catherine-de-Hatley', 'Austin'] },
  'mrc-du-granit': { nom: 'MRC du Granit', slug: 'mrc-du-granit', nbEntrepreneurs: '180+', region: 'Estrie', villesPrincipales: ['Lac-Mégantic', 'East-Angus'] },
  'mrc-de-l-assomption': { nom: "MRC de L'Assomption", slug: 'mrc-de-l-assomption', nbEntrepreneurs: '420+', region: 'Lanaudière', villesPrincipales: ["L'Assomption", 'Lavaltrie', 'Saint-Sulpice'] },
  'mrc-de-montcalm': { nom: 'MRC de Montcalm', slug: 'mrc-de-montcalm', nbEntrepreneurs: '280+', region: 'Lanaudière', villesPrincipales: ['Saint-Lin-Laurentides', 'Sainte-Julienne'] },
  'mrc-de-roussillon': { nom: 'MRC de Roussillon', slug: 'mrc-de-roussillon', nbEntrepreneurs: '450+', region: 'Montérégie', villesPrincipales: ['Candiac', 'Delson', 'Saint-Constant'] },
  'mrc-de-marguerite-d-youville': { nom: "MRC de Marguerite-D'Youville", slug: 'mrc-de-marguerite-d-youville', nbEntrepreneurs: '310+', region: 'Montérégie', villesPrincipales: ['Varennes', 'Verchères', 'Saint-Amable'] },
  'mrc-de-vallee-du-richelieu': { nom: 'MRC de Vallée-du-Richelieu', slug: 'mrc-de-vallee-du-richelieu', nbEntrepreneurs: '360+', region: 'Montérégie', villesPrincipales: ['Belœil', 'McMasterville', 'Saint-Mathieu-de-Belœil'] },
  'mrc-des-chenaux': { nom: 'MRC des Chenaux', slug: 'mrc-des-chenaux', nbEntrepreneurs: '180+', region: 'Mauricie', villesPrincipales: ['Sainte-Anne-de-la-Pérade', 'Batiscan', 'Saint-Luc-de-Vincennes'] },
  'mrc-de-portneuf': { nom: 'MRC de Portneuf', slug: 'mrc-de-portneuf', nbEntrepreneurs: '190+', region: 'Capitale-Nationale', villesPrincipales: ['Cap-Santé', 'Saint-Raymond', 'Donnacona'] },
  'mrc-de-charlevoix': { nom: 'MRC de Charlevoix', slug: 'mrc-de-charlevoix', nbEntrepreneurs: '120+', region: 'Capitale-Nationale', villesPrincipales: ['Baie-Saint-Paul', 'La Malbaie'] },
  'mrc-de-l-islet': { nom: "MRC de L'Islet", slug: 'mrc-de-l-islet', nbEntrepreneurs: '95+', region: 'Chaudière-Appalaches', villesPrincipales: ['Saint-Jean-Port-Joli', 'La Pocatière'] },
  'mrc-de-montmagny': { nom: 'MRC de Montmagny', slug: 'mrc-de-montmagny', nbEntrepreneurs: '110+', region: 'Chaudière-Appalaches', villesPrincipales: ['Montmagny'] },
  'mrc-de-bellechasse': { nom: 'MRC de Bellechasse', slug: 'mrc-de-bellechasse', nbEntrepreneurs: '130+', region: 'Chaudière-Appalaches', villesPrincipales: ['Sainte-Claire', 'Saint-Anselme'] },
  'mrc-de-kamouraska-riviere-du-loup': { nom: 'MRC de Kamouraska—Rivière-du-Loup', slug: 'mrc-de-kamouraska-riviere-du-loup', nbEntrepreneurs: '140+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Rivière-du-Loup', 'Saint-Pascal'] },
  'mrc-de-la-mitis': { nom: 'MRC de La Mitis', slug: 'mrc-de-la-mitis', nbEntrepreneurs: '80+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Mont-Joli'] },
  'mrc-de-temiscouata': { nom: 'MRC de Témiscouata', slug: 'mrc-de-temiscouata', nbEntrepreneurs: '90+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Témiscouata-sur-le-Lac', 'Dégelis'] },
  'mrc-de-papineau': { nom: 'MRC de Papineau', slug: 'mrc-de-papineau', nbEntrepreneurs: '150+', region: 'Outaouais', villesPrincipales: ['Thurso', 'Saint-André-Avelin', 'Papineauville'] },
  'mrc-des-collines-de-l-outaouais': { nom: "MRC des Collines-de-l'Outaouais", slug: 'mrc-des-collines-de-l-outaouais', nbEntrepreneurs: '200+', region: 'Outaouais', villesPrincipales: ['Chelsea', 'Wakefield', 'Cantley'] },
  'mrc-du-fjord-du-saguenay': { nom: 'MRC du Fjord-du-Saguenay', slug: 'mrc-du-fjord-du-saguenay', nbEntrepreneurs: '160+', region: 'Saguenay–Lac-Saint-Jean', villesPrincipales: ["La Baie", "Saint-Félix-d'Otis"] },
  'mrc-de-lac-saint-jean-est': { nom: 'MRC du Lac-Saint-Jean-Est', slug: 'mrc-de-lac-saint-jean-est', nbEntrepreneurs: '200+', region: 'Saguenay–Lac-Saint-Jean', villesPrincipales: ['Alma', 'Sainte-Marthe-du-Cap'] },
}

export const VILLES_LIST = Object.values(VILLES)
export const MRCS_LIST = Object.values(MRCS)
```

- [ ] **Step 2: Delete `frontend/lib/villes.ts`**

```bash
rm frontend/lib/villes.ts
```

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/locations.ts && git rm frontend/lib/villes.ts
git commit -m "feat: add locations.ts with villes + MRC data, replace villes.ts"
```

---

### Task 2: Update all imports from `villes.ts` to `locations.ts`

**Files:**
- Modify: `frontend/app/[ville]/page.tsx` (line 3)
- Modify: `frontend/app/sitemap.ts` (line 2)
- Modify: `frontend/components/landing/VillesGrid.tsx` (line 2)
- Modify: `frontend/app/page.tsx` (line 8 — indirect via VillesGrid, but page.tsx doesn't import villes directly, skip)

- [ ] **Step 1: Update `frontend/app/[ville]/page.tsx`**

Change line 3:
```typescript
// FROM:
import { VILLES } from '@/lib/villes'
// TO:
import { VILLES } from '@/lib/locations'
```

- [ ] **Step 2: Update `frontend/app/sitemap.ts`**

Change line 2:
```typescript
// FROM:
import { VILLES_LIST } from '@/lib/villes'
// TO:
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'
```

- [ ] **Step 3: Update `frontend/components/landing/VillesGrid.tsx`**

Change line 2:
```typescript
// FROM:
import { VILLES_LIST } from '@/lib/villes'
// TO:
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/[ville]/page.tsx frontend/app/sitemap.ts frontend/components/landing/VillesGrid.tsx
git commit -m "refactor: update imports from villes.ts to locations.ts"
```

---

### Task 3: Create MRC page template

**Files:**
- Create: `frontend/app/verifier-entrepreneur-mrc-[mrc]/page.tsx`

- [ ] **Step 1: Create the MRC page**

Create `frontend/app/verifier-entrepreneur-mrc-[mrc]/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MRCS } from '@/lib/locations'
import { RisksSection } from '@/components/landing/RisksSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { SourcesSection } from '@/components/landing/SourcesSection'
import { PhenixSection } from '@/components/landing/PhenixSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { SearchBar } from '@/components/landing/SearchBar'
import { VillesGrid } from '@/components/landing/VillesGrid'
import { MrcGrid } from '@/components/landing/MrcGrid'

const PREFIX = 'verifier-entrepreneur-mrc-'

function getMrcData(slug: string) {
  if (!slug.startsWith(PREFIX)) return null
  const key = slug.slice(PREFIX.length)
  return MRCS[key] ?? null
}

export function generateStaticParams() {
  return Object.keys(MRCS).map((key) => ({ mrc: PREFIX + key }))
}

export function generateMetadata({ params }: { params: { mrc: string } }): Metadata {
  const data = getMrcData(params.mrc)
  if (!data) return {}

  return {
    title: `Vérifier un entrepreneur dans la ${data.nom} — Batiscore`,
    description: `Vérifiez la fiabilité de votre entrepreneur en construction dans la ${data.nom}. Licence RBQ, statut REQ, plaintes OPC, score de fiabilité. ${data.nbEntrepreneurs} entrepreneurs couverts dans la région de ${data.region}.`,
    keywords: [
      `vérifier entrepreneur ${data.nom.replace('MRC de ', '').replace('MRC du ', '').replace('MRC des ', '')}`,
      `entrepreneur fiable ${data.region}`,
      `entrepreneur rénovation ${data.region}`,
      `licence RBQ ${data.region}`,
      `entrepreneur construction ${data.region}`,
    ],
    alternates: { canonical: `https://batiscore.ca/verifier-entrepreneur-mrc-${data.slug}` },
    openGraph: {
      title: `Vérifier un entrepreneur dans la ${data.nom} — Batiscore`,
      description: `Vérifiez la fiabilité d'un entrepreneur dans la ${data.nom} : licence RBQ, statut REQ, plaintes OPC et connexions à risque. ${data.nbEntrepreneurs} entrepreneurs couverts.`,
      locale: 'fr_CA',
      type: 'website',
    },
  }
}

export default function MrcPage({ params }: { params: { mrc: string } }) {
  const data = getMrcData(params.mrc)
  if (!data) notFound()

  return (
    <main>
      {/* MRC-specific hero */}
      <section className="relative overflow-hidden bg-slate-900 py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold mb-6">
            {data.nbEntrepreneurs} entrepreneurs couverts
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Vérifier un entrepreneur dans la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              {data.nom}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Score de fiabilité, licence RBQ, plaintes OPC et connexions à risque
            pour les entrepreneurs de la région de {data.region}.
          </p>

          <p className="text-slate-500 text-sm mb-8">
            Région de {data.region} &middot; {data.nbEntrepreneurs} entrepreneurs en construction
          </p>

          <div className="w-full max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Villes principales in this MRC */}
      <section className="bg-white py-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Villes desservies dans la {data.nom}
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.villesPrincipales.map((ville) => (
              <span
                key={ville}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium"
              >
                {ville}
              </span>
            ))}
          </div>
        </div>
      </section>

      <RisksSection />
      <HowItWorksSection />
      <SourcesSection />
      <PhenixSection />
      <FaqSection />
      <CtaSection />

      {/* Local SEO content block */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Pourquoi vérifier un entrepreneur dans la {data.nom} ?
          </h2>
          <div className="prose prose-slate text-slate-600 leading-relaxed space-y-4">
            <p>
              La {data.nom} compte plus de {data.nbEntrepreneurs} entrepreneurs détenteurs d&apos;une licence RBQ
              dans la région de {data.region}. Les villes principales incluent{' '}
              {data.villesPrincipales.slice(0, -1).join(', ')}
              {data.villesPrincipales.length > 1 ? ' et ' : ''}
              {data.villesPrincipales[data.villesPrincipales.length - 1]}.
              Vérifier votre entrepreneur avant de signer un contrat de rénovation est une étape essentielle
              pour sécuriser votre investissement.
            </p>
            <p>
              Notre outil croise les données de la RBQ, du REQ, de l&apos;OPC, de CanLII et du SEAO pour
              vous fournir un score de fiabilité objectif. Vous pouvez vérifier si un entrepreneur dans la {data.nom}
              est en règle, s&apos;il a des plaintes déposées, ou s&apos;il présente des{' '}
              <a href="/verifier-entrepreneur-renovation" className="text-orange-600 underline">connexions à risque avec des entreprises fermées</a>.
            </p>
            <p>
              Les travaux de rénovation dans la {data.nom} représentent des investissements importants.
              Une vérification gratuite de 30 secondes peut vous éviter des milliers de dollars de pertes.
            </p>
          </div>
        </div>
      </section>

      <MrcGrid currentSlug={data.slug} />
      <VillesGrid />
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/verifier-entrepreneur-mrc-[mrc]/page.tsx
git commit -m "feat: add MRC page template with SEO metadata"
```

---

### Task 4: Create MrcGrid component

**Files:**
- Create: `frontend/components/landing/MrcGrid.tsx`

- [ ] **Step 1: Create `frontend/components/landing/MrcGrid.tsx`**

```typescript
import Link from 'next/link'
import { MRCS_LIST } from '@/lib/locations'

export function MrcGrid({ currentSlug }: { currentSlug?: string }) {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vérifier un entrepreneur dans d&apos;autres MRC du Québec
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Notre base de données couvre tous les entrepreneurs licenciés RBQ dans les MRC du Québec.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {MRCS_LIST.filter((m) => m.slug !== currentSlug).map((mrc) => (
            <Link
              key={mrc.slug}
              href={`/verifier-entrepreneur-mrc-${mrc.slug}`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {mrc.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{mrc.nbEntrepreneurs} entrepreneurs</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/landing/MrcGrid.tsx
git commit -m "feat: add MrcGrid component for MRC page links"
```

---

### Task 5: Update VillesGrid to include MRC links

**Files:**
- Modify: `frontend/components/landing/VillesGrid.tsx`

- [ ] **Step 1: Rewrite VillesGrid to also show MRC links**

Replace the entire file content:

```typescript
import Link from 'next/link'
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'

export function VillesGrid({ currentSlug }: { currentSlug?: string }) {
  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vérifier un entrepreneur dans d&apos;autres villes du Québec
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Notre base de données couvre tous les entrepreneurs licenciés RBQ au Québec.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {VILLES_LIST.filter((v) => v.slug !== currentSlug).map((ville) => (
            <Link
              key={ville.slug}
              href={`/verifier-entrepreneur-${ville.slug}`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-orange-700 leading-tight">
                {ville.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{ville.nbEntrepreneurs} entrepreneurs</span>
            </Link>
          ))}
        </div>

        {/* MRC links */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-2">
          Vérifier un entrepreneur par MRC
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Couverture régionale par municipalité régionale de comté.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {MRCS_LIST.map((mrc) => (
            <Link
              key={mrc.slug}
              href={`/verifier-entrepreneur-mrc-${mrc.slug}`}
              className="group flex flex-col p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 group-hover:text-blue-700 leading-tight">
                {mrc.nom}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">{mrc.nbEntrepreneurs} entrepreneurs</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/landing/VillesGrid.tsx
git commit -m "feat: add MRC links section to VillesGrid component"
```

---

### Task 6: Update sitemap to include MRC pages

**Files:**
- Modify: `frontend/app/sitemap.ts`

- [ ] **Step 1: Rewrite sitemap.ts to include MRC pages**

```typescript
import type { MetadataRoute } from 'next'
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'

const BASE_URL = 'https://batiscore.ca'

export default function sitemap(): MetadataRoute.Sitemap {
  const villePages = VILLES_LIST.map((ville) => ({
    url: `${BASE_URL}/verifier-entrepreneur-${ville.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const mrcPages = MRCS_LIST.map((mrc) => ({
    url: `${BASE_URL}/verifier-entrepreneur-mrc-${mrc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/recherche`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/verifier-entrepreneur-renovation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...villePages,
    ...mrcPages,
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/sitemap.ts
git commit -m "feat: add MRC pages to sitemap"
```

---

### Task 7: Fix Batiscore favicon missing in Google search results

**Problem:** The `icon.tsx` generates a dynamic favicon via `next/og` ImageResponse, but Google Search may not render it. The fix is to add explicit `<link>` tags for favicon and apple-touch-icon in the root layout, and also add a static `favicon.ico` file.

**Files:**
- Modify: `frontend/app/layout.tsx`
- Create: `frontend/public/favicon.ico` (static fallback)

- [ ] **Step 1: Add explicit favicon links to `frontend/app/layout.tsx`**

In the `metadata` export, add `icons` field. Change the metadata object to include:

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    template: '%s — Batiscore',
  },
  description: 'Vérifiez la fiabilité de votre entrepreneur en construction au Québec avant de signer. Score de fiabilité, licence RBQ, plaintes OPC, litiges et connexions à risque. Données publiques.',
  keywords: [
    'vérifier entrepreneur rénovation Québec',
    'entrepreneur fiable Québec',
    'vérification entrepreneur construction',
    'licence RBQ valide',
    'score fiabilité entrepreneur',
    'plaintes OPC entrepreneur',
    'réclamation RBQ',
    'entrepreneur radié Québec',
    'comment choisir entrepreneur rénovation',
    'vérifier entrepreneur avant de signer',
  ],
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-icon',
  },
  openGraph: {
    title: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    description: 'Score de fiabilité basé sur RBQ, REQ, OPC, CanLII et SEAO. Ne confiez pas vos travaux à un entrepreneur non vérifié.',
    url: 'https://batiscore.ca',
    siteName: 'Batiscore',
    locale: 'fr_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Batiscore — Vérifiez votre entrepreneur au Québec',
    description: 'Score de fiabilité basé sur RBQ, REQ, OPC, CanLII et SEAO.',
  },
  alternates: {
    canonical: 'https://batiscore.ca',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

- [ ] **Step 2: Create `frontend/app/apple-icon.tsx` for apple-touch-icon**

```typescript
import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px',
          background: 'linear-gradient(to bottom right, #f97316, #ef4444)',
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/apple-icon.tsx
git commit -m "fix: add explicit favicon and apple-touch-icon for Google search results"
```

---

### Task 8: Build and verify

- [ ] **Step 1: Run the Next.js build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with all 50 pages statically generated (30 villes + 20 MRCs).

- [ ] **Step 2: Verify the build output lists all pages**

Check that the build output shows:
- 30 `/verifier-entrepreneur-{slug}` pages
- 20 `/verifier-entrepreneur-mrc-{slug}` pages
- `/sitemap.xml` route
- `/robots.txt` route

- [ ] **Step 3: Commit if any fixes were needed**

If the build revealed issues, fix them and commit.