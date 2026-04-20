# SEO City & MRC Pages Expansion

## Context

Batiscore currently has 30 static city pages for Quebec SEO. The goal is to expand to 50 pages total (cities + MRCs) to cover all of Quebec.

## Requirements

- 50 static pages total: ~30 city pages + ~20 MRC pages
- City pages: individual city with entrepreneur count, SEO content
- MRC pages: regional coverage for areas without city pages, listing main cities in the MRC
- Entrepreneur counts sourced from PostgreSQL database (pre-computed, hardcoded in frontend)
- Sitemap updated with all new pages
- Two URL patterns: `/verifier-entrepreneur-{slug}` (cities) and `/verifier-entrepreneur-mrc-{slug}` (MRCs)

## Architecture

### Data Model

**`villes.ts` → renamed to `locations.ts`** with two data structures:

```typescript
interface VilleData {
  nom: string           // "Montréal"
  slug: string          // "montreal"
  population: string    // "1,9 million"
  nbEntrepreneurs: string  // "5 200+"
  region: string        // "Montréal"
}

interface MrcData {
  nom: string           // "MRC de Lanaudière"
  slug: string          // "lanaudiere"
  nbEntrepreneurs: string  // "3 400+"
  region: string        // "Lanaudière"
  villesPrincipales: string[]  // ["Terrebonne", "Repentigny", "Mascouche"]
}
```

### URL Patterns

- Cities: `/verifier-entrepreneur-{slug}` (unchanged)
- MRCs: `/verifier-entrepreneur-mrc-{slug}` (new)

### Routing

- `[ville]/page.tsx` handles city pages (existing)
- New `[mrc]/page.tsx` handles MRC pages (new route segment)
- Both use `generateStaticParams()` for SSG

### Entrepreneur Count Script

A one-time script that:
1. Queries PostgreSQL `contractors` table grouped by `ville` column
2. Maps cities to MRCs
3. Outputs JSON with counts per city and per MRC
4. Results are hardcoded into `locations.ts`

### Sitemap

Updated `sitemap.ts` to include:
- All city pages (priority 0.7, weekly)
- All MRC pages (priority 0.6, weekly)

## Page Content

### City Page (existing, unchanged structure)
- Hero: "Vérifier un entrepreneur à {nom}" + entrepreneur count badge
- Shared landing sections (RisksSection, HowItWorksSection, etc.)
- Local SEO article block
- VillesGrid linking to other pages

### MRC Page (new template)
- Hero: "Vérifier un entrepreneur dans la MRC de {nom}" + entrepreneur count badge
- List of main cities in the MRC (clickable links if they have pages)
- Shared landing sections (RisksSection, HowItWorksSection, etc.)
- Local SEO article block referencing MRC and its cities
- Links to other MRCs + city pages in the region

## Selection Criteria

- ~30 largest Quebec cities by population (current 30 + potential adjustments)
- ~20 MRCs covering remaining regions not served by city pages
- Total: 50 pages

## Implementation Steps

1. Create DB query script to count entrepreneurs per city/MRC
2. Define MRC data (names, regions, main cities, slugs)
3. Create `locations.ts` with both VilleData and MrcData
4. Update `[ville]/page.tsx` imports
5. Create `[mrc]/page.tsx` with MRC template
6. Create MRC-specific components (MrcHero, VillesList)
7. Update `sitemap.ts` with MRC pages
8. Update VillesGrid to include MRC links
9. Build and verify