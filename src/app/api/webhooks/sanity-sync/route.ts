import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const body = await req.json()
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

  // Handle document deletion
  if (body._type === 'product' && body.deleted) {
    await index.deleteMany({ sanity_id: { $eq: body._id } })
    return NextResponse.json({ message: 'Vectors deleted' })
  }

  // Handle create or update
  if (body._type === 'product') {
    const textToEmbed = `${body.title}. ${body.description} Category: ${body.category}. Manufacturer: ${body.manufacturer}`

    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textToEmbed,
    })

    await index.upsert([
      {
        id: body._id,
        values: embedding.data[0].embedding,
        metadata: {
          sanity_id: body._id,
          title: body.title,
          slug: body.slug?.current || '',
          category: body.category,
          manufacturer: body.manufacturer,
          text: textToEmbed,
        },
      },
    ])

    return NextResponse.json({ message: 'Vector upserted successfully' })
  }

  return NextResponse.json({ message: 'Ignored non-product document' })
}