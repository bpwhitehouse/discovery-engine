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

export function SearchPipelineVisualizer({
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
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 my-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
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
                  ? 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-500/20'
                  : isDone
                  ? 'bg-slate-800 border-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-bold ${
                    isActive ? 'text-sky-300' : isDone ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {step.num}
                </span>
                {step.time && (
                  <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-200 border border-slate-700">
                    {step.time}
                  </span>
                )}
              </div>
              <h4 className={`text-sm font-semibold mb-0.5 ${isActive || isDone ? 'text-white' : 'text-slate-200'}`}>
                {step.title}
              </h4>
              <p className="text-[11px] font-mono text-sky-300 font-medium mb-1">{step.tech}</p>
              <p className="text-[11px] text-slate-300 leading-tight">{step.desc}</p>
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
    } catch (err) {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-700 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-sky-300">Lab Equipment Semantic Engine</h1>
              <p className="text-slate-300 text-sm mt-1">
                Real-time vector search across science lab manufacturing products powered by Next.js, OpenAI &amp; Pinecone
              </p>
            </div>
            <span className="w-fit bg-sky-950 text-sky-300 border border-sky-400 text-xs px-3 py-1 rounded-full font-semibold">
              Live Product Catalog Demo
            </span>
          </div>
        </header>

        {/* Search Section */}
        <section className="mb-6 space-y-4">
          {/* High-Contrast Search Input Bar */}
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search lab products by concept (e.g., 'What fume hoods comply with chemical safety standards?')..." 
              className="w-full bg-white border-2 border-slate-400 rounded-lg px-4 py-3.5 pr-32 text-slate-900 placeholder-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 shadow-md"
              aria-label="Search laboratory products"
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-sky-400 hover:bg-sky-300 disabled:bg-slate-700 text-slate-950 font-bold px-5 rounded-md text-sm transition-colors shadow"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* High-Contrast Instruction Callout Box */}
          <div className="bg-slate-900 border-2 border-sky-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span><strong>Instruction:</strong> Select a sample prompt to test vector search on product data:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => runPreset('Chemical storage and fume extraction systems')} 
                className="text-xs bg-slate-950 hover:bg-sky-900 hover:text-white border border-sky-300 text-slate-100 px-3 py-1.5 rounded-md font-mono transition-all font-semibold"
              >
                "Chemical storage &amp; fume extraction"
              </button>
              <button 
                onClick={() => runPreset('High-precision analytical balances and laboratory instruments')} 
                className="text-xs bg-slate-950 hover:bg-sky-900 hover:text-white border border-sky-300 text-slate-100 px-3 py-1.5 rounded-md font-mono transition-all font-semibold"
              >
                "Precision instruments &amp; balances"
              </button>
              <button 
                onClick={() => runPreset('Custom modular lab furniture and ESD workbench setup')} 
                className="text-xs bg-slate-950 hover:bg-sky-900 hover:text-white border border-sky-300 text-slate-100 px-3 py-1.5 rounded-md font-mono transition-all font-semibold"
              >
                "Modular lab furniture &amp; workbenches"
              </button>
            </div>
          </div>
        </section>

        {/* Live Visualizer */}
        <SearchPipelineVisualizer activeStep={activeStep} latency={latency} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center animate-pulse">
                <p className="text-sky-300 text-sm font-semibold">Generating embeddings &amp; querying product vector index...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-950 border border-red-500 rounded-lg p-5 text-center">
                <p className="text-red-200 text-sm font-semibold">{error}</p>
              </div>
            )}

            {!loading && !hasSearched && !error && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-200 text-sm">Enter a search query or click a product preset above to test semantic similarity retrieval from Pinecone.</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                <p className="text-slate-200 text-sm">No product vector matches found for your query.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-3 shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-300 bg-sky-950 border border-sky-400 px-2 py-0.5 rounded">
                        Score: {(item.score * 100).toFixed(0)}% Match
                      </span>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {item.sanityId ? `Sanity ID: ${item.sanityId}` : `SKU/ID: ${item.id}`}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-950 text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-medium">
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
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 h-fit space-y-4 shadow">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-700 pb-2">
              Engine Diagnostics
            </h3>
            
            <div>
              <span className="text-xs text-slate-300 font-medium block mb-1">Embedding Model</span>
              <span className="text-xs font-mono bg-slate-950 border border-slate-700 text-sky-300 px-2.5 py-1 rounded block font-semibold">
                text-embedding-3-small (1536 dim)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-300 font-medium block mb-1">Vector Index</span>
              <span className="text-xs font-mono bg-slate-950 border border-slate-700 text-slate-100 px-2.5 py-1 rounded block font-semibold">
                Pinecone (Cosine Distance)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-300 font-medium block mb-1">CMS Synchronisation</span>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-slate-100 font-medium">Sanity Webhooks Active</span>
              </div>
            </div>

            {hasSearched && !loading && (
              <div className="border-t border-slate-700 pt-3">
                <span className="text-xs text-slate-300 font-medium block mb-1">Latency Breakdown</span>
                <div className="text-xs font-mono text-slate-200 space-y-1">
                  <div className="flex justify-between"><span>Embedding API:</span> <span className="text-sky-300 font-semibold">{latency.embedding} ms</span></div>
                  <div className="flex justify-between"><span>Vector Match:</span> <span className="text-sky-300 font-semibold">{latency.vector} ms</span></div>
                  <div className="flex justify-between"><span>CMS Hydration:</span> <span className="text-sky-300 font-semibold">{latency.cms} ms</span></div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}