import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const { query, categoryFilter } = await req.json()

  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

  const filter: Record<string, any> = {}
  if (categoryFilter) filter.category = { $eq: categoryFilter }

  const results = await index.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  })

  return NextResponse.json({ results: results.matches })
}