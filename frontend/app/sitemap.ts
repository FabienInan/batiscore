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