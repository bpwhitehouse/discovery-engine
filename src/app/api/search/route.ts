import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Lazy load clients inside the request handler or wrap in a check to prevent build-time crashes if keys are missing
function getClients() {
  if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
    throw new Error('PINECONE_API_KEY or OPENAI_API_KEY is not configured in environment variables.');
  }
  
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return { pinecone, openai };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const categoryFilter = searchParams.get('category');

  if (!query) {
    return NextResponse.json({ error: 'Search query parameter "q" is required.' }, { status: 400 });
  }

  try {
    const { pinecone, openai } = getClients();

    // 1. Measure OpenAI Embedding Latency
    const t0 = Date.now();
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const t1 = Date.now();
    const embeddingLatency = t1 - t0;

    // 2. Query Pinecone Index & Measure Latency
    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!indexName) {
      throw new Error('PINECONE_INDEX_NAME environment variable is missing.');
    }

    const index = pinecone.index(indexName);

    const filter: Record<string, any> = {};
    if (categoryFilter) {
      filter.category = { $eq: categoryFilter };
    }

    const queryResponse = await index.query({
      vector: embeddingResponse.data[0].embedding,
      topK: 5,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });
    const t2 = Date.now();
    const vectorLatency = t2 - t1;

    // Map Pinecone matches to expected SearchResult structure in page.tsx
    const matches = (queryResponse.matches || []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      title: (match.metadata?.title as string) || (match.metadata?.name as string) || `Product ${match.id}`,
      description: (match.metadata?.description as string) || (match.metadata?.text as string) || 'No description provided.',
      tags: (match.metadata?.tags as string[]) || (match.metadata?.category ? [match.metadata.category as string] : []),
      sanityId: (match.metadata?.sanityId as string) || match.id,
    }));

    return NextResponse.json({
      matches,
      latency: {
        embedding: embeddingLatency,
        vector: vectorLatency,
        cms: 0, // Set or calculate CMS hydration latency if applicable
      },
    });
  } catch (err: any) {
    console.error('Search API Route Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to perform vector search.' },
      { status: 500 }
    );
  }
}