import { createClient } from '@sanity/client'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// 1. Initialize API Clients
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

// Helper to extract plain text from Portable Text blocks (e.g. Specifications)
function blocksToText(blocks = []) {
  if (!Array.isArray(blocks) || blocks.length === 0) return ''
  return blocks
    .map((block) => {
      if (block._type !== 'block' || !Array.isArray(block.children)) return ''
      return block.children.map((child) => child.text || '').join('')
    })
    .filter(Boolean)
    .join(' ')
}

// Helper to format FAQ arrays into clean text strings
function formatFaqs(faqs = []) {
  if (!Array.isArray(faqs) || faqs.length === 0) return ''
  return faqs
    .map((f) => `Q: ${f.question || ''} A: ${f.answer || ''}`)
    .join(' ')
}

async function seedPinecone() {
  console.log('Fetching products with full metadata from Sanity...')

  // Fetch all products with specifications and FAQs included
  const products = await sanity.fetch(`*[_type == "product"]{
    _id,
    title,
    "slug": slug.current,
    description,
    metaDescription,
    category,
    manufacturer,
    specifications,
    faqs
  }`)

  if (!products || products.length === 0) {
    console.log('No products found in Sanity. Please run seed-sanity.mjs first!')
    return
  }

  const indexName = process.env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX || 'discovery-index'
  const index = pinecone.index(indexName)
  const vectors = []

  for (const product of products) {
    const specText = blocksToText(product.specifications)
    const faqText = formatFaqs(product.faqs)

    // Concatenate all content fields so vector embeddings capture full context
    const textToEmbed = [
      `Product: ${product.title}`,
      `Category: ${product.category || ''}`,
      `Manufacturer: ${product.manufacturer || ''}`,
      `Description: ${product.description || ''}`,
      specText ? `Specifications: ${specText}` : '',
      faqText ? `FAQs: ${faqText}` : '',
      product.metaDescription ? `Meta: ${product.metaDescription}` : ''
    ].filter(Boolean).join('. ')

    console.log(`\n-----------------------------------------------`)
    console.log(`Generating embedding for: ${product.title}`)
    console.log(`Embedded text: "${textToEmbed}"`)

    // Create embedding with OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
    })

    const embedding = embeddingResponse.data[0].embedding

    // Prepare vector object for Pinecone
    vectors.push({
      id: product._id,
      values: embedding,
      metadata: {
        sanity_id: product._id,
        title: product.title,
        slug: product.slug || '',
        category: product.category || '',
        manufacturer: product.manufacturer || '',
        text: textToEmbed,
      },
    })
  }

  console.log(`\nUpserting ${vectors.length} vectors to Pinecone index "${indexName}"...`)
  await index.upsert(vectors)
  console.log('✅ Pinecone vector sync complete with Specifications and FAQs!')
}

seedPinecone().catch((err) => {
  console.error('Error seeding Pinecone:', err)
  process.exit(1)
})