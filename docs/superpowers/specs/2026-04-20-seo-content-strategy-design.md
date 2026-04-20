# SEO Content Strategy — Batiscore

**Date:** 2026-04-20
**Goal:** Generate organic traffic from informational queries + convert to search/report
**Scope:** 7 new pages (5 static + 2 dynamic) + SEO fixes on existing pages

---

## 1. New Pages

### 1.1 Static Guide Pages (5 pages)

All under `/guides/` route prefix. Each page is a server component with full metadata, JSON-LD, and editorial content (~800-1500 words).

| Slug | Title | Target Queries | CTA |
|---|---|---|---|
| `/guides/verifier-licence-rbq` | Comment verifier une licence RBQ | "verifier licence RBQ", "licence RBQ valide", "verifier statut RBQ" | Search bar |
| `/guides/entrepreneur-sans-licence` | Travailler avec un entrepreneur sans licence RBQ | "travailler sans licence RBQ", "amende entrepreneur sans licence", "constructeur sans licence" | Search bar |
| `/guides/societe-phenix` | Societe phenix en construction | "societe phenix Quebec", "entrepreneur change de nom", "entreprise relance construction" | Search bar |
| `/guides/plainte-opc-entrepreneur` | Comment deposer une plainte contre un entrepreneur a l'OPC | "plainte entrepreneur OPC", "deposer plainte renovation", "signaler entrepreneur" | Search bar |
| `/guides/reclamation-rbq` | Reclamation RBQ — Garantie plan renovation | "reclamation RBQ", "garantie plan renovation", "recours entrepreneur mauvais travail" | Search bar |

### 1.2 Dynamic Pages (2 page types, ~30 instances)

| Slug | Title | Data Source |
|---|---|---|
| `/guides/meilleurs-entrepreneurs-{ville}` | Les meilleurs entrepreneurs en renovation a {Ville} | API: `GET /api/top-entrepreneurs?ville={slug}&limit=10` |
| `/guides/statistiques-entrepreneurs-{region}` | Statistiques des entrepreneurs en construction — {Region} | API: `GET /api/stats-entrepreneurs?region={slug}` |

The dynamic pages use `generateStaticParams` based on existing villes (28) and regions (13) from `lib/locations.ts`.

---

## 2. Page Template — Static Guides

Each static guide page follows this structure:

1. **Hero** — H1 title, 1-2 sentence intro, SearchBar component
2. **Editorial content** — 800-1500 words with H2/H3 sections, lists, data points
3. **Contextual CTA** — "Verifiez votre entrepreneur maintenant" linking to `/recherche`
4. **FAQ section** — 3-5 questions with `FAQPage` JSON-LD
5. **Cross-links** — Links to 2-3 related guides + 2-3 ville pages
6. **Breadcrumb** — `Accueil > Guides > {title}`

Each page exports:
- `metadata`: title, description, keywords, canonical (`https://batiscore.ca/guides/{slug}`), openGraph, robots `{ index: true, follow: true }`
- `FAQPage` JSON-LD (unique per page)
- `BreadcrumbList` JSON-Ld

### Content Briefs

#### `/guides/verifier-licence-rbq`
- What is a licence RBQ, who needs one, legal requirement
- How to verify: online RBQ directory, Batiscore tool
- What different statuts mean (valide, suspendu, annule, revoque)
- Difference between general and specialized licences
- What to do if licence is invalid

#### `/guides/entrepreneur-sans-licence`
- Legal framework: RBQ licence is mandatory for construction work over $20,000
- Penalties: fines ($3,000-$30,000), criminal charges
- Risks for homeowners: no warranty, no insurance, no recourse
- What to do if you hired an unlicensed contractor
- How to check before hiring

#### `/guides/societe-phenix`
- Definition: company closes to avoid debts/reputation, reopens under new name
- Warning signs: same phone, same address, same directors, recent incorporation
- Real examples from Quebec construction industry
- How Batiscore detects phenix companies (network analysis, scoring)
- What to do if you suspect a phenix company

#### `/guides/plainte-opc-entrepreneur`
- When to file a complaint with OPC
- Step-by-step process: gather evidence, file online, follow up
- What OPC can do: mediation, investigation, prosecution
- Time limits and important deadlines
- Alternative recourses: RBQ, small claims court

#### `/guides/reclamation-rbq`
- Garantie plan renovation: what it covers
- When and how to file a reclamation with RBQ
- Types of reclamations: unfinished work, defects, non-compliance
- Process timeline and expected outcomes
- Difference between reclamation and plainte OPC

---

## 3. Page Template — Dynamic Guides

### `/guides/meilleurs-entrepreneurs-{ville}`

- `generateStaticParams` based on 28 villes from `VILLES`
- `generateMetadata` with dynamic title/description including ville name
- `generateStaticParams` for ISR (revalidate: 86400)

Page structure:
1. **Hero** — H1: "Les meilleurs entrepreneurs en renovation a {Ville}", intro paragraph, SearchBar
2. **Top 10 list** — Cards with entrepreneur name, RBQ licence, score, categories, link to `/entrepreneur/{id}`
3. **Editorial content** — 2-3 paragraphs about choosing an entrepreneur in this city
4. **CTA** — "Voir tous les entrepreneurs a {Ville}" → `/recherche?q={ville}`
5. **Cross-links** — Link to ville page + other guides

JSON-LD: `ItemList` + `BreadcrumbList`

### `/guides/statistiques-entrepreneurs-{region}`

- `generateStaticParams` based on 13 regions
- `generateMetadata` with dynamic title/description including region name

Page structure:
1. **Hero** — H1: "Statistiques des entrepreneurs en construction — {Region}"
2. **Stats cards** — Total entrepreneurs, % licence valide, % radie, avg score, top categories
3. **Editorial content** — Analysis of the data, trends, what to watch for
4. **CTA** — Search bar
5. **Cross-links** — Ville pages in this region + guides

---

## 4. Backend API Endpoints

### `GET /api/top-entrepreneurs?ville={slug}&limit=10`

Returns top 10 entrepreneurs by score in a given ville:
```json
{
  "ville": "Montreal",
  "entrepreneurs": [
    {
      "id": 123,
      "nom": "Construction ABC inc.",
      "licence_rbq": "1234-5678-01",
      "statut_rbq": "valide",
      "score": 92,
      "categories": ["1.3", "9"]
    }
  ]
}
```

### `GET /api/stats-entrepreneurs?region={slug}`

Returns aggregated stats for a region:
```json
{
  "region": "Montreal",
  "total_entrepreneurs": 5200,
  "pct_licence_valide": 72,
  "pct_radie": 8,
  "score_moyen": 68,
  "top_categories": [
    {"code": "1.3", "label": "Batiments de tout genre", "count": 1800},
    {"code": "9", "label": "Travaux de finition", "count": 1200}
  ]
}
```

---

## 5. Internal Linking Map

### New links added:

| From | To | Anchor |
|---|---|---|
| Home (new "Guides" section) | All 5 static guides | Guide titles |
| Footer (new "Guides" column) | All 5 static guides | Guide titles |
| Header mobile menu | `/guides/verifier-licence-rbq` | "Guides" |
| Each static guide | 2-3 other guides | Contextual anchors |
| Each static guide | `/recherche` | "Verifiez votre entrepreneur" |
| Each static guide | 2-3 ville pages | "Consultez les entrepreneurs a {ville}" |
| Ville pages | `/guides/meilleurs-entrepreneurs-{ville}` | "Les meilleurs entrepreneurs a {ville}" |
| Ville pages | `/guides/societe-phenix` | "Societes phenix" (already partially linked) |
| Dynamic guide pages | Corresponding ville page | Ville name |
| Dynamic guide pages | 2-3 static guides | Contextual anchors |
| `/entrepreneur/{id}` | Corresponding ville page | Ville name |
| `/entrepreneur/{id}` | `/guides/verifier-licence-rbq` | "En savoir plus sur la licence RBQ" |

### Links removed/changed:
- Remove `/recherche` from sitemap (has noindex, contradictory signal)

---

## 6. SEO Fixes on Existing Pages

| Fix | File | Description |
|---|---|---|
| Remove `/recherche` from sitemap | `app/sitemap.ts` | Has noindex, should not be in sitemap |
| Add `/pro` to sitemap | `app/sitemap.ts` | Currently missing |
| Add `/guides/*` to sitemap | `app/sitemap.ts` | New pages |
| Add `BreadcrumbList` JSON-LD | All page layouts | No breadcrumbs exist anywhere |
| Scope `FAQPage` JSON-LD to home only | `app/layout.tsx` → `app/page.tsx` | Currently on every page |
| Add `HowTo` JSON-LD | `app/verifier-entrepreneur-renovation/page.tsx` | Has step-by-step content |
| Add `FAQPage` JSON-LD | `app/verifier-entrepreneur-renovation/page.tsx` | Has FAQ section |
| Link ville↔entrepreneur pages | `app/entrepreneur/[id]/page.tsx` | Add "Entrepreneurs a {ville}" link |
| Cross-link villes by region | `app/[ville]/page.tsx` | Add "Autres villes en {region}" section |

---

## 7. File Structure

```
frontend/app/
  guides/
    verifier-licence-rbq/page.tsx        # Static guide
    entrepreneur-sans-licence/page.tsx     # Static guide
    societe-phenix/page.tsx               # Static guide
    plainte-opc-entrepreneur/page.tsx      # Static guide
    reclamation-rbq/page.tsx              # Static guide
    meilleurs-entrepreneurs-[ville]/page.tsx  # Dynamic (28 instances)
    statistiques-entrepreneurs-[region]/page.tsx  # Dynamic (13 instances)
    GuideHero.tsx                          # Shared hero component
    GuideLayout.tsx                        # Shared layout with breadcrumbs + cross-links
```

Backend:
```
backend/api/routes/
  stats.py  # New: /api/top-entrepreneurs + /api/stats-entrepreneurs
```

---

## 8. Success Metrics

- Google indexes all 7 new page types within 30 days
- "Discovered but not indexed" ville pages decrease from 30 to < 10
- Organic traffic from informational queries increases (tracked via GoatCounter)
- Each guide page drives CTA clicks to `/recherche` (track via UTM or GoatCounter events)