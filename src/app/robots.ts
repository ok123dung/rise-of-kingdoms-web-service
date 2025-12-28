import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Trim to remove any trailing newlines from env variable
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rokdbot.com').trim()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/auth/']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
