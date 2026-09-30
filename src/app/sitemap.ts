import { MetadataRoute } from 'next'
import { createClient } from '@sanity/client'

// Interface representing the expected item structure from Sanity
interface SanityProduct {
  slug: string;
  _updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tn8roucm'[cite: 2]
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'[cite: 2]
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discovery-engine-plum-three.vercel.app'[cite: 2]
  const baseUrl = rawBaseUrl.replace(/\/$/, '')[cite: 2]

  const sanity = createClient({
    projectId,
    dataset,
    useCdn: true,
    apiVersion: '2024-01-01',
  })[cite: 2]

  let products: SanityProduct[] = [][cite: 1, 2]
  try {
    products = await sanity.fetch(`*[_type == "product"]{ "slug": slug.current, _updatedAt }`)[cite: 1, 2]
  } catch (err: unknown) {
    console.error('Sitemap fetch warning:', err)[cite: 2]
  }

  // Type-safe mapping over fetched products
  const productEntries = (products || []).map((item: SanityProduct) => ({
    url: `${baseUrl}/products/${item.slug}`,[cite: 1, 2]
    lastModified: item._updatedAt ? new Date(item._updatedAt) : new Date(),[cite: 1, 2]
    changeFrequency: 'weekly' as const,[cite: 1, 2]
    priority: 0.8,[cite: 1, 2]
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },[cite: 1, 2]
    ...productEntries,
  ]
}