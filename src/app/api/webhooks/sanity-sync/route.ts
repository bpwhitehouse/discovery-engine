import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'
import { createClient } from '@sanity/client'

// Force Next.js to treat this route as purely dynamic
export const dynamic = 'force-dynamic'

function getClients() {
  const pineconeKey = process.env.PINECONE_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!pineconeKey || !openaiKey) {
    throw new Error('PINECONE_API_KEY or OPENAI_API_KEY is not configured in environment variables.')
  }

  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2024-01-01',
  })

  return {
    pinecone: new Pinecone({ apiKey: pineconeKey }),
    openai: new OpenAI({ apiKey: openaiKey }),
    sanity,
  }
}

function blocksToText(blocks: any[] = []): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block) => {
      if (block._type !== 'block' || !block.children) return ''
      return block.children.map((child: any) => child.text || '').join('')
    })
    .filter(Boolean)
    .join(' ')
}

async function syncProduct(docId: string, sanity: any, openai: any, index: any) {
  const product = await sanity.fetch(
    `*[_type == "product" && _id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      description,
      metaDescription,
      "categoryName": category->title,
      "manufacturerName": manufacturer->name,
      faqs
    }`,
    { id: docId }
  )

  if (!product) return null

  const faqText = product.faqs
    ? product.faqs.map((f: any) => `Q: ${f.question} A: ${f.answer}`).join(' ')
    : ''
  const textToEmbed = `Product: ${product.title}. Category: ${product.categoryName || ''}. Manufacturer: ${product.manufacturerName || ''}. Description: ${product.description || ''}. Meta: ${product.metaDescription || ''}. ${faqText}`

  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: textToEmbed,
  })

  await index.upsert([
    {
      id: `product_${product._id}`,
      values: embedding.data[0].embedding,
      metadata: {
        docType: 'product',
        sanity_id: product._id,
        title: product.title,
        slug: product.slug || '',
        category: product.categoryName || '',
        manufacturer: product.manufacturerName || '',
        text: textToEmbed,
      },
    },
  ])

  return product._id
}

async function syncArticle(docId: string, sanity: any, openai: any, index: any) {
  const article = await sanity.fetch(
    `*[_type == "article" && _id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      articleType,
      summary,
      body,
      "categoryName": category->title,
      "relatedProductTitles": relatedProducts[]->title
    }`,
    { id: docId }
  )

  if (!article) return null

  const bodyText = blocksToText(article.body)
  const relatedText = article.relatedProductTitles
    ? `Related Equipment: ${article.relatedProductTitles.join(', ')}.`
    : ''
  const textToEmbed = `Article: ${article.title} (${article.articleType || 'Guide'}). Category: ${article.categoryName || ''}. Summary: ${article.summary || ''}. Content: ${bodyText} ${relatedText}`

  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: textToEmbed,
  })

  await index.upsert([
    {
      id: `article_${article._id}`,
      values: embedding.data[0].embedding,
      metadata: {
        docType: 'article',
        sanity_id: article._id,
        title: article.title,
        slug: article.slug || '',
        category: article.categoryName || '',
        text: textToEmbed,
      },
    },
  ])

  return article._id
}

export async function POST(req: Request) {
  try {
    const { pinecone, openai, sanity } = getClients()
    const indexName = process.env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX || 'discovery-index'
    const index = pinecone.index(indexName)

    const body = await req.json()
    const docId = body._id

    if (!docId) {
      return NextResponse.json({ error: 'Missing document _id in body' }, { status: 400 })
    }

    // 1. Handle Document Deletion
    if (body.deleted || body._type === 'delete') {
      await index.deleteMany({ sanity_id: { $eq: docId } })
      return NextResponse.json({ message: `Deleted vector records for document: ${docId}` })
    }

    // 2. Handle Product Create / Update
    if (body._type === 'product') {
      const res = await syncProduct(docId, sanity, openai, index)
      if (!res) return NextResponse.json({ message: 'Product document not found' }, { status: 404 })
      return NextResponse.json({ message: `Successfully updated product vector: ${docId}` })
    }

    // 3. Handle Article Create / Update
    if (body._type === 'article') {
      const res = await syncArticle(docId, sanity, openai, index)
      if (!res) return NextResponse.json({ message: 'Article document not found' }, { status: 404 })
      return NextResponse.json({ message: `Successfully updated article vector: ${docId}` })
    }

    // 4. Handle Category Update (Re-sync all products & articles that reference this category)
    if (body._type === 'category') {
      const referencingProducts = await sanity.fetch(
        `*[_type == "product" && references($id)]{ _id }`,
        { id: docId }
      )
      const referencingArticles = await sanity.fetch(
        `*[_type == "article" && references($id)]{ _id }`,
        { id: docId }
      )

      for (const p of referencingProducts) {
        await syncProduct(p._id, sanity, openai, index)
      }
      for (const a of referencingArticles) {
        await syncArticle(a._id, sanity, openai, index)
      }

      return NextResponse.json({
        message: `Re-indexed ${referencingProducts.length} products and ${referencingArticles.length} articles referencing category ${docId}`,
      })
    }

    // 5. Handle Manufacturer Update (Re-sync all products referencing this manufacturer)
    if (body._type === 'manufacturer') {
      const referencingProducts = await sanity.fetch(
        `*[_type == "product" && references($id)]{ _id }`,
        { id: docId }
      )

      for (const p of referencingProducts) {
        await syncProduct(p._id, sanity, openai, index)
      }

      return NextResponse.json({
        message: `Re-indexed ${referencingProducts.length} products referencing manufacturer ${docId}`,
      })
    }

    return NextResponse.json({ message: `Ignored unhandled document type: ${body._type}` })
  } catch (err: unknown) {
    console.error('Sanity Webhook Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Webhook processing failed'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}