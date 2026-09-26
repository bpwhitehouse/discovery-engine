import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Pinecone } from '@pinecone-database/pinecone'
import OpenAIClient from 'openai'

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
const openaiClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastUserMessage = messages[messages.length - 1].content

  // 1. Embed user query
  const embedding = await openaiClient.embeddings.create({
    model: 'text-embedding-3-small',
    input: lastUserMessage,
  })

  // 2. Fetch context vectors from Pinecone
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)
  const searchResults = await index.query({
    vector: embedding.data[0].embedding,
    topK: 3,
    includeMetadata: true,
  })

  const contextText = searchResults.matches
    .map((match) => match.metadata?.text)
    .join('\n---\n')

  // 3. Stream grounded response
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a precise technical assistant. Answer using ONLY the following retrieved product context:
    \n${contextText}\n
    If the answer is not contained within the context above, state clearly: "Information not available in the index."`,
    messages,
  })

  return result.toTextStreamResponse()
}