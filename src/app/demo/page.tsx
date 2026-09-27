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

export default function DiscoveryEngineDemo() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [latency, setLatency] = useState<LatencyBreakdown>({ embedding: 0, vector: 0, cms: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const activeQuery = searchQuery ?? query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(activeQuery)}`);
      
      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }

      const data = await res.json();

      setResults(data.matches || []);
      setLatency(data.latency || { embedding: 0, vector: 0, cms: 0 });
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch dynamic vector results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const runPreset = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-sky-400">Lab Equipment Semantic Engine</h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time vector search across science lab manufacturing products powered by Next.js, OpenAI &amp; Pinecone
              </p>
            </div>
            <span className="w-fit bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs px-3 py-1 rounded-full font-medium">
              Live Product Catalog Demo
            </span>
          </div>
        </header>

        {/* Search Section */}
        <section className="mb-8">
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search lab products by concept (e.g., 'What fume hoods comply with chemical safety standards?')..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3.5 pr-28 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 text-slate-950 font-semibold px-4 rounded-md text-sm transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-slate-400">Try sample product prompts:</span>
            <button 
              onClick={() => runPreset('Chemical storage and fume extraction systems')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
            >
              "Chemical storage & fume extraction"
            </button>
            <button 
              onClick={() => runPreset('High-precision analytical balances and laboratory instruments')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
            >
              "Precision instruments & balances"
            </button>
            <button 
              onClick={() => runPreset('Custom modular lab furniture and ESD workbench setup')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
            >
              "Modular lab furniture & workbenches"
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-8 text-center animate-pulse">
                <p className="text-sky-400 text-sm font-medium">Generating embeddings &amp; querying product vector index...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-5 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && !hasSearched && !error && (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400 text-sm">Enter a search query or click a product preset above to test semantic similarity retrieval from Pinecone.</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400 text-sm">No product vector matches found for your query.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((item) => (
                  <div key={item.id} className="bg-slate-800 border border-slate-700/80 rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
                        Score: {(item.score * 100).toFixed(0)}% Match
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.sanityId ? `Sanity ID: ${item.sanityId}` : `SKU/ID: ${item.id}`}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-100">{item.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-slate-900 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded">
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

export function SearchPipelineVisualizer({ activeStep = 0, latency = { embedding: 0, vector: 0, cms: 0 } }) {
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 my-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
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
                  ? 'bg-sky-950/40 border-sky-500/80 shadow-lg shadow-sky-500/10' 
                  : isDone 
                  ? 'bg-slate-800/80 border-emerald-500/50' 
                  : 'bg-slate-800/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-mono font-bold ${
                  isActive ? 'text-sky-400' : isDone ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {step.num}
                </span>
                {step.time && (
                  <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                    {step.time}
                  </span>
                )}
              </div>
              <h4 className={`text-sm font-semibold mb-0.5 ${isActive || isDone ? 'text-slate-100' : 'text-slate-500'}`}>
                {step.title}
              </h4>
              <p className="text-[11px] font-mono text-sky-400/90 mb-1">{step.tech}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


          {/* Engine Diagnostics Sidebar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-5 h-fit space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700/60 pb-2">
              Engine Diagnostics
            </h3>
            
            <div>
              <span className="text-xs text-slate-500 block mb-1">Embedding Model</span>
              <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-sky-400 px-2 py-1 rounded block">
                text-embedding-3-small (1536 dim)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">Vector Index</span>
              <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded block">
                Pinecone (Cosine Distance)
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-1">CMS Synchronisation</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-slate-300">Sanity Webhooks Active</span>
              </div>
            </div>

            {hasSearched && !loading && (
              <div className="border-t border-slate-700/60 pt-3">
                <span className="text-xs text-slate-500 block mb-1">Latency Breakdown</span>
                <div className="text-xs font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between"><span>Embedding API:</span> <span>{latency.embedding} ms</span></div>
                  <div className="flex justify-between"><span>Vector Match:</span> <span>{latency.vector} ms</span></div>
                  <div className="flex justify-between"><span>CMS Hydration:</span> <span>{latency.cms} ms</span></div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}