import { MetadataRoute } from 'next'
import { createClient } from '@sanity/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tn8roucm'
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discovery-engine-plum-three.vercel.app'
  const baseUrl = rawBaseUrl.replace(/\/$/, '')

  const sanity = createClient({
    projectId,
    dataset,
    useCdn: true,
    apiVersion: '2024-01-01',
  })

  let products = []
  try {
    products = await sanity.fetch(`*[_type == "product"]{ "slug": slug.current, _updatedAt }`)
  } catch (err) {
    console.error('Sitemap fetch warning:', err)
  }

  const productEntries = (products || []).map((item: any) => ({
    url: `${baseUrl}/products/${item.slug}`,
    lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...productEntries,
  ]
}