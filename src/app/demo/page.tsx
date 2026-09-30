'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  score: number;
  title: string;
  description: string;
  tags?: string[];
  sanityId?: string;
}

interface LatencyBreakdown {
  embedding: number;
  vector: number;
  cms: number;
}

function SearchPipelineVisualizer({
  activeStep = 0,
  latency = { embedding: 0, vector: 0, cms: 0 },
}: {
  activeStep?: number;
  latency?: LatencyBreakdown;
}) {
  const steps = [
    {
      num: '01',
      title: 'User Prompt',
      tech: 'Next.js API',
      desc: 'Captures intent & query text',
      time: null,
    },
    {
      num: '02',
      title: 'Vectorize',
      tech: 'OpenAI Embeddings',
      desc: 'Translates query into 1,536 math dimensions',
      time: latency.embedding ? `${latency.embedding}ms` : null,
    },
    {
      num: '03',
      title: 'Similarity Match',
      tech: 'Pinecone Vector DB',
      desc: 'Finds nearest product coordinates',
      time: latency.vector ? `${latency.vector}ms` : null,
    },
    {
      num: '04',
      title: 'Grounded Answer',
      tech: 'GPT-4o Mini (RAG)',
      desc: 'Generates response strictly from CMS data',
      time: latency.cms ? `${latency.cms}ms` : null,
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        Live Query Processing Pipeline
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx + 1;
          const isDone = activeStep > idx + 1;

          return (
            <div
              key={step.num}
              className={`p-3.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-sky-50 border-sky-500 shadow-sm shadow-sky-100'
                  : isDone
                  ? 'bg-emerald-50/80 border-emerald-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-bold ${
                    isActive ? 'text-sky-700' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.num}
                </span>
                {step.time && (
                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                    {step.time}
                  </span>
                )}
              </div>
              <h4 className={`text-sm font-semibold mb-0.5 ${isActive || isDone ? 'text-slate-900' : 'text-slate-700'}`}>
                {step.title}
              </h4>
              <p className="text-[11px] font-mono text-sky-600 font-medium mb-1">{step.tech}</p>
              <p className="text-[11px] text-slate-600 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DiscoveryEngineDemo() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [latency, setLatency] = useState<LatencyBreakdown>({ embedding: 0, vector: 0, cms: 0 });
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleSearch = async (searchQuery?: string) => {
    const activeQuery = searchQuery ?? query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setActiveStep(1);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(activeQuery)}`);

      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }

      const data = await res.json();

      setResults(data.matches || []);
      setLatency(data.latency || { embedding: 0, vector: 0, cms: 0 });
      setActiveStep(4);
    } catch (err: unknown) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch dynamic vector results. Please ensure your API route (/api/search) is running and configured with Pinecone & OpenAI keys.');
      setResults([]);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const runPreset = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-10 pb-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 m-0">
              Benjamin Whitehouse
            </h1>
            <div>
              <a
                href="https://www.linkedin.com/in/bpwhitehouse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <p className="text-sky-700 text-lg font-bold mb-2">
            Product Leader · AI Strategy · Full-Stack Foundations
          </p>

          <p className="text-slate-600 text-base leading-relaxed max-w-3xl">
            Senior Product Manager with technical roots in full-stack architecture and AI systems.
            Specialising in zero-to-one product strategy, semantic discovery engines, and scaling user-centric platforms.
          </p>
        </header>

        {/* Demo Section Header */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Lab Equipment Semantic Engine</h2>
            <div className="text-slate-500 text-sm mt-1">
              <p>
                <strong>
                  An AI-Powered Discovery Engine that fixes broken search.
                </strong>
              </p>
              <p>
                Traditional search looks for exact keyword matches, often giving customers zero results. Whether plugged into an existing site as a zero-risk upgrade or launched as a complete AI platform, this technology converts missed searches into revenue and prepares your business for the future of AI search—without breaking existing systems.
              </p>
            </div>
          </div>

          <a
            href="#how-it-works"
            className="w-fit inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-sky-700 border border-slate-200 hover:border-sky-500 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shadow-sm group"
          >
            <span>How it Works</span>
            <svg className="w-3.5 h-3.5 text-sky-700 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Search Section */}
        <section className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              suppressHydrationWarning={true}
              placeholder="Search lab products by concept (e.g., 'What fume hoods comply with chemical safety standards?')..."
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3.5 pr-32 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              aria-label="Search laboratory products"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-5 rounded-md text-sm transition-colors shadow"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Preset Queries Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>Select a search preset to test Pinecone retrieval:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => runPreset('Chemical storage and fume extraction systems')}
                className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-md font-mono transition-all font-semibold shadow-sm"
              >
                &quot;Chemical storage &amp; fume extraction&quot;
              </button>
              <button
                onClick={() => runPreset('High-precision analytical balances and laboratory instruments')}
                className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-md font-mono transition-all font-semibold shadow-sm"
              >
                &quot;Precision instruments &amp; balances&quot;
              </button>
              <button
                onClick={() => runPreset('Custom modular lab furniture and ESD workbench setup')}
                className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-md font-mono transition-all font-semibold shadow-sm"
              >
                &quot;Modular lab furniture &amp; workbenches&quot;
              </button>
            </div>
          </div>
        </section>

        {/* Pipeline Visualizer */}
        <SearchPipelineVisualizer activeStep={activeStep} latency={latency} />

        {/* Results & Diagnostics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center animate-pulse">
                <p className="text-sky-700 text-sm font-semibold">Generating embeddings &amp; querying vector index...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-center">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            {!loading && !hasSearched && !error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <p className="text-slate-500 text-sm">Search result matches will show here.</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <p className="text-slate-500 text-sm">No product vector matches found for your query.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                        Score: {(item.score * 100).toFixed(0)}% Match
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-medium">
                        {item.sanityId ? `Sanity ID: ${item.sanityId}` : `SKU/ID: ${item.id}`}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engine Diagnostics Sidebar */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 h-fit space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
              Engine Diagnostics
            </h3>

            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">Embedding Model</span>
              <span className="text-xs font-mono bg-white border border-slate-200 text-sky-700 px-2.5 py-1 rounded block font-semibold">
                text-embedding-3-small (1536 dim)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">Vector Index</span>
              <span className="text-xs font-mono bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded block font-semibold">
                Pinecone (Cosine Distance)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">CMS Synchronisation</span>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1 rounded">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-800 font-medium">Sanity Webhooks Active</span>
              </div>
            </div>

            {hasSearched && !loading && (
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs text-slate-500 font-medium block mb-1">Latency Breakdown</span>
                <div className="text-xs font-mono text-slate-700 space-y-1">
                  <div className="flex justify-between"><span>Embedding API:</span> <span className="text-sky-700 font-semibold">{latency.embedding} ms</span></div>
                  <div className="flex justify-between"><span>Vector Match:</span> <span className="text-sky-700 font-semibold">{latency.vector} ms</span></div>
                  <div className="flex justify-between"><span>CMS Hydration:</span> <span className="text-sky-700 font-semibold">{latency.cms} ms</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works Explainer Section */}
        <section id="how-it-works" className="mt-16 border-t border-slate-200 pt-10 pb-6 text-slate-900">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-1">An automated pipeline connecting content, vector search, and AI generation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-700">STEP 01</div>
              <h3 className="text-base font-semibold text-slate-900">Content Updates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When an editor updates product details in Sanity Studio, Sanity automatically sends a webhook alert to our server.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-700">STEP 02</div>
              <h3 className="text-base font-semibold text-slate-900">AI Translation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend sends text to OpenAI, converting content into 1,536-dimensional vector coordinates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-700">STEP 03</div>
              <h3 className="text-base font-semibold text-slate-900">Vector Storage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coordinates are stored in Pinecone for real-time cosine similarity matching.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-700">STEP 04</div>
              <h3 className="text-base font-semibold text-slate-900">Smart Search &amp; Answers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Queries are matched in Pinecone and passed to OpenAI to output structured, grounded responses.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}