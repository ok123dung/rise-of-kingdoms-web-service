import { type MetadataRoute } from 'next'

// Check if we're in build phase to avoid DB access during static generation
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ??
  (process.env.VERCEL && process.env.VERCEL_ENV === undefined)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rokdbot.com'

  // Static routes - always included
  const staticRoutes = [
    '',
    '/services',
    '/contact',
    '/about',
    '/guides',
    '/alliance',
    '/auth/signin',
    '/auth/signup',
    '/terms',
    '/privacy'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : ('weekly' as const),
    priority: route === '' ? 1 : 0.7
  }))

  // Skip DB access during build phase
  if (isBuildPhase) {
    return staticRoutes as MetadataRoute.Sitemap
  }

  // Lazy import prisma only at runtime
  const dbModule = await import('@/lib/db')
  const { prisma } = dbModule

  // Fetch all active services
  let serviceUrls: Array<{
    url: string
    lastModified: Date
    changeFrequency: 'weekly'
    priority: number
  }> = []

  try {
    if (!prisma) {
      console.warn('Sitemap: Prisma not available')
      return staticRoutes as MetadataRoute.Sitemap
    }

    const services = await prisma.services.findMany({
      where: { is_active: true },
      select: { slug: true, updated_at: true }
    })

    serviceUrls = services.map(service => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  } catch {
    // If DB is not available, just return static routes
    console.warn('Sitemap: Could not fetch services from database')
  }

  return [...staticRoutes, ...serviceUrls] as MetadataRoute.Sitemap
}
