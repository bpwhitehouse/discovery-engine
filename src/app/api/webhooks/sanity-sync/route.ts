import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

// Force Next.js to treat this route as purely dynamic
export const dynamic = 'force-dynamic'

function getClients() {
  const pineconeKey = process.env.PINECONE_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!pineconeKey || !openaiKey) {
    throw new Error('PINECONE_API_KEY or OPENAI_API_KEY is not configured in environment variables.')
  }

  return {
    pinecone: new Pinecone({ apiKey: pineconeKey }),
    openai: new OpenAI({ apiKey: openaiKey }),
  }
}

export async function POST(req: Request) {
  try {
    const { pinecone, openai } = getClients()
    const indexName = process.env.PINECONE_INDEX_NAME || 'discovery-index'
    const index = pinecone.index(indexName)

    const body = await req.json()

    // Add your Sanity webhook payload processing & vector embedding logic here...

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Sanity Webhook Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Webhook processing failed.'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}