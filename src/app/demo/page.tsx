'use client';

import { useState } from 'react';

export default function DiscoveryEngineDemo() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<boolean>(false);
  const [latency, setLatency] = useState({ embedding: 0, vector: 0, cms: 0 });

  const handleSearch = async (searchQuery?: string) => {
    const activeQuery = searchQuery ?? query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setResults(false);

    // Call your actual Next.js API route here:
    // const res = await fetch(`/api/search?q=${encodeURIComponent(activeQuery)}`);
    // const data = await res.json();

    // Simulated latency & response for demo purposes:
    setTimeout(() => {
      setLatency({ embedding: 42, vector: 18, cms: 25 });
      setLoading(false);
      setResults(true);
    }, 300);
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
              <h1 className="text-2xl font-bold text-sky-400">Semantic Discovery Engine</h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time vector search powered by Next.js, OpenAI Embeddings, Pinecone &amp; Sanity CMS
              </p>
            </div>
            <span className="w-fit bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs px-3 py-1 rounded-full font-medium">
              Live System Demo
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
              placeholder="Ask a question or search by concept (e.g., 'How do we measure product growth in EdTech?')..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3.5 pr-28 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <button 
              onClick={() => handleSearch()}
              className="absolute right-2 top-2 bottom-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-semibold px-4 rounded-md text-sm transition-colors"
            >
              Search
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-slate-400">Try sample prompts:</span>
            <button 
              onClick={() => runPreset('AI triage and human-in-the-loop workflows')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
            >
              "AI triage and human-in-the-loop workflows"
            </button>
            <button 
              onClick={() => runPreset('Scaling digital platforms and taxonomy')} 
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
            >
              "Scaling digital platforms and taxonomy"
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-8 text-center animate-pulse">
                <p className="text-sky-400 text-sm font-medium">Generating embeddings &amp; querying vector index...</p>
              </div>
            )}

            {!loading && !results && (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-8 text-center">
                <p className="text-slate-400 text-sm">Enter a search query or click a preset above to test semantic similarity retrieval.</p>
              </div>
            )}

            {!loading && results && (
              <div className="bg-slate-800 border border-slate-700/80 rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
                    Score: 0.92 Match
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Sanity ID: doc_9824a</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-100">AI-Assisted Workflow &amp; Intake Transformation</h4>
                <p class="text-sm text-slate-300 leading-relaxed">
                  Spearheaded the product modernisation of core manuscript intake portals. Deployed AI-assisted early triage and automated risk signals to capture metadata and eliminate downstream delays.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs bg-slate-900 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded">AI Triage</span>
                  <span className="text-xs bg-slate-900 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded">Human-in-the-Loop</span>
                </div>
              </div>
            )}
          </div>

          {/* Engine Diagnostics Sidebar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-5 h-fit space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700/60 pb-2">
              Engine Diagnostics
            </h3>
            
            <div>
              <span class="text-xs text-slate-500 block mb-1">Embedding Model</span>
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

            {results && (
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