import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { servicesData } from '@/data/services'
import ServiceDetailClient from './ServiceDetailClient'

interface ServicePageProps {
  params: {
    slug: string
  }
}

import { prisma } from '@/lib/db'

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug }
  })

  if (!service) {
    return {
      title: 'Dịch vụ không tồn tại - RoK Services',
      description: 'Dịch vụ bạn tìm kiếm không tồn tại hoặc đã bị xóa.'
    }
  }

  return {
    title: `${service.name} - RoK Services Premium`,
    description: service.description || service.shortDescription,
    openGraph: {
      title: `${service.name} - Dịch vụ Rise of Kingdoms Hàng Đầu`,
      description: service.description || service.shortDescription || undefined,
      images: ['/og-image.png'],
      type: 'website',
      url: `/services/${service.slug}`
    },
    alternates: {
      canonical: `/services/${service.slug}`
    }
  }
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const service = servicesData[params.slug]

  if (!service) {
    notFound()
  }

  // Pass slug instead of service object to avoid serialization issues with functions (icons)
  return <ServiceDetailClient slug={params.slug} />
}
