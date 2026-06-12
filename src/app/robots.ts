import { type MetadataRoute } from 'next'

// AI crawlers explicitly allowed so the site can be cited by LLM search
// (ChatGPT, Claude, Gemini, Perplexity, ...). Keep in sync with public/robots.txt
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'Applebot-Extended',
  'cohere-ai',
  'DuckAssistBot',
  'Amazonbot'
]

const PRIVATE_PATHS = ['/dashboard/', '/admin/', '/api/', '/auth/']

export default function robots(): MetadataRoute.Robots {
  // Trim to remove any trailing newlines from env variable
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rokdbot.com').trim()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS
      },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS
      }))
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
