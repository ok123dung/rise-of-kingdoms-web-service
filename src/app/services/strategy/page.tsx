import {
  TrendingUp,
  Shield,
  Crown,
  Gem,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Award,
  BarChart3,
  Zap,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { VietnameseGamingSchema } from '@/components/seo/VietnameseGamingSEO'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tư vấn chiến thuật Rise of Kingdoms - Dịch vụ chuyên gia RoK',
  description:
    'Dịch vụ tư vấn chiến thuật Rise of Kingdoms chuyên nghiệp: Tối ưu farm gem 4-15k/ngày, build commander hiệu quả, tăng power nhanh chóng. Đội ngũ chuyên gia top 1% Việt Nam.',
  keywords: [
    'Rise of Kingdoms strategy',
    'RoK consulting Vietnam',
    'tư vấn chiến thuật RoK',
    'Rise of Kingdoms gem farming',
    'commander build guide',
    'RoK power increase',
    'Rise of Kingdoms coaching',
    'chiến thuật Rise of Kingdoms'
  ]
}

interface PricingTier {
  id: string
  name: string
  price: string
  original_price?: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
}

const pricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic Strategy',
    price: '750.000 VNĐ/tháng',
    original_price: '900.000 VNĐ/tháng',
    description: 'Tư vấn chiến thuật cơ bản cho người chơi mới',
    features: [
      'Phân tích tài khoản chi tiết (20+ metrics)',
      'Lộ trình phát triển 3 tháng',
      'Tư vấn build 3 commander chính',
      'Chiến thuật farm gem 4-7k/ngày',
      'Hỗ trợ chat trong giờ hành chính',
      'Báo cáo tiến độ hàng tuần',
      'Guide mua đồ merchant cơ bản'
    ],
    cta: 'Bắt đầu Basic'
  },
  {
    id: 'pro',
    name: 'Pro Strategy',
    price: '900.000 VNĐ/tháng',
    original_price: '1.100.000 VNĐ/tháng',
    description: 'Tư vấn toàn diện cho game thủ nghiêm túc',
    popular: true,
    features: [
      'Tất cả tính năng Basic PLUS',
      'Chiến thuật farm gem 8-15k/ngày',
      'Tư vấn build 5+ commanders',
      'Optimization talent trees chi tiết',
      'Hỗ trợ chat 16/7 (6AM-10PM)',
      'Chiến thuật KvK cơ bản',
      'Event participation strategy',
      'Resource management tối ưu'
    ],
    cta: 'Chọn Pro (Phổ biến)'
  },
  {
    id: 'premium',
    name: 'Premium Strategy',
    price: '1.200.000 VNĐ/tháng',
    original_price: '1.500.000 VNĐ/tháng',
    description: 'Coaching cá nhân từ top players',
    features: [
      'Tất cả tính năng Pro PLUS',
      'Personal strategy coach riêng',
      'Chiến thuật farm gem 12-20k/ngày',
      'Advanced KvK coordination',
      'Hỗ trợ 24/7 với hotline riêng',
      'Custom event strategies',
      'Alliance management consulting',
      'Guaranteed power increase 100%+'
    ],
    cta: 'Upgrade Premium'
  }
]

const caseStudies = [
  {
    playerName: 'Nguyễn Minh Tuấn',
    kingdom: 'Kingdom 2847',
    timeframe: '3 tháng',
    beforeStats: {
      power: '52M',
      rank: 'Top 200',
      gems: '2k/ngày'
    },
    afterStats: {
      power: '127M',
      rank: 'Top 15',
      gems: '12k/ngày'
    },
    improvement: '+144% Power, +500% Gem farming',
    testimonial:
      'Chiến thuật farm gem và build commander của team cực kỳ hiệu quả. Từ một F2P player, giờ tôi có thể cạnh tranh với những spender nhỏ.',
    service: 'Pro Strategy'
  },
  {
    playerName: 'Trần Thị Hương',
    kingdom: 'Kingdom 3156',
    timeframe: '4 tháng',
    beforeStats: {
      power: '89M',
      rank: 'Top 50',
      gems: '5k/ngày'
    },
    afterStats: {
      power: '245M',
      rank: 'Top 3',
      gems: '18k/ngày'
    },
    improvement: '+175% Power, Kingdom Top 3',
    testimonial:
      'Premium coaching giúp tôi hiểu sâu về meta game. Đặc biệt là chiến thuật KvK, alliance của chúng tôi đã thắng 4 KvK liên tiếp.',
    service: 'Premium Strategy'
  },
  {
    playerName: 'Lê Đức Anh',
    kingdom: 'Kingdom 2934',
    timeframe: '2 tháng',
    beforeStats: {
      power: '28M',
      rank: 'Top 500',
      gems: '1k/ngày'
    },
    afterStats: {
      power: '78M',
      rank: 'Top 80',
      gems: '8k/ngày'
    },
    improvement: '+178% Power trong 2 tháng',
    testimonial:
      'Là newbie, tôi không biết gì về RoK. Basic strategy package giúp tôi có nền tảng vững chắc và phát triển nhanh chóng.',
    service: 'Basic Strategy'
  }
]

const methodology = [
  {
    step: 1,
    title: 'Phân tích tài khoản toàn diện',
    description:
      'Đánh giá chi tiết commanders, buildings, research, resources và xác định điểm mạnh/yếu',
    duration: '1-2 ngày',
    deliverable: 'Báo cáo phân tích 15+ trang'
  },
  {
    step: 2,
    title: 'Xây dựng lộ trình phát triển',
    description: 'Tạo roadmap 3-6 tháng với mục tiêu cụ thể và timeline chi tiết',
    duration: '1 ngày',
    deliverable: 'Lộ trình phát triển cá nhân'
  },
  {
    step: 3,
    title: 'Tối ưu hóa farm gem strategy',
    description: 'Setup chiến thuật farm gem an toàn, hiệu quả với target 4-20k gems/ngày',
    duration: '2-3 ngày',
    deliverable: 'Guide farm gem chi tiết + tools'
  },
  {
    step: 4,
    title: 'Commander build optimization',
    description: 'Tư vấn build commanders theo meta, talent trees và equipment tối ưu',
    duration: '3-4 ngày',
    deliverable: 'Commander build guides'
  },
  {
    step: 5,
    title: 'Resource management setup',
    description: 'Hướng dẫn quản lý resources, speedups và items hiệu quả',
    duration: '1-2 ngày',
    deliverable: 'Resource management system'
  },
  {
    step: 6,
    title: 'Implementation & monitoring',
    description: 'Triển khai chiến thuật và theo dõi tiến độ hàng tuần',
    duration: 'Ongoing',
    deliverable: 'Weekly progress reports'
  },
  {
    step: 7,
    title: 'Optimization & scaling',
    description: 'Điều chỉnh chiến thuật dựa trên kết quả và mở rộng quy mô',
    duration: 'Ongoing',
    deliverable: 'Monthly strategy updates'
  }
]

export default function StrategyServicePage() {
  return (
    <>
      <Header />
      <VietnameseGamingSchema />

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-white">
        <div className="container-max flex items-center justify-center space-x-4 text-sm font-medium">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>🔥 Tháng 12: Giảm 20% tất cả gói Strategy + Tặng 1 tuần Premium coaching!</span>
          <Clock className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="container-max">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Tư vấn chiến thuật <span className="text-gradient">Rise of Kingdoms</span> chuyên
                  nghiệp
                </h1>
                <p className="mb-6 text-xl text-gray-600">
                  Tăng power 100-200% trong 3 tháng với chiến thuật được kiểm chứng từ top 1%
                  players Việt Nam. Farm gem 4-20k/ngày an toàn, build commanders tối ưu.
                </p>

                {/* Key Benefits */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Gem className="h-6 w-6 text-yellow-500" />
                    <span className="font-medium">4-20k gems/ngày</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <span className="font-medium">+100-200% Power</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-500" />
                    <span className="font-medium">100% An toàn</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-purple-500" />
                    <span className="font-medium">Top 1% Experts</span>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    className="inline-flex transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:from-accent-700 hover:to-accent-800 hover:shadow-xl"
                    href="#pricing"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Tư vấn miễn phí 30 phút</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center space-x-2 rounded-xl border-2 border-primary-600 px-8 py-4 font-semibold text-primary-600 transition-all duration-200 hover:bg-primary-600 hover:text-white"
                    href="#case-studies"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Xem case studies</span>
                  </Link>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  ⚡ Đảm bảo hoàn tiền 100% trong 7 ngày • Chỉ còn 3 slot tháng này
                </p>
              </div>

              {/* Stats/Social Proof */}
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <h3 className="mb-6 text-center text-2xl font-bold text-gray-900">
                  Kết quả khách hàng
                </h3>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-green-600">+178%</div>
                    <div className="text-gray-600">Power tăng trung bình</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">15k</div>
                      <div className="text-sm text-gray-600">Gems/ngày max</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">98%</div>
                      <div className="text-sm text-gray-600">Hài lòng</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span>4.9/5 từ 200+ khách hàng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="section-padding bg-white" id="pricing">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Chọn gói phù hợp với mục tiêu của bạn
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                Từ người chơi mới đến top player, chúng tôi có giải pháp cho mọi level
              </p>

              {/* Trust Badges */}
              <div className="mb-8 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Hoàn tiền 100%</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Cam kết kết quả</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span>Setup trong 24h</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {pricingTiers.map(tier => (
                <PricingCard key={tier.id} tier={tier} />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <p className="mb-4 text-gray-600">
                Không chắc gói nào phù hợp? Tư vấn miễn phí với chuyên gia
              </p>
              <Link className="btn-secondary inline-flex items-center space-x-2" href="/contact">
                <MessageCircle className="h-4 w-4" />
                <span>Chat với chuyên gia</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Quy trình 7 bước chuyên nghiệp
              </h2>
              <p className="text-lg text-gray-600">
                Phương pháp được kiểm chứng qua 500+ khách hàng thành công
              </p>
            </div>

            <div className="space-y-8">
              {methodology.map((step, index) => (
                <MethodologyStep key={step.step} index={index} step={step} />
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="section-padding bg-white" id="case-studies">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Kết quả thực tế từ khách hàng
              </h2>
              <p className="text-lg text-gray-600">
                Những câu chuyện thành công được xác minh từ game thủ Việt Nam
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <CaseStudyCard key={index} study={study} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
              <p className="text-lg text-gray-600">
                Giải đáp những thắc mắc về dịch vụ tư vấn chiến thuật
              </p>
            </div>

            <div className="mx-auto max-w-4xl space-y-6">
              <FAQItem
                answer="Thông thường bạn sẽ thấy cải thiện rõ rệt trong 2-3 tuần đầu. Power tăng 30-50% trong tháng đầu là hoàn toàn bình thường với chiến thuật của chúng tôi."
                question="Bao lâu để thấy kết quả cải thiện power?"
              />
              <FAQItem
                answer="Hoàn toàn an toàn! Chúng tôi chỉ sử dụng các phương pháp được Lilith Games cho phép. Tỷ lệ bị ban < 0.1% và chúng tôi bảo hiểm 100% tài khoản."
                question="Chiến thuật farm gem có an toàn không?"
              />
              <FAQItem
                answer="Có, bạn có thể hủy bất cứ lúc nào. Hoàn tiền 100% trong 7 ngày đầu, sau đó hoàn tiền theo tỷ lệ thời gian sử dụng."
                question="Tôi có thể hủy dịch vụ bất cứ lúc nào không?"
              />
              <FAQItem
                answer="Tuyệt đối! Nhiều khách hàng F2P của chúng tôi đã tăng power 150-200% và cạnh tranh được với low spenders nhờ chiến thuật tối ưu."
                question="Dịch vụ có phù hợp với F2P players không?"
              />
              <FAQItem
                answer="Chỉ cần thông tin tài khoản RoK và mục tiêu cá nhân. Chúng tôi sẽ hướng dẫn setup an toàn và bảo mật tuyệt đối."
                question="Tôi cần cung cấp thông tin gì để bắt đầu?"
              />
            </div>
          </div>
        </section>

        {/* Contact/Booking Section */}
        <section className="section-padding bg-gradient-to-br from-primary-600 to-accent-600 text-white">
          <div className="container-max text-center">
            <h2 className="mb-4 text-3xl font-bold">Sẵn sàng tăng power 100-200%?</h2>
            <p className="mb-8 text-xl opacity-90">
              Tham gia cùng 500+ game thủ đã thành công với chiến thuật của chúng tôi
            </p>

            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-gray-900">
              <h3 className="mb-6 text-2xl font-bold">Đặt lịch tư vấn miễn phí</h3>

              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input required className="input-field" placeholder="Họ và tên" type="text" />
                  <input required className="input-field" placeholder="Số điện thoại" type="tel" />
                </div>

                <input required className="input-field" placeholder="Email" type="email" />

                <select required className="input-field">
                  <option value="">Chọn gói quan tâm</option>
                  <option value="basic">Basic Strategy (750k/tháng)</option>
                  <option value="pro">Pro Strategy (900k/tháng)</option>
                  <option value="premium">Premium Strategy (1.2M/tháng)</option>
                </select>

                <textarea
                  className="input-field"
                  placeholder="Mô tả tình trạng tài khoản hiện tại (power, level, mục tiêu...)"
                  rows={4}
                />

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-8 py-4 font-bold text-white transition-all duration-200 hover:from-accent-700 hover:to-accent-800"
                  type="submit"
                >
                  Đặt lịch tư vấn miễn phí ngay
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Phản hồi trong 30 phút</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Bảo mật tuyệt đối</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm opacity-75">
              🔥 Chỉ còn 3 slot tư vấn miễn phí tháng này • Đảm bảo hoàn tiền 100%
            </p>
          </div>
        </section>
      </main>

      {/* Sticky CTA Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg md:hidden">
        <div className="flex space-x-3">
          <Link
            className="flex-1 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-center font-semibold text-white"
            href="#pricing"
          >
            Xem giá
          </Link>
          <Link
            className="flex-1 rounded-lg bg-primary-600 px-4 py-3 text-center font-semibold text-white"
            href="/contact"
          >
            Tư vấn ngay
          </Link>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">⚡ Tư vấn miễn phí 30 phút</p>
      </div>

      <Footer />
    </>
  )
}

// Components
interface PricingCardProps {
  tier: PricingTier
}

function PricingCard({ tier }: PricingCardProps) {
  return (
    <div
      className={`
      card group relative transition-all duration-300 hover:shadow-xl
      ${tier.popular ? 'scale-105 shadow-lg ring-2 ring-primary-500' : ''}
    `}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
            Phổ biến nhất
          </span>
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="mb-2 text-xl font-semibold text-gray-900">{tier.name}</h3>
        <p className="mb-4 text-sm text-gray-600">{tier.description}</p>

        <div className="mb-4">
          <div className="text-3xl font-bold text-primary-600">{tier.price}</div>
          {tier.original_price && (
            <div className="text-sm text-gray-500 line-through">{tier.original_price}</div>
          )}
        </div>
      </div>

      <ul className="mb-8 space-y-3">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Link
          className="block w-full rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-center font-semibold text-white transition-all duration-200 hover:from-accent-700 hover:to-accent-800"
          href="/contact"
        >
          {tier.cta}
        </Link>
        <Link className="btn-secondary block w-full text-center text-sm" href="/contact">
          Tư vấn miễn phí
        </Link>
      </div>
    </div>
  )
}

interface MethodologyStepProps {
  step: {
    step: number
    title: string
    description: string
    duration: string
    deliverable: string
  }
  index: number
}

function MethodologyStep({ step, index: _index }: MethodologyStepProps) {
  return (
    <div className="flex items-start space-x-6">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
          {step.step}
        </div>
      </div>

      <div className="flex-1">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-xl font-semibold text-gray-900">{step.title}</h3>
          <p className="mb-4 text-gray-600">{step.description}</p>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">Thời gian: {step.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Kết quả: {step.deliverable}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CaseStudyCardProps {
  study: {
    playerName: string
    kingdom: string
    timeframe: string
    beforeStats: {
      power: string
      rank: string
      gems: string
    }
    afterStats: {
      power: string
      rank: string
      gems: string
    }
    improvement: string
    testimonial: string
    service: string
  }
}

function CaseStudyCard({ study }: CaseStudyCardProps) {
  return (
    <div className="card group transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{study.playerName}</h3>
        <p className="text-sm text-gray-500">
          {study.kingdom} • {study.timeframe}
        </p>
        <div className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          {study.service}
        </div>
      </div>

      {/* Before/After Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-gray-500">TRƯỚC</div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-700">{study.beforeStats.power}</div>
            <div className="text-sm text-gray-600">{study.beforeStats.rank}</div>
            <div className="text-xs text-gray-500">{study.beforeStats.gems}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-gray-500">SAU</div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600">{study.afterStats.power}</div>
            <div className="text-sm text-green-600">{study.afterStats.rank}</div>
            <div className="text-xs text-green-500">{study.afterStats.gems}</div>
          </div>
        </div>
      </div>

      {/* Improvement Badge */}
      <div className="mb-4 text-center">
        <div className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 text-sm font-bold text-white">
          {study.improvement}
        </div>
      </div>

      {/* Testimonial */}
      <blockquote className="border-l-4 border-primary-200 pl-4 text-sm italic leading-relaxed text-gray-600">
        &ldquo;{study.testimonial}&rdquo;
      </blockquote>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 transition-shadow duration-200 hover:shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="leading-relaxed text-gray-600">{answer}</p>
    </div>
  )
}
