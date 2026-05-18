import type { MetadataRoute } from 'next'
import { VILLES_LIST, MRCS_LIST } from '@/lib/locations'
import { CATEGORIES_LIST } from '@/lib/categories'

const BASE_URL = 'https://batiscore.ca'

export default function sitemap(): MetadataRoute.Sitemap {
  const villePages = VILLES_LIST.map((ville) => ({
    url: `${BASE_URL}/verifier-entrepreneur-${ville.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const mrcPages = MRCS_LIST.map((mrc) => ({
    url: `${BASE_URL}/verifier-entrepreneur-mrc-${mrc.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const guideSlugs = [
    'verifier-licence-rbq',
    'entrepreneur-sans-licence',
    'societe-phenix',
    'plainte-opc-entrepreneur',
    'reclamation-rbq',
  ]

  const guidePages = guideSlugs.map((slug) => ({
    url: `${BASE_URL}/guides/${slug}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const categoryPages = CATEGORIES_LIST.map((cat) => ({
    url: `${BASE_URL}/categories/${cat.slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categoryVillePages: MetadataRoute.Sitemap = []
  for (const cat of CATEGORIES_LIST) {
    for (const ville of VILLES_LIST) {
      categoryVillePages.push({
        url: `${BASE_URL}/categories/${cat.slug}/${ville.slug}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      })
    }
  }

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/recherche/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guides/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/verifier-entrepreneur-renovation/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/pro/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...guidePages,
    ...villePages,
    ...mrcPages,
    ...categoryPages,
    ...categoryVillePages,
  ]
}