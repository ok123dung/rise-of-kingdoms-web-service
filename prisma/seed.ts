/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const servicesData = [
  {
    slug: 'strategy-consulting',
    name: 'Tư vấn chiến thuật',
    description: 'Tư vấn xây dựng tài khoản, phát triển commander và equipment tối ưu nhất.',
    shortDescription: 'Tối ưu hóa tài khoản và chiến thuật',
    basePrice: 500000,
    category: 'consulting',
    isFeatured: true,
    tiers: [
      {
        name: 'Cơ bản',
        slug: 'strategy-consulting-basic',
        price: 500000,
        features: ['Phân tích tài khoản', 'Gợi ý Commander', 'Lộ trình 1 tháng'],
        sortOrder: 1
      },
      {
        name: 'Nâng cao',
        slug: 'strategy-consulting-advanced',
        price: 1500000,
        features: ['Phân tích chuyên sâu', 'Tối ưu Equipment', 'Lộ trình 3 tháng', 'Support 1-1'],
        isPopular: true,
        sortOrder: 2
      }
    ]
  },
  {
    slug: 'kvk-support',
    name: 'Hỗ trợ KvK',
    description: 'Dịch vụ hỗ trợ đi đánh KvK, đảm bảo kill points và death theo yêu cầu.',
    shortDescription: 'Hỗ trợ đánh KvK chuyên nghiệp',
    basePrice: 2000000,
    category: 'gameplay',
    isFeatured: true,
    tiers: [
      {
        name: 'Gói T4',
        slug: 'kvk-support-t4',
        price: 2000000,
        features: ['Đạt mốc Kill Points', 'Đảm bảo Death', 'Online 24/7'],
        sortOrder: 1
      },
      {
        name: 'Gói T5',
        slug: 'kvk-support-t5',
        price: 5000000,
        features: ['Đạt mốc Kill Points cao', 'Đảm bảo Death', 'Online 24/7', 'Livestream báo cáo'],
        isPopular: true,
        sortOrder: 2
      }
    ]
  },
  {
    slug: 'account-maintenance',
    name: 'Chăm sóc tài khoản',
    description: 'Dịch vụ đăng nhập hàng ngày, làm nhiệm vụ, thu gom tài nguyên.',
    shortDescription: 'Daily login và làm nhiệm vụ',
    basePrice: 300000,
    category: 'maintenance',
    tiers: [
      {
        name: 'Tuần',
        slug: 'account-maintenance-weekly',
        price: 300000,
        features: ['Login hàng ngày', 'Làm daily quest', 'Thu gom resource'],
        sortOrder: 1
      },
      {
        name: 'Tháng',
        slug: 'account-maintenance-monthly',
        price: 1000000,
        features: ['Login hàng ngày', 'Full sự kiện', 'Tối ưu tăng tốc', 'Báo cáo tuần'],
        isPopular: true,
        sortOrder: 2
      }
    ]
  }
]

async function main() {
  console.log('Start seeding...')

  for (const serviceData of servicesData) {
    const { tiers, ...serviceInfo } = serviceData

    const service = await prisma.service.upsert({
      where: { slug: serviceInfo.slug },
      update: serviceInfo,
      create: serviceInfo
    })

    console.log(`Created/Updated service: ${service.name}`)

    for (const tierData of tiers) {
      await prisma.serviceTier.upsert({
        where: {
          serviceId_slug: {
            serviceId: service.id,
            slug: tierData.slug
          }
        },
        update: {
          ...tierData,
          serviceId: service.id
        },
        create: {
          ...tierData,
          serviceId: service.id,
          features: tierData.features // Explicitly map features to Json
        }
      })
    }
  }

  console.log('Seeding finished.')
}

void main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
