'use client';

import { useState } from 'react';
import Image from 'next/image';

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

  // Progressive Disclosure State: Controls whether technical breakdown is visible
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
      
      // Auto-reveal technical insights after search completes
      setShowTechnicalDetails(true);
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

        {/* Header Bar */}
        <header className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Benjamin Whitehouse
            </h1>
            <a href="https://www.bpwhitehouse.com" className="text-sm text-sky-600 hover:underline">
              bpwhitehouse.com
            </a>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              Product Leader · AI Strategy · Full-stack Foundations
            </span>
          </div>

          {/* Mode Switcher Badge */}
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://www.linkedin.com/in/bpwhitehouse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
            >
              <span>LinkedIn</span>
            </a>
          </div>
        </header>

        {/* Clean Production Hero & Search */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-block mb-3">
              Product Catalog Intelligence
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Find laboratory equipment with natural language intent
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Query complex equipment specifications, safety standards, and modular bench configurations <em>without needing exact keyword matches</em>.
            </p>
          </div>
          
          <div className="relative pt-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="What equipment are you searching for today?"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 pr-32 text-sm text-slate-900 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 top-4 bottom-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-5 rounded-lg text-xs transition-colors shadow-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-semibold text-[13px]">Suggested searches:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runPreset('Chemical storage fume extraction systems')}
                className="text-[13px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-medium transition-all"
              >
                "Chemical storage fume extraction"
              </button>
              <button
                onClick={() => runPreset('High-precision analytical balances and laboratory instruments')}
                className="text-[13px] bg-amber-200 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-medium transition-all"
              >
                "Precision balances"
              </button>
              <button
                onClick={() => runPreset('Custom modular lab furniture and ESD workbench setup')}
                className="text-[13px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-3 py-1 rounded-lg font-medium transition-all"
              >
                "Modular lab furniture"
              </button>
            </div>
            <div>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>{showTechnicalDetails ? 'Hide architecture' : 'Show architecture'}</span>
            </button>
            </div>
          </div>
        </section>

        {/* Results Container */}
        <section className="mb-6 space-y-4">
          <div id="results-anchor" className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Search Results</span>
            </div>
            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold border border-slate-200">
              {hasSearched ? `${results.length} Matches Found` : 'Awaiting Query'}
            </span>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center animate-pulse shadow-sm">
                <div className="inline-block h-6 w-6 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mb-3"></div>
                <p className="text-slate-600 text-xs font-semibold">Retrieving matches from product index...</p>
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
                <p className="text-xs text-slate-500">Type a search above or choose a suggested topic.</p>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && !error && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <p className="text-slate-500 text-xs font-medium">No matching products found for this search.</p>
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
                          {(item.score * 100).toFixed(0)}% Relevance Score
                        </span>
                      </div>
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
        </section>

        {/* CONDITIONALLY REVEALED TECHNICAL SECTIONS */}
        {showTechnicalDetails && (
          <div className="space-y-6 transition-all duration-500 ease-in-out border-t border-slate-200 pt-8 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Technical Insights
                </span>
                <h3 className="text-lg font-bold text-slate-900">System Architecture & Pipeline Diagnostics</h3>
              </div>
              <button
                onClick={() => setShowTechnicalDetails(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Hide Breakdown
              </button>
            </div>

            {/* Pipeline Status Banner */}
            <div className="flex items-center justify-between bg-sky-50/80 border border-sky-200/80 rounded-xl px-4 py-2.5 text-xs text-sky-900">
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 text-sky-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold">System Workflow & Live Pipeline:</span>
              </div>
              <span className="font-mono text-[10px] bg-sky-200/60 px-2 py-0.5 rounded text-sky-800 font-semibold">
                {loading ? 'Processing Search Step...' : hasSearched ? 'Pipeline Execution Complete' : 'Pipeline Ready'}
              </span>
            </div>

            {/* Pipeline Cards & Diagnostics Grid */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 4 Pipeline Steps */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pipelineSteps.map((step, idx) => {
                    const isActive = activeStep === idx + 1;
                    const isDone = activeStep > idx + 1;

                    return (
                      <div
                        key={step.num}
                        className={`p-4 rounded-xl border transition-all ${
                          isActive
                            ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300'
                            : isDone
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
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

                {/* Diagnostics Sidebar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Engine Diagnostics
                  </h3>

                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">Embedding Model</span>
                    <span className="text-xs font-mono bg-white border border-slate-200 text-sky-700 px-2.5 py-1 rounded block font-semibold">
                      text-embedding-3-small (1536)
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">Vector Index</span>
                    <span className="text-xs font-mono bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded block font-semibold">
                      Pinecone (Cosine Distance)
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">CMS Synchronisation</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1 rounded">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs text-slate-800 font-medium">Sanity Webhooks Active</span>
                    </div>
                  </div>

                  {hasSearched && !loading && (
                    <div className="border-t border-slate-200 pt-3">
                      <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Latency Breakdown</span>
                      <div className="text-xs font-mono text-slate-600 space-y-1 bg-white p-2.5 rounded border border-slate-200">
                        <div className="flex justify-between"><span>Embedding:</span> <span className="text-sky-700 font-semibold">{latency.embedding} ms</span></div>
                        <div className="flex justify-between"><span>Vector Match:</span> <span className="text-sky-700 font-semibold">{latency.vector} ms</span></div>
                        <div className="flex justify-between"><span>CMS Hydrate:</span> <span className="text-sky-700 font-semibold">{latency.cms} ms</span></div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </section>

            {/* CMS Operations Graphic */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Backend Operations
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Structured Content Management (Sanity Studio)
                </h3>
              </div>

              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner">
                <Image
                  src="/sanity-studio.png"
                  alt="Sanity Studio Content Management Studio"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover"
                  priority={false}
                />
              </div>
            </section>  
      
            {/* Pinecone Vector Graphic */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Vector Database & RAG Pipeline
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  High-Speed Vector Indexing & Hybrid Retrieval (Pinecone)
                </h3>
              </div>

              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner">
                <Image
                  src="/pineconeUI.png"
                  alt="Pinecone UI showing vector embeddings"
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover"
                  priority={false}
                />
              </div>
            </section>
          </div>
        )}

      </div>    
    </div>
  );
}