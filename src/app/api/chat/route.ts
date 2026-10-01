import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAIClient from 'openai'

// Force Next.js to treat this route as purely dynamic (prevents static evaluation during build)
export const dynamic = 'force-dynamic'

// Safe helper to instantiate SDK clients lazily on request execution[cite: 2, 6]
function getClients() {
  const pineconeKey = process.env.PINECONE_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!pineconeKey || !openaiKey) {
    throw new Error('PINECONE_API_KEY or OPENAI_API_KEY environment variable is not configured.')
  }

  const pinecone = new Pinecone({ apiKey: pineconeKey })
  const openaiClient = new OpenAIClient({ apiKey: openaiKey })

  return { pinecone, openaiClient }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastUserMessage = messages[messages.length - 1]?.content || ''

    // Initialize clients safely inside the handler[cite: 2, 6]
    const { pinecone, openaiClient } = getClients()

    // 1. Embed user query
    const embedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastUserMessage,
    })

    // 2. Fetch context vectors from Pinecone[cite: 1, 5, 7]
    const indexName = process.env.PINECONE_INDEX_NAME || 'discovery-index'
    const index = pinecone.index(indexName)

    const searchResults = await index.query({
      vector: embedding.data[0].embedding,
      topK: 3,
      includeMetadata: true,
    })

    // Safely extract text metadata while filtering out missing fields
    const contextText = (searchResults.matches || [])
      .map((match) => match.metadata?.text as string)
      .filter(Boolean)
      .join('\n---\n')

    // 3. Stream grounded response
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are a precise technical assistant. Answer using ONLY the following retrieved product context:
      \n${contextText || 'No matching context found.'}\n
      If the answer is not contained within the context above, state clearly: "Information not available in the index."`,
      messages,
    })

    // In Vercel AI SDK 3.1+/4.0+, use toDataStreamResponse() or toTextStreamResponse()[cite: 1]
    return result.toDataStreamResponse()
  } catch (error: unknown) {
    console.error('Chat API Error:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}