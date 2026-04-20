# SEO Content Strategy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 5 static guide pages, fix existing SEO issues, add internal links, add GoatCounter events on rapport views.

**Architecture:** Server-component guide pages following the existing `/verifier-entrepreneur-renovation` pattern. Each page exports `metadata` + renders a `<main>` with hero, article content, CTA, and FAQ. Shared components (`GuideHero`, `GuideCta`) avoid duplication. SEO fixes target sitemap, JSON-LD, and internal linking.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, GoatCounter analytics

---

### Task 1: Shared guide components (GuideHero, GuideCta)

**Files:**
- Create: `frontend/components/guide/GuideHero.tsx`
- Create: `frontend/components/guide/GuideCta.tsx`

- [ ] **Step 1: Create GuideHero component**

Create `frontend/components/guide/GuideHero.tsx`:

```tsx
import Link from 'next/link'
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
        <div className="w-full max-w-xl mx-auto">
          <SearchBar variant="compact" />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create GuideCta component**

Create `frontend/components/guide/GuideCta.tsx`:

```tsx
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
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-400 mb-8">{description}</p>
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
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/guide/GuideHero.tsx frontend/components/guide/GuideCta.tsx
git commit -m "feat: add GuideHero and GuideCta shared components"
```

---

### Task 2: Guide page — /guides/verifier-licence-rbq

**Files:**
- Create: `frontend/app/guides/verifier-licence-rbq/page.tsx`

- [ ] **Step 1: Create the guide page**

Create `frontend/app/guides/verifier-licence-rbq/page.tsx` with full metadata, Article+FAQPage+BreadcrumbList JSON-LD, editorial content (~1000 words), and CTA. Follow the pattern from `/verifier-entrepreneur-renovation/page.tsx`. Content covers: what is a licence RBQ, who needs one, legal requirement, how to verify, what statuts mean, general vs specialized licences, what to do if licence is invalid. FAQ: 3 questions. Cross-links to `/guides/societe-phenix`, `/guides/entrepreneur-sans-licence`, and ville pages.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/guides/verifier-licence-rbq/page.tsx
git commit -m "feat: add /guides/verifier-licence-rbq guide page"
```

---

### Task 3: Guide page — /guides/entrepreneur-sans-licence

**Files:**
- Create: `frontend/app/guides/entrepreneur-sans-licence/page.tsx`

- [ ] **Step 1: Create the guide page**

Same pattern as Task 2. Content covers: legal framework ($20,000 threshold), penalties (fines $3,000-$30,000, criminal), risks for homeowners (no warranty, no insurance, no recourse), what to do if you hired an unlicensed contractor, how to check before hiring. FAQ: 3 questions. Cross-links to `/guides/verifier-licence-rbq`, `/guides/plainte-opc-entrepreneur`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/guides/entrepreneur-sans-licence/page.tsx
git commit -m "feat: add /guides/entrepreneur-sans-licence guide page"
```

---

### Task 4: Guide page — /guides/societe-phenix

**Files:**
- Create: `frontend/app/guides/societe-phenix/page.tsx`

- [ ] **Step 1: Create the guide page**

Same pattern. Content covers: definition of société phénix, warning signs (same phone, same address, same directors, recent incorporation), real examples from Quebec construction, how Batiscore detects phénix companies (network analysis, scoring), what to do if you suspect a phénix company. FAQ: 3 questions. Cross-links to `/guides/verifier-licence-rbq`, `/guides/reclamation-rbq`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/guides/societe-phenix/page.tsx
git commit -m "feat: add /guides/societe-phenix guide page"
```

---

### Task 5: Guide page — /guides/plainte-opc-entrepreneur

**Files:**
- Create: `frontend/app/guides/plainte-opc-entrepreneur/page.tsx`

- [ ] **Step 1: Create the guide page**

Same pattern. Content covers: when to file a complaint with OPC, step-by-step process (gather evidence, file online, follow up), what OPC can do (mediation, investigation, prosecution), time limits and deadlines, alternative recourses (RBQ, small claims court). FAQ: 3 questions. Cross-links to `/guides/reclamation-rbq`, `/guides/entrepreneur-sans-licence`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/guides/plainte-opc-entrepreneur/page.tsx
git commit -m "feat: add /guides/plainte-opc-entrepreneur guide page"
```

---

### Task 6: Guide page — /guides/reclamation-rbq

**Files:**
- Create: `frontend/app/guides/reclamation-rbq/page.tsx`

- [ ] **Step 1: Create the guide page**

Same pattern. Content covers: garantie plan renovation (what it covers), when and how to file a reclamation with RBQ, types of reclamations (unfinished work, defects, non-compliance), process timeline and expected outcomes, difference between reclamation and plainte OPC. FAQ: 3 questions. Cross-links to `/guides/plainte-opc-entrepreneur`, `/guides/societe-phenix`.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/guides/reclamation-rbq/page.tsx
git commit -m "feat: add /guides/reclamation-rbq guide page"
```

---

### Task 7: Sitemap, internal links, and navigation updates

**Files:**
- Modify: `frontend/app/sitemap.ts` — remove `/recherche`, add `/pro`, add 5 guide pages
- Modify: `frontend/components/layout.tsx` — add "Guides" column in footer, add "Guides" link in mobile menu
- Create: `frontend/components/landing/GuidesSection.tsx` — home page section linking to all 5 guides
- Modify: `frontend/app/page.tsx` — add `<GuidesSection />` before `<CtaSection />`

- [ ] **Step 1: Update sitemap**

In `frontend/app/sitemap.ts`, remove the `/recherche` entry (it has noindex), add `/pro` and 5 guide entries:

```ts
// Remove this entry:
// { url: `${BASE_URL}/recherche`, ... },

// Add these entries:
{
  url: `${BASE_URL}/pro`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.6,
},
{
  url: `${BASE_URL}/guides/verifier-licence-rbq`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
},
{
  url: `${BASE_URL}/guides/entrepreneur-sans-licence`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
},
{
  url: `${BASE_URL}/guides/societe-phenix`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
},
{
  url: `${BASE_URL}/guides/plainte-opc-entrepreneur`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
},
{
  url: `${BASE_URL}/guides/reclamation-rbq`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.8,
},
```

- [ ] **Step 2: Create GuidesSection component**

Create `frontend/components/landing/GuidesSection.tsx`:

```tsx
import Link from 'next/link'

const GUIDES = [
  {
    href: '/guides/verifier-licence-rbq',
    title: 'Vérifier une licence RBQ',
    description: 'Comment vérifier si une licence RBQ est valide et ce que signifient les différents statuts.',
  },
  {
    href: '/guides/entrepreneur-sans-licence',
    title: 'Entrepreneur sans licence',
    description: 'Les risques de travailler avec un entrepreneur sans licence RBQ et les recours disponibles.',
  },
  {
    href: '/guides/societe-phenix',
    title: 'Société phénix',
    description: 'Comment détecter une entreprise relance : même téléphone, même adresse, nouveau nom.',
  },
  {
    href: '/guides/plainte-opc-entrepreneur',
    title: 'Plainte à l\'OPC',
    description: 'Comment déposer une plainte contre un entrepreneur à l\'Office de la protection du consommateur.',
  },
  {
    href: '/guides/reclamation-rbq',
    title: 'Réclamation RBQ',
    description: 'Comprendre la garantie plan rénovation et comment faire une réclamation auprès de la RBQ.',
  },
]

export function GuidesSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
          Guides et ressources
        </h2>
        <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
          Tout ce que vous devez savoir avant d&apos;engager un entrepreneur en construction au Québec.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-2">
                {guide.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add GuidesSection to home page**

In `frontend/app/page.tsx`, add `GuidesSection` before `CtaSection`:

```tsx
import { GuidesSection } from '@/components/landing/GuidesSection'

// ... in the return JSX, add before <CtaSection />:
<GuidesSection />
```

- [ ] **Step 4: Update footer with Guides column**

In `frontend/components/layout.tsx`, add a "Guides" column in the footer grid (change `grid-cols-3` to `grid-cols-4`, add a new column):

Add a new `<div>` in the footer grid after "Navigation":

```tsx
<div>
  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Guides</h3>
  <ul className="space-y-1.5 text-xs text-slate-500">
    <li><Link href="/guides/verifier-licence-rbq" className="hover:text-slate-300 transition-colors cursor-pointer">Vérifier une licence RBQ</Link></li>
    <li><Link href="/guides/entrepreneur-sans-licence" className="hover:text-slate-300 transition-colors cursor-pointer">Entrepreneur sans licence</Link></li>
    <li><Link href="/guides/societe-phenix" className="hover:text-slate-300 transition-colors cursor-pointer">Société phénix</Link></li>
    <li><Link href="/guides/plainte-opc-entrepreneur" className="hover:text-slate-300 transition-colors cursor-pointer">Plainte à l'OPC</Link></li>
    <li><Link href="/guides/reclamation-rbq" className="hover:text-slate-300 transition-colors cursor-pointer">Réclamation RBQ</Link></li>
  </ul>
</div>
```

And change `grid-cols-1 md:grid-cols-3` to `grid-cols-1 md:grid-cols-4` on the footer grid.

- [ ] **Step 5: Add Guides to mobile menu**

In the Header component's mobile nav, add a link to `/guides/verifier-licence-rbq` labeled "Guides".

- [ ] **Step 6: Commit**

```bash
git add frontend/app/sitemap.ts frontend/components/landing/GuidesSection.tsx frontend/app/page.tsx frontend/components/layout.tsx
git commit -m "feat: add Guides section, update sitemap, footer, and navigation"
```

---

### Task 8: SEO fixes on existing pages

**Files:**
- Modify: `frontend/app/layout.tsx` — move FAQPage JSON-LD to home page only
- Modify: `frontend/app/page.tsx` — add FAQPage JSON-LD component
- Modify: `frontend/app/verifier-entrepreneur-renovation/page.tsx` — add HowTo + FAQPage JSON-LD
- Modify: `frontend/app/entrepreneur/[id]/page.tsx` — add link to ville page and guide

- [ ] **Step 1: Move FAQPage JSON-LD from layout to home page**

In `frontend/app/layout.tsx`, remove the `faqSchema` object and its `<script>` tag from the `JsonLd` component. Keep only `organizationSchema` and `websiteSchema`.

In `frontend/app/page.tsx`, add a `FaqJsonLd` component that renders the FAQPage schema. Import `FaqSection`'s data or hard-code the 3 FAQ items (matching the existing ones in layout.tsx).

- [ ] **Step 2: Add HowTo + FAQPage JSON-LD to guide page**

In `frontend/app/verifier-entrepreneur-renovation/page.tsx`, add a `HowToJsonLd` component with the 5 verification steps from the article, and a `FaqJsonLd` component with the 4 FAQ items already in the page.

- [ ] **Step 3: Add contextual links to entrepreneur page**

In `frontend/app/entrepreneur/[id]/EntrepreneurContent.tsx`, add a section after the categories/RBQ info that links to the guide about verifying a licence:

```tsx
<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
  <a href="/guides/verifier-licence-rbq" className="hover:underline">
    En savoir plus sur la licence RBQ →
  </a>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/page.tsx frontend/app/verifier-entrepreneur-renovation/page.tsx frontend/app/entrepreneur/[id]/EntrepreneurContent.tsx
git commit -m "fix: move FAQ JSON-LD to home only, add HowTo schema to guide, link entrepreneur pages"
```

---

### Task 9: GoatCounter analytics on rapport views

**Files:**
- Modify: `frontend/app/rapport/[id]/RapportContent.tsx` — add GoatCounter page event on load

- [ ] **Step 1: Add GoatCounter event tracking to rapport page**

GoatCounter tracks page views automatically via the global script. To track report *views* as distinct events (so we can count how many entrepreneurs' reports are viewed), add a custom event in the `useEffect` that fetches the report data.

In the rapport page's client component, after the data fetch succeeds, call:

```tsx
if (typeof window !== 'undefined' && (window as any).goatcounter) {
  (window as any).goatcounter.count({
    path: `/rapport/view/${data.contractor.nom}`,
    title: `Rapport: ${data.contractor.nom}`,
  })
}
```

This sends a custom page count event to GoatCounter each time a full report is viewed, separate from the regular page view.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/rapport/[id]/RapportContent.tsx
git commit -m "feat: add GoatCounter event tracking on rapport views"
```

---

### Task 10: Build verification and deploy

- [ ] **Step 1: Run local build to verify no errors**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no errors. All 5 new guide pages are listed in the build output.

- [ ] **Step 2: Verify all new routes in development**

```bash
cd frontend && npm run dev
```

Visit each guide page and verify:
- `/guides/verifier-licence-rbq` renders correctly
- `/guides/entrepreneur-sans-licence` renders correctly
- `/guides/societe-phenix` renders correctly
- `/guides/plainte-opc-entrepreneur` renders correctly
- `/guides/reclamation-rbq` renders correctly
- Home page shows the Guides section
- Footer shows Guides column
- Sitemap at `/sitemap.xml` includes all guide URLs and excludes `/recherche`

- [ ] **Step 3: Commit and push**

```bash
git push origin main
```

- [ ] **Step 4: Deploy on server**

```bash
cd /var/www/batiscore/frontend
git pull
npm install
npm run build
pm2 restart batiscore-frontend
```