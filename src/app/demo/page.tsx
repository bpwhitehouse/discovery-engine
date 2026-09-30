import React from 'react';

export default function Home() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', padding: '2rem 1rem' }}>
      {/* Header Section */}
      <header
        style={{
          maxWidth: '800px',
          margin: '0 auto 3rem auto',
          paddingBottom: '2rem',
          borderBottom: '2px solid #cbd5e1',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            Benjamin Whitehouse
          </h1>
          <div style={{ display: 'flex', gap: '1rem', margin: 0 }}>
            <a
              href="https://www.linkedin.com/in/bpwhitehouse"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              LinkedIn
            </a>
          </div>
        </div>

        <p
          style={{
            color: '#0284c7',
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
          }}
        >
          Product Leader · AI Strategy · Full-Stack Foundations
        </p>

        <p
          style={{
            color: '#334155',
            fontSize: '1rem',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Senior Product Manager with technical roots in full-stack architecture and AI systems.
          Specialising in zero-to-one product strategy, semantic discovery engines, and scaling user-centric platforms.
        </p>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Additional page sections can go here */}
      </main>
    </div>
  );
}