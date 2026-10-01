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

export default function DemoClient() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [latency, setLatency] = useState<LatencyBreakdown>({ embedding: 0, vector: 0, cms: 0 });
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const pipelineSteps = [
    {
      num: '01',
      title: 'Real-time Webhooks',
      tech: 'Sanity CMS → Next.js',
      desc: 'CMS content changes trigger instant backend updates.',
    },
    {
      num: '02',
      title: '1,536-Dim Vectorise',
      tech: 'OpenAI Embeddings',
      desc: 'Translates user search query intent into mathematical vectors.',
      time: latency.embedding ? `${latency.embedding}ms` : null,
    },
    {
      num: '03',
      title: 'Cosine Distance Match',
      tech: 'Pinecone Vector DB',
      desc: 'Ranks products by high-dimensional similarity to user search intent.',
      time: latency.vector ? `${latency.vector}ms` : null,
    },
    {
      num: '04',
      title: 'Grounded Output',
      tech: 'GPT-4o Mini RAG',
      desc: 'Synthesises structured, hallucination-free answers in search results!',
      time: latency.cms ? `${latency.cms}ms` : null,
    },
  ];

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
      setError('Failed to fetch dynamic vector results. Please ensure /api/search is active.');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* 1. Header Bar */}
        <header className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Benjamin Whitehouse
            </h1>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              Product Leader · AI Strategy · Full-stack Foundations
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://www.linkedin.com/in/bpwhitehouse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
            >
              <span>LinkedIn</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
              </svg>
            </a>
          </div>
        </header>

        {/* 2. Search Bar & Presets */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                See how AI can help people find the right laboratory equipment using everyday language.
              </h2>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter your search  hereWhat are you looking for?"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 pr-32 text-sm text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 rounded-lg text-xs transition-colors shadow-sm"
            >
              {loading ? 'Processing...' : 'Search'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-semibold text-[13px]">Or try a suggested search:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runPreset('Chemical storage fume extraction systems')}
                className="text-[13px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-mono font-medium transition-all"
              >
                &quot;Chemical storage &amp; fume extraction&quot;
              </button>
              <button
                onClick={() => runPreset('High-precision analytical balances and laboratory instruments')}
                className="text-[13px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-mono font-medium transition-all"
              >
                &quot;Precision balances&quot;
              </button>
              <button
                onClick={() => runPreset('Custom modular lab furniture and ESD workbench setup')}
                className="text-[13px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-mono font-medium transition-all"
              >
                &quot;Modular lab furniture&quot;
              </button>
            </div>
          </div>
        </section>

       {/* 3. Visual Pipeline */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pipelineSteps.map((step, idx) => {
              const isActive = activeStep === idx + 1;
              const isDone = activeStep > idx + 1;

              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : isDone
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-sky-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {step.num}
                    </span>
                    {step.time && (
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded text-slate-700 border border-slate-200 font-medium">
                        {step.time}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-2 mb-0.5">{step.title}</h3>
                  <p className="text-[11px] font-mono text-sky-700 font-medium mb-1">{step.tech}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Results Banner */}
        <div id="results-anchor" className="flex items-center justify-between bg-sky-50/80 border border-sky-200/80 rounded-xl px-4 py-2.5 mb-6 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7" />
            </svg>
            <span className="font-semibold">
              Results:
            </span>
            <span className="text-sky-700 font-normal hidden sm:inline">
              Products are matched to your search using AI, with related products and catalogue categories connected to improve the results. Each result shows a match score based on its similarity to your search.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-sky-200/60 px-2 py-0.5 rounded text-sky-800 font-semibold">
            {hasSearched ? `${results.length} Matches Found` : 'Awaiting Query'}
          </span>
        </div>

        {/* 5. Results & Diagnostics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center animate-pulse shadow-sm">
                <div className="inline-block h-6 w-6 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></div>
                <p className="text-sky-700 text-xs font-semibold">Generating query embedding &amp; running Pinecone vector match...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-red-700 text-xs font-semibold">{error}</p>
              </div>
            )}

            {!loading && !hasSearched && !error && (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center shadow-sm">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">No Query Executed Yet</h4>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <p className="text-slate-500 text-xs font-medium">No product matches met the vector similarity threshold.</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((item, index) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm hover:border-sky-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                          {(item.score * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.sanityId ? `Sanity ID: ${item.sanityId}` : `ID: ${item.id}`}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 h-fit space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Engine Diagnostics
            </h3>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Embedding Model</span>
              <span className="text-xs font-mono bg-slate-50 border border-slate-200 text-sky-700 px-2.5 py-1 rounded block font-semibold">
                text-embedding-3-small (1536)
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Vector Index</span>
              <span className="text-xs font-mono bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded block font-semibold">
                Pinecone (Cosine Distance)
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">CMS Synchronisation</span>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-800 font-medium">Sanity Webhooks Active</span>
              </div>
            </div>

            {hasSearched && !loading && (
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Latency Breakdown</span>
                <div className="text-xs font-mono text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex justify-between"><span>Embedding:</span> <span className="text-sky-700 font-semibold">{latency.embedding} ms</span></div>
                  <div className="flex justify-between"><span>Vector Match:</span> <span className="text-sky-700 font-semibold">{latency.vector} ms</span></div>
                  <div className="flex justify-between"><span>CMS Hydrate:</span> <span className="text-sky-700 font-semibold">{latency.cms} ms</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}