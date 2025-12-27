import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { prisma } from '@/lib/db'

import ServiceDetailClient from './ServiceDetailClient'

interface ServicePageProps {
  params: {
    slug: string
  }
}

async function getService(slug: string) {
  return prisma.services.findUnique({
    where: { slug, is_active: true },
    include: {
      service_tiers: {
        where: { is_active: true },
        orderBy: { sort_order: 'asc' }
      }
    }
  })
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await getService(params.slug)

  if (!service) {
    return {
      title: 'Dịch vụ không tồn tại - RoK Services',
      description: 'Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.'
    }
  }

  return {
    title: `${service.name} - RoK Services Premium`,
    description: service.description ?? service.short_description,
    openGraph: {
      title: `${service.name} - Dịch vụ Rise of Kingdoms Hàng Đầu`,
      description: service.description ?? service.short_description ?? undefined,
      images: ['/og-image.png'],
      type: 'website',
      url: `/services/${service.slug}`
    },
    alternates: {
      canonical: `/services/${service.slug}`
    }
  }
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const service = await getService(params.slug)

  if (!service) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rokdbot.com'
  const breadcrumbItems = [
    { name: 'Trang chủ', url: siteUrl },
    { name: 'Dịch vụ', url: `${siteUrl}/services` },
    { name: service.name, url: `${siteUrl}/services/${params.slug}` }
  ]

  // Serialize service data for client component
  const serviceData = {
    slug: service.slug,
    name: service.name,
    description: service.description ?? '',
    shortDescription: service.short_description ?? '',
    tiers: service.service_tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      slug: tier.slug,
      price: Number(tier.price),
      features: tier.features as string[],
      isPopular: tier.is_popular
    }))
  }

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <ServiceDetailClient slug={params.slug} serviceData={serviceData} />
    </>
  )
}
