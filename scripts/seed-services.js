const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
  try {
    // Create services with tiers
    const services = [
      {
        slug: 'tu-van-chien-thuat',
        name: 'Tư vấn chiến thuật',
        description: 'Dịch vụ tư vấn chiến thuật chuyên sâu cho game thủ Rise of Kingdoms',
        category: 'consulting',
        basePrice: 750000,
        isActive: true,
        isFeatured: true,
        metadata: {
          duration: '1-3 hours',
          deliveryMethod: 'online',
          languages: ['vi', 'en']
        },
        tiers: [
          {
            name: 'Gói Cơ Bản',
            slug: 'goi-co-ban',
            description: 'Tư vấn chiến thuật cơ bản cho người chơi mới',
            price: 750000,
            currency: 'VND',
            duration: '1 hour',
            features: [
              'Phân tích đội hình hiện tại',
              'Lộ trình phát triển commander',
              'Chiến thuật PvP cơ bản',
              'Q&A 30 phút'
            ],
            isPopular: false,
            sortOrder: 1
          },
          {
            name: 'Gói Chuyên Nghiệp',
            slug: 'goi-chuyen-nghiep',
            description: 'Tư vấn chiến thuật nâng cao với phân tích chi tiết',
            price: 900000,
            currency: 'VND',
            duration: '2 hours',
            features: [
              'Phân tích chuyên sâu account',
              'Chiến thuật KvK chi tiết',
              'Tối ưu hóa tài nguyên',
              'Rally/Garrison strategies',
              'Q&A 45 phút',
              'Follow-up 1 tuần'
            ],
            isPopular: true,
            sortOrder: 2
          },
          {
            name: 'Gói Premium',
            slug: 'goi-premium',
            description: 'Gói tư vấn toàn diện với mentor 1-1',
            price: 1200000,
            currency: 'VND',
            duration: '3 hours',
            features: [
              'Mentor 1-1 với top player',
              'Chiến lược phát triển 6 tháng',
              'Phân tích video trận đấu',
              'Tư vấn đầu tư hiệu quả',
              'Support 24/7 trong 1 tháng',
              'Tham gia nhóm VIP'
            ],
            isPopular: false,
            sortOrder: 3
          }
        ]
      },
      {
        slug: 'farm-gem-an-toan',
        name: 'Farm Gem an toàn',
        description: 'Dịch vụ farm gem an toàn, uy tín với đội ngũ chuyên nghiệp',
        category: 'farming',
        basePrice: 500000,
        isActive: true,
        metadata: {
          safety: '100% safe',
          method: 'manual',
          guarantee: 'refund if banned'
        },
        tiers: [
          {
            name: 'Gói 10K Gems',
            slug: 'goi-10k-gems',
            description: 'Farm 10,000 gems an toàn',
            price: 500000,
            currency: 'VND',
            duration: '3-5 days',
            features: [
              '10,000 gems',
              'Farm thủ công 100%',
              'Bảo mật tuyệt đối',
              'Hoàn tiền nếu bị ban'
            ],
            isPopular: false,
            sortOrder: 1
          },
          {
            name: 'Gói 25K Gems',
            slug: 'goi-25k-gems',
            description: 'Farm 25,000 gems với ưu đãi đặc biệt',
            price: 1000000,
            currency: 'VND',
            duration: '7-10 days',
            features: [
              '25,000 gems',
              'Farm thủ công 100%',
              'Bonus 5% gems',
              'Ưu tiên xử lý',
              'Bảo hiểm 100%'
            ],
            isPopular: true,
            sortOrder: 2
          },
          {
            name: 'Gói 50K Gems',
            slug: 'goi-50k-gems',
            description: 'Gói farm gem lớn cho các sự kiện quan trọng',
            price: 1800000,
            currency: 'VND',
            duration: '14-20 days',
            features: [
              '50,000 gems',
              'Farm thủ công 100%',
              'Bonus 10% gems',
              'Dedicated farmer',
              'Báo cáo tiến độ hàng ngày',
              'Tư vấn sử dụng gem hiệu quả'
            ],
            isPopular: false,
            sortOrder: 3
          }
        ]
      },
      {
        slug: 'ho-tro-kvk',
        name: 'Hỗ trợ KvK chuyên nghiệp',
        description: 'Dịch vụ hỗ trợ Kingdom vs Kingdom với đội ngũ top player',
        category: 'support',
        basePrice: 1500000,
        isActive: true,
        isFeatured: true,
        metadata: {
          availability: '24/7 during KvK',
          teamSize: '5-10 players',
          experience: '50+ KvK seasons'
        },
        tiers: [
          {
            name: 'Gói Rally Leader',
            slug: 'goi-rally-leader',
            description: 'Rally leader chuyên nghiệp cho KvK',
            price: 1500000,
            currency: 'VND',
            duration: 'Per KvK day',
            features: [
              'Rally leader kinh nghiệm',
              'Online 8 giờ/ngày',
              'Chiến thuật rally chuyên sâu',
              'Phối hợp với R4/R5',
              'Báo cáo sau mỗi ngày'
            ],
            isPopular: false,
            sortOrder: 1
          },
          {
            name: 'Gói Garrison Captain',
            slug: 'goi-garrison-captain',
            description: 'Garrison captain 24/7 cho pass quan trọng',
            price: 2000000,
            currency: 'VND',
            duration: 'Per KvK day',
            features: [
              'Garrison captain chuyên nghiệp',
              'Online 12 giờ/ngày',
              'Kinh nghiệm 50+ KvK',
              'Equipment tối ưu',
              'Phối hợp đội garrison',
              'Tư vấn reinforce hiệu quả'
            ],
            isPopular: true,
            sortOrder: 2
          },
          {
            name: 'Gói Field Control',
            slug: 'goi-field-control',
            description: 'Đội hình field control chuyên nghiệp',
            price: 5000000,
            currency: 'VND',
            duration: 'Per KvK day',
            features: [
              'Team 5 người chuyên nghiệp',
              'Kiểm soát field 24/7',
              'Marches coordination',
              'Voice chat riêng',
              'Chiến thuật đặc biệt',
              'Hỗ trợ đạt mục tiêu kingdom'
            ],
            isPopular: false,
            sortOrder: 3
          }
        ]
      }
    ];

    for (const serviceData of services) {
      const { tiers, ...service } = serviceData;
      
      const createdService = await prisma.service.create({
        data: {
          ...service,
          serviceTiers: {
            create: tiers
          }
        },
        include: {
          serviceTiers: true
        }
      });
      
      console.log(`✅ Created service: ${createdService.name} with ${createdService.serviceTiers.length} tiers`);
    }

    console.log('\n🎉 All services seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();