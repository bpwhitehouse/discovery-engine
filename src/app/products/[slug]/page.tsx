import { Metadata } from 'next'
import { createClient } from '@sanity/client'
import { notFound } from 'next/navigation'

function getSanityClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'tn8roucm',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    useCdn: true,
    apiVersion: '2024-01-01',
  })
}

async function getProduct(slug: string) {
  const sanity = getSanityClient()
  try {
    return await sanity.fetch(
      `*[_type == "product" && slug.current == $slug][0]{
        _id,
        title,
        "slug": slug.current,
        description,
        metaDescription,
        category,
        manufacturer,
        faqs[] {
          question,
          answer
        }
      }`,
      { slug }
    )
  } catch (error) {
    console.error('Failed to fetch product from Sanity:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return {}

  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discovery-engine-plum-three.vercel.app'
  const baseUrl = rawBaseUrl.replace(/\/$/, '')

  return {
    title: `${product.title} | Discovery Engine`,
    description: product.metaDescription || product.description,
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.metaDescription || product.description,
      url: `${baseUrl}/products/${slug}`,
      siteName: 'Discovery Engine',
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(product.title)}`,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.metaDescription || product.description,
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(product.title)}`],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.metaDescription || product.description,
    brand: {
      '@type': 'Brand',
      name: product.manufacturer || 'Lab Discovery',
    },
    category: product.category,
    ...(product.faqs && product.faqs.length > 0 && {
      mainEntity: product.faqs.map((faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8 border-b pb-6 border-slate-800">
        <div className="flex items-center gap-3 text-sm text-sky-400 font-medium mb-2">
          <span>{product.category || 'General'}</span>
          <span>•</span>
          <span>{product.manufacturer || 'Lab Discovery'}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{product.title}</h1>
      </div>

      <section className="prose prose-invert max-w-none mb-12">
        <p className="text-lg text-slate-300 leading-relaxed">{product.description}</p>
      </section>

      {product.faqs && product.faqs.length > 0 && (
        <section className="mt-12 border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {product.faqs.map((faq: { question: string; answer: string }, idx: number) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-sky-300 mb-2">{faq.question}</h3>
                <p className="text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
