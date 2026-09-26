import { Metadata } from 'next'
import { createClient } from '@sanity/client'
import { notFound } from 'next/navigation'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-01',
})

async function getProduct(slug: string) {
  return await sanity.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug })
}

// Technical SEO: Metadata Generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return {}

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'

  return {
    title: `${product.title} | Discovery Engine`,
    description: product.metaDescription,
    alternates: {
      canonical: `${baseUrl}/products/${params.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.metaDescription,
      images: [`/api/og?title=${encodeURIComponent(product.title)}`],
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  // GEO & Search Engine JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.metaDescription,
    brand: { '@type': 'Brand', name: product.manufacturer },
    mainEntity: product.faqs?.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      {/* Inject JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
      <div className="flex gap-4 text-sm text-gray-500 mb-6">
        <span>Category: {product.category}</span>
        <span>Brand: {product.manufacturer}</span>
      </div>
      <p className="text-lg mb-8">{product.description}</p>

      {product.faqs?.length > 0 && (
        <section className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {product.faqs.map((faq: any, i: number) => (
              <div key={i}>
                <h3 className="font-medium text-base">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}