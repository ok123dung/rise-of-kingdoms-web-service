import { type MetadataRoute } from 'next'

import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rokdbot.com'

  // Fetch all active services
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  })

  const serviceUrls = services.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

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

  return [...staticRoutes, ...serviceUrls] as MetadataRoute.Sitemap
}
