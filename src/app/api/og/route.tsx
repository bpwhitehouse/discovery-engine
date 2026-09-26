import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Discovery Engine'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 20, color: '#38bdf8', marginBottom: 12, letterSpacing: '0.1em' }}>
          LAB DISCOVERY ENGINE
        </div>
        <div style={{ fontSize: 52, fontWeight: 'bold', lineHeight: 1.2 }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}