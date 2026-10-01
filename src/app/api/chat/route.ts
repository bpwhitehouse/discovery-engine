import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAIClient from 'openai'

// Force Next.js to treat this route as dynamic to prevent static build evaluation[cite: 2]
export const dynamic = 'force-dynamic'

// Instantiate clients lazily per request execution[cite: 2]
function getClients() {
  const pineconeKey = process.env.PINECONE_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!pineconeKey || !openaiKey) {
    throw new Error('PINECONE_API_KEY or OPENAI_API_KEY environment variable is not configured.')
  }

  return {
    pinecone: new Pinecone({ apiKey: pineconeKey }),
    openaiClient: new OpenAIClient({ apiKey: openaiKey }),
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const lastUserMessage = messages[messages.length - 1]?.content || ''

    if (!lastUserMessage.trim()) {
      return new Response(JSON.stringify({ error: 'Last user message content cannot be empty.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { pinecone, openaiClient } = getClients()

    // 1. Generate embedding for user query via OpenAI[cite: 2, 3]
    const embedding = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: lastUserMessage,
    })

    // 2. Query Pinecone vector database[cite: 2, 3]
    const indexName = process.env.PINECONE_INDEX_NAME || 'discovery-index'
    const index = pinecone.index(indexName)

    const searchResults = await index.query({
      vector: embedding.data[0].embedding,
      topK: 3,
      includeMetadata: true,
    })

    // Debug logging
    console.log('Pinecone Raw Matches:', JSON.stringify(searchResults.matches, null, 2))

    // Filter valid text metadata entries
    const contextText = (searchResults.matches || [])
      .map((match) => match.metadata?.text as string)
      .filter(Boolean)
      .join('\n---\n')

    // 3. Stream grounded LLM response using Vercel AI SDK[cite: 2, 3]
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are a precise technical assistant. Answer using ONLY the following retrieved product context:

${contextText || 'No matching context found.'}

If the answer is not contained within the context above, state clearly: "Information not available in the index."`,
      messages,
    })

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