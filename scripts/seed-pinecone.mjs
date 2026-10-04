import { createClient } from '@sanity/client'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

function blocksToText(blocks = []) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map(b => b.children?.map(c => c.text || '').join('') || '')
    .filter(Boolean)
    .join(' ')
}

async function syncToPinecone() {
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'discovery-index')
  const vectors = []

  // 1. Fetch & Embed Products with Dereferenced Categories/Manufacturers
  const products = await sanity.fetch(`*[_type == "product"]{
    _id,
    title,
    "slug": slug.current,
    description,
    metaDescription,
    "category": category->title,
    "manufacturer": manufacturer->name,
    faqs
  }`)

  for (const p of products) {
    const faqText = p.faqs ? p.faqs.map(f => `Q: ${f.question} A: ${f.answer}`).join(' ') : ''
    const textToEmbed = `Product: ${p.title}. Category: ${p.category || ''}. Manufacturer: ${p.manufacturer || ''}. Description: ${p.description || ''}. ${faqText}`

    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
    })

    vectors.push({
      id: `product_${p._id}`,
      values: emb.data[0].embedding,
      metadata: {
        docType: 'product',
        sanity_id: p._id,
        title: p.title,
        slug: p.slug || '',
        category: p.category || '',
        text: textToEmbed,
      },
    })
  }

  // 2. Fetch & Embed Articles with Dereferenced Related Products
  const articles = await sanity.fetch(`*[_type == "article"]{
    _id,
    title,
    "slug": slug.current,
    articleType,
    summary,
    body,
    "category": category->title,
    "relatedProducts": relatedProducts[]->title
  }`)

  for (const a of articles) {
    const bodyText = blocksToText(a.body)
    const related = a.relatedProducts ? `Related Equipment: ${a.relatedProducts.join(', ')}.` : ''
    const textToEmbed = `Article: ${a.title} (${a.articleType}). Category: ${a.category || ''}. Summary: ${a.summary || ''}. Content: ${bodyText} ${related}`

    const emb = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
    })

    vectors.push({
      id: `article_${a._id}`,
      values: emb.data[0].embedding,
      metadata: {
        docType: 'article',
        sanity_id: a._id,
        title: a.title,
        slug: a.slug || '',
        category: a.category || '',
        text: textToEmbed,
      },
    })
  }

  // 3. Upsert to Pinecone
  console.log(`Upserting ${vectors.length} vectors (Products + Articles) to Pinecone...`)
  await index.upsert(vectors)
  console.log('✅ Sync to Pinecone complete!')
}

syncToPinecone().catch(console.error)