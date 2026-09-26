// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discovery-engine-plum-three.vercel.app'
  const baseUrl = rawBaseUrl.replace(/\/$/, '')

  return {
    rules: [
      {
        // Default rule for general web crawlers
        userAgent: '*',
        allow: '/',
        disallow: ['/api/chat', '/api/webhooks/'],
      },
      {
        // Explicit access for LinkedIn scraper
        userAgent: 'LinkedInBot',
        allow: ['/', '/api/og*'],
      },
      {
        // Explicit access for Facebook/OpenGraph crawler
        userAgent: 'facebookexternalhit',
        allow: ['/', '/api/og*'],
      },
      {
        // Explicit access for Twitter/X card bot
        userAgent: 'Twitterbot',
        allow: ['/', '/api/og*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}