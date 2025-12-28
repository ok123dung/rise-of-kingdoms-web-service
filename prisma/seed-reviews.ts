/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Vietnamese review templates for realistic data - expanded for all services
const reviewTemplates = [
  // General positive reviews
  { rating: 5, feedback: 'Dịch vụ tuyệt vời! Nhân viên hỗ trợ rất nhiệt tình và chuyên nghiệp. Sẽ quay lại lần sau.' },
  { rating: 5, feedback: 'Hoàn thành đúng hẹn, chất lượng vượt mong đợi. Cảm ơn team rất nhiều!' },
  { rating: 5, feedback: 'Rất hài lòng với kết quả. Tài khoản đã được optimize tốt hơn nhiều.' },
  { rating: 4, feedback: 'Dịch vụ tốt, nhưng cần cải thiện thời gian phản hồi một chút.' },
  { rating: 4, feedback: 'Kill points đạt yêu cầu. Team làm việc chăm chỉ. Sẽ giới thiệu bạn bè.' },
  { rating: 4, feedback: 'Tư vấn rất hữu ích, giờ đã biết cách build commander đúng cách.' },
  { rating: 5, feedback: 'VIP support 24/7 đúng như cam kết. Response rất nhanh!' },
  { rating: 4, feedback: 'Đã dùng dịch vụ 3 lần, lần nào cũng hài lòng.' },
  { rating: 5, feedback: 'Kết quả KvK xuất sắc! Đạt top 10 kill ranking.' },
  { rating: 3, feedback: 'Dịch vụ ổn, nhưng có thể làm tốt hơn về communication.' },
  { rating: 5, feedback: 'Chăm sóc tài khoản cẩn thận, daily quest luôn đủ.' },
  { rating: 4, feedback: 'Equipment được tối ưu rất tốt. Sẽ tiếp tục sử dụng.' },
  { rating: 5, feedback: 'Đội ngũ chuyên nghiệp, hiểu game sâu. Recommend 100%!' },
  { rating: 4, feedback: 'Giá cả hợp lý so với chất lượng dịch vụ nhận được.' },
  { rating: 5, feedback: 'Migration support rất smooth, không gặp vấn đề gì.' },
  // Alliance management reviews
  { rating: 5, feedback: 'Alliance của mình đã lên top 3 server nhờ tư vấn quản lý.' },
  { rating: 4, feedback: 'Hệ thống tuyển dụng thành viên rất hiệu quả, alliance đông hẳn lên.' },
  { rating: 5, feedback: 'Quản lý sự kiện alliance giờ đơn giản hơn nhiều. Worth it!' },
  // KvK support reviews
  { rating: 5, feedback: 'KvK vừa rồi kingdom mình thắng áp đảo nhờ chiến thuật từ team!' },
  { rating: 4, feedback: 'Coordination team rất tốt, map control hiệu quả.' },
  { rating: 5, feedback: 'Honor points tăng gấp đôi so với KvK trước. Cực kỳ hài lòng!' },
  // VIP support reviews
  { rating: 5, feedback: 'Response trong vòng 5 phút bất kể giờ nào. VIP service thực sự!' },
  { rating: 5, feedback: 'Dedicated manager rất tận tâm, giải quyết mọi vấn đề nhanh chóng.' },
  { rating: 4, feedback: 'All-in-one service, không cần lo gì cả. Giá hơi cao nhưng worth.' },
  // Commander training reviews
  { rating: 5, feedback: 'Từ noob giờ đã biết pair commander chuẩn. Session 1-1 rất hiệu quả!' },
  { rating: 4, feedback: 'Talent build được optimize, march power tăng 20%.' },
  { rating: 5, feedback: 'Coach giải thích rất dễ hiểu, từ cơ bản đến nâng cao.' },
  // Personal coaching reviews
  { rating: 5, feedback: 'Top player hướng dẫn trực tiếp, học được rất nhiều tricks.' },
  { rating: 4, feedback: 'Session customize theo nhu cầu cá nhân rất hữu ích.' },
  { rating: 5, feedback: 'Follow-up support sau session rất tốt, có gì hỏi đều được giải đáp.' }
]

// Test user names (Vietnamese)
const testUsers = [
  { full_name: 'Nguyễn Văn A', email: 'nguyenvana_test@example.com' },
  { full_name: 'Trần Thị B', email: 'tranthib_test@example.com' },
  { full_name: 'Lê Hoàng C', email: 'lehoangc_test@example.com' },
  { full_name: 'Phạm Minh D', email: 'phamminhd_test@example.com' },
  { full_name: 'Hoàng Thế E', email: 'hoangthee_test@example.com' },
  { full_name: 'Vũ Đình F', email: 'vudinhf_test@example.com' },
  { full_name: 'Đặng Quang G', email: 'dangquangg_test@example.com' },
  { full_name: 'Bùi Hải H', email: 'buihaih_test@example.com' }
]

// Dummy hashed password for test users (not for real auth)
const DUMMY_PASSWORD_HASH = '$2b$10$dummyhashforseeddatareviewsonly'

function generateBookingNumber(): string {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ROK-${dateStr}-${random}`
}

async function main() {
  console.log('Seeding review data...')

  // Get all services with their tiers
  const services = await prisma.services.findMany({
    where: { is_active: true },
    include: {
      service_tiers: {
        where: { is_available: true }
      }
    }
  })

  if (services.length === 0) {
    console.log('No services found. Run main seed first.')
    return
  }

  console.log(`Found ${services.length} services`)

  // Create test users
  const createdUsers: string[] = []
  for (const userData of testUsers) {
    const now = new Date()
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    const user = await prisma.users.upsert({
      where: { email: userData.email },
      update: { full_name: userData.full_name },
      create: {
        id: randomUUID(),
        email: userData.email,
        full_name: userData.full_name,
        password: DUMMY_PASSWORD_HASH,
        created_at: createdAt,
        updated_at: now
      }
    })
    createdUsers.push(user.id)
    console.log(`Created/Updated user: ${user.full_name}`)
  }

  // Create bookings with reviews - distribute evenly across services
  let reviewCount = 0
  const reviewsPerService = 5 // Each service gets 5 reviews

  for (const service of services) {
    if (service.service_tiers.length === 0) {
      console.log(`Skipping ${service.name} - no tiers available`)
      continue
    }

    console.log(`\nSeeding reviews for: ${service.name}`)

    for (let i = 0; i < reviewsPerService; i++) {
      const userId = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const tier = service.service_tiers[Math.floor(Math.random() * service.service_tiers.length)]
      const review = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)]

      // Random date within last 60 days
      const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      const completedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)

      const booking = await prisma.bookings.create({
        data: {
          id: randomUUID(),
          booking_number: generateBookingNumber(),
          user_id: userId,
          service_tier_id: tier.id,
          status: 'completed',
          payment_status: 'completed',
          total_amount: tier.price,
          discount_amount: 0,
          final_amount: tier.price,
          currency: 'VND',
          completion_percentage: 100,
          customer_rating: review.rating,
          customer_feedback: review.feedback,
          created_at: createdAt,
          updated_at: completedAt,
          start_date: createdAt,
          end_date: completedAt
        }
      })

      reviewCount++
      console.log(`  Created ${booking.booking_number} with ${review.rating}★ for ${tier.name}`)
    }
  }

  console.log(`\nSeeding completed! Created ${reviewCount} reviews across ${services.length} services.`)
}

void main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
