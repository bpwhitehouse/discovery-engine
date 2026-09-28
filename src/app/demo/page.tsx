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
            
            {/* How it Works Anchor Button */}
            <a 
              href="#how-it-works" 
              className="w-fit inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-sky-400 text-xs px-3 py-1.5 rounded-full font-semibold transition-all shadow-sm group"
            >
              <span>How it Works</span>
              <svg className="w-3.5 h-3.5 text-sky-400 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
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
          <div className="bg-pink-200 border-2 border-sky-400 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 text-slate-950 text-xs font-semibold">
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <span><strong>Instruction:</strong> Enter a search query or click a search prompt preset to test semantic similarity retrieval from Pinecone:</span>
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
                <p className="text-slate-200 text-sm">Search result matches will show here.</p>
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

        {/* How It Works Explainer Section */}
        <section id="how-it-works" className="mt-16 border-t border-slate-700 pt-10 pb-6 text-slate-100">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-sky-300">How It Works</h2>
            <p className="text-slate-300 text-sm mt-1">An automated pipeline connecting content, vector search, and AI generation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-300">STEP 01</div>
              <h3 className="text-base font-semibold text-white">Content Updates</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When an editor creates, edits, or deletes product details in Sanity Studio, Sanity automatically sends a webhook alert to our server.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-300">STEP 02</div>
              <h3 className="text-base font-semibold text-white">AI Translation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our backend sends the updated text to OpenAI, converting words into a list of mathematical numbers (vector coordinates) representing semantic meaning.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-300">STEP 03</div>
              <h3 className="text-base font-semibold text-white">Vector Storage</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Those mathematical coordinates are saved in Pinecone—a specialised vector database built to compare data meaning at high speed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono font-bold text-sky-300">STEP 04</div>
              <h3 className="text-base font-semibold text-white">Smart Search &amp; Answers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                User queries are converted into coordinates, matched in Pinecone, and passed to OpenAI to write an accurate, grounded answer.
              </p>
            </div>
          </div>
        </section>

{/* Integration Overview Section */}
        <section id="integration-overview" className="mt-16 border-t border-slate-700 pt-10 pb-8 text-slate-100">
          {/* Section Header */}
          <div className="mb-8">
            <div className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider mb-1">Architecture &amp; Deployment</div>
            <h2 className="text-xl font-bold text-white">Integration Overview: Flexible AI Discovery Overlay</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              This solution operates as a flexible AI discovery engine hosted on Vercel. It can be deployed in two distinct ways depending on your enterprise architecture:
            </p>
          </div>

          {/* Deployment Options Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                <h3 className="text-base font-semibold text-white">Standalone Deployment</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Serves as a complete, self-contained AI web solution paired with any frontend rendering engine or CMS (e.g., Next.js, WordPress, or Drupal).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <h3 className="text-base font-semibold text-white">Monolithic Sidecar</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Runs alongside your existing enterprise platform (e.g., ASP.NET, Sitecore) to add natural language search and AI visibility without replacing your legacy database or interrupting operations.
              </p>
            </div>
          </div>

          {/* Key Architecture Breakdown */}
          <div className="space-y-8">
            
            {/* Item 1 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-sky-300 flex items-center gap-2">
                <span>1. Do You Still Need Sanity CMS?</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">Yes.</strong> Sanity acts as a specialised <strong className="text-slate-200">Headless Content Graph</strong> that sits parallel to your primary database.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-200">Role:</strong> Sanity stores complex, interconnected product data (e.g., Equipment &rarr; Accessories &rarr; Applications) using flexible GROQ queries.
                  </li>
                  <li>
                    <strong className="text-slate-200">Automated Catalog Syncing:</strong> Your existing database remains the master record. Whenever an editor updates a product, a background job automatically syncs the changes to Sanity via API. Sanity then immediately refreshes Pinecone (for AI intent matching) and Vercel (for high-speed delivery) in milliseconds.
                  </li>
                </ul>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-sky-300">
                2. How the System Powers Your Platform Beyond Search
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Plug-and-Play AI Search Experience</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Embed the search UI onto your existing site using a single line of JavaScript (like Google Analytics) or via a fast CDN routing rule.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Embedded JSON-LD Schemas for AI Engines</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Vercel serves an edge-cached API (<code className="text-sky-300 font-mono">GET /api/schema/[id]</code>) that your legacy site fetches and injects directly into its HTML <code className="text-sky-300 font-mono">&lt;head&gt;</code> tag. This ensures external AI tools (ChatGPT, Perplexity) accurately parse and cite your catalog.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Public AI Discovery Gateways</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The system automatically publishes a standardised <code className="text-sky-300 font-mono">llms.txt</code> file and an AI-specific sitemap, giving third-party AI crawlers a fast, structured gateway to index your full catalog.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Demand-Driven FAQ Generation</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The middleware analyses customer search queries. When interest surges for a specific topic (e.g., "Best centrifuges for cold room assays"), Next.js automatically generates permanent, pre-rendered Q&amp;A pages optimised for Google AI Overviews.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Executive Summary Banner */}
          <div className="mt-8 bg-sky-950/40 border border-sky-400/30 rounded-lg p-5">
            <div className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider mb-1">The Executive Summary</div>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              "Whether built as a new standalone frontend or deployed as a zero-risk sidecar to your monolithic database, this architecture delivers instant AI search, automated catalog sync, and next-generation search engine visibility."
            </p>
          </div>

        </section>

          {/* Key Architecture Breakdown */}
          <div className="space-y-8">
            
            {/* Item 1 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-sky-300 flex items-center gap-2">
                <span>1. Do You Still Need Sanity CMS?</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">Yes.</strong> Sanity acts as a specialised <strong className="text-slate-200">Headless Content Graph</strong> that sits parallel to your primary database.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-200">Role:</strong> Sanity stores complex, interconnected product data (e.g., Equipment &rarr; Accessories &rarr; Applications) using flexible GROQ queries.
                  </li>
                  <li>
                    <strong className="text-slate-200">Automated Catalog Syncing:</strong> Your existing database remains the master record. Whenever an editor updates a product, a background job automatically syncs the changes to Sanity via API. Sanity then immediately refreshes Pinecone (for AI intent matching) and Vercel (for high-speed delivery) in milliseconds.
                  </li>
                </ul>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-sky-300">
                2. How the System Powers Your Platform Beyond Search
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Plug-and-Play AI Search Experience</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Embed the search UI onto your existing site using a single line of JavaScript (like Google Analytics) or via a fast CDN routing rule.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Embedded JSON-LD Schemas for AI Engines</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Vercel serves an edge-cached API (<code className="text-sky-300 font-mono">GET /api/schema/[id]</code>) that your legacy site fetches and injects directly into its HTML <code className="text-sky-300 font-mono">&lt;head&gt;</code> tag. This ensures external AI tools (ChatGPT, Perplexity) accurately parse and cite your catalog.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Public AI Discovery Gateways</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The system automatically publishes a standardised <code className="text-sky-300 font-mono">llms.txt</code> file and an AI-specific sitemap, giving third-party AI crawlers a fast, structured gateway to index your full catalog.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Demand-Driven FAQ Generation</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The middleware analyses customer search queries. When interest surges for a specific topic (e.g., "Best centrifuges for cold room assays"), Next.js automatically generates permanent, pre-rendered Q&amp;A pages optimised for Google AI Overviews.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}