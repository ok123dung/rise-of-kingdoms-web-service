import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { VietnameseGamingSchema } from '@/components/seo/VietnameseGamingSEO'
import {
  Target,
  Users,
  Sword,
  Crown,
  MessageCircle,
  BarChart3,
  Calendar,
  Headphones,
  Check,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Award,
  UserCheck,
  Phone
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dịch vụ Rise of Kingdoms - Bảng giá và gói dịch vụ chi tiết',
  description: 'Khám phá các gói dịch vụ Rise of Kingdoms chuyên nghiệp: Tư vấn chiến thuật, quản lý liên minh, training commander với giá cả hợp lý.',
  keywords: ['Rise of Kingdoms services', 'RoK pricing', 'gaming services Vietnam', 'alliance management', 'KvK support'],
}

interface ServicePlan {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  features: string[]
  popular?: boolean
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const servicePlans: ServicePlan[] = [
  {
    id: 'strategy-basic',
    name: 'Tư vấn chiến thuật',
    description: 'Phân tích và tối ưu chiến thuật cá nhân',
    price: '500.000 VNĐ/tháng',
    features: [
      'Phân tích tài khoản chi tiết',
      'Tư vấn build commander',
      'Chiến thuật farm gem 4-15k/ngày',
      'Hỗ trợ qua chat 24/7',
      'Guide mua đồ thường nhân'
    ],
    icon: Target,
    href: '/services/strategy'
  },
  {
    id: 'alliance-pro',
    name: 'Quản lý liên minh',
    description: 'Hỗ trợ toàn diện cho liên minh',
    price: '1.000.000 VNĐ/tháng',
    popular: true,
    features: [
      'Quản lý và tuyển dụng thành viên',
      'Lên kế hoạch chiến thuật liên minh',
      'Hỗ trợ điều phối KvK',
      'Training cho officers',
      'Báo cáo hiệu suất hàng tuần'
    ],
    icon: Users,
    href: '/services/alliance'
  },
  {
    id: 'commander-training',
    name: 'Training Commander',
    description: 'Hướng dẫn build commander tối ưu',
    price: '300.000 VNĐ/session',
    features: [
      'Phân tích commander hiện tại',
      'Lộ trình phát triển chi tiết',
      'Tư vấn talent tree',
      'Hướng dẫn equipment',
      'Follow-up sau 1 tuần'
    ],
    icon: Sword,
    href: '/services/commander'
  },
  {
    id: 'kvk-support',
    name: 'Hỗ trợ KvK',
    description: 'Chiến thuật chuyên nghiệp cho KvK',
    price: '2.000.000 VNĐ/KvK',
    popular: true,
    features: [
      'Phân tích đối thủ và địa hình',
      'Lập kế hoạch chiến thuật tổng thể',
      'Điều phối real-time trong trận',
      'Hỗ trợ rally và garrison',
      'Báo cáo sau KvK'
    ],
    icon: Crown,
    href: '/services/kvk'
  },
  {
    id: 'personal-coaching',
    name: 'Coaching 1-on-1',
    description: 'Hướng dẫn cá nhân từ chuyên gia',
    price: '200.000 VNĐ/giờ',
    features: [
      'Session 1-on-1 với expert',
      'Phân tích gameplay chi tiết',
      'Lộ trình phát triển cá nhân',
      'Tư vấn investment hiệu quả',
      'Recording session để review'
    ],
    icon: MessageCircle,
    href: '/services/coaching'
  },
  {
    id: 'account-analysis',
    name: 'Phân tích tài khoản',
    description: 'Đánh giá toàn diện tài khoản',
    price: '150.000 VNĐ/lần',
    features: [
      'Báo cáo chi tiết 20+ trang',
      'Phân tích điểm mạnh/yếu',
      'Đề xuất cải thiện cụ thể',
      'So sánh với benchmark',
      'Lộ trình 3-6 tháng'
    ],
    icon: BarChart3,
    href: '/services/analysis'
  },
  {
    id: 'event-support',
    name: 'Hỗ trợ Event',
    description: 'Tối ưu cho sự kiện đặc biệt',
    price: '400.000 VNĐ/event',
    features: [
      'Chiến thuật cho từng event',
      'Lịch trình tối ưu',
      'Tính toán ROI chi tiết',
      'Hỗ trợ real-time',
      'Báo cáo kết quả'
    ],
    icon: Calendar,
    href: '/services/events'
  },
  {
    id: 'vip-support',
    name: 'VIP Support 24/7',
    description: 'Hỗ trợ ưu tiên cao cấp',
    price: '3.000.000 VNĐ/tháng',
    features: [
      'Hotline riêng 24/7',
      'Phản hồi trong 5 phút',
      'Dedicated account manager',
      'Tất cả dịch vụ included',
      'Priority support'
    ],
    icon: Headphones,
    href: '/services/vip'
  }
]

const testimonials = [
  {
    name: 'Nguyễn Văn Anh',
    kingdom: 'Kingdom 2847',
    rating: 5,
    comment: 'Dịch vụ tư vấn chiến thuật rất chuyên nghiệp. Power tăng từ 50M lên 120M chỉ trong 2 tháng!',
    service: 'Tư vấn chiến thuật',
    result: '+140% Power tăng',
    timeframe: '2 tháng',
    avatar: '👨‍💼'
  },
  {
    name: 'Trần Thị Bình',
    kingdom: 'Kingdom 3156',
    rating: 5,
    comment: 'Team quản lý liên minh giúp chúng tôi từ rank 50 lên top 5 kingdom. Rất đáng đầu tư!',
    service: 'Quản lý liên minh',
    result: 'Rank 50 → Top 5',
    timeframe: '3 tháng',
    avatar: '👩‍💼'
  },
  {
    name: 'Lê Minh Cường',
    kingdom: 'Kingdom 2934',
    rating: 5,
    comment: 'Hỗ trợ KvK xuất sắc! Chúng tôi đã thắng 3 KvK liên tiếp nhờ chiến thuật của team.',
    service: 'Hỗ trợ KvK',
    result: '3 KvK thắng liên tiếp',
    timeframe: '6 tháng',
    avatar: '👨‍🎮'
  },
  {
    name: 'Phạm Thu Hương',
    kingdom: 'Kingdom 2756',
    rating: 5,
    comment: 'Commander training giúp tôi optimize build hoàn hảo. Hiệu suất combat tăng 85%!',
    service: 'Training Commander',
    result: '+85% Combat hiệu suất',
    timeframe: '1 tháng',
    avatar: '👩‍🎯'
  },
  {
    name: 'Hoàng Đức Minh',
    kingdom: 'Kingdom 3089',
    rating: 5,
    comment: 'VIP support 24/7 cực kỳ responsive. Mọi thắc mắc được giải đáp trong 3 phút!',
    service: 'VIP Support 24/7',
    result: 'Response < 3 phút',
    timeframe: 'Ongoing',
    avatar: '👨‍💻'
  },
  {
    name: 'Võ Thị Mai',
    kingdom: 'Kingdom 2945',
    rating: 5,
    comment: 'Phân tích tài khoản chi tiết giúp tôi hiểu rõ điểm yếu và có lộ trình cụ thể.',
    service: 'Phân tích tài khoản',
    result: 'Lộ trình 6 tháng rõ ràng',
    timeframe: '2 tuần',
    avatar: '👩‍📊'
  }
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <VietnameseGamingSchema />

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 text-white py-3 px-4">
        <div className="container-max flex items-center justify-center space-x-4 text-sm font-medium">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>🔥 Ưu đãi tháng 12: Chỉ còn 5 slot tư vấn miễn phí - Đăng ký ngay!</span>
          <Clock className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 section-padding">
          <div className="container-max text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              Dịch vụ <span className="text-gradient">Rise of Kingdoms</span> chuyên nghiệp
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Nâng tầm trải nghiệm chơi game với các gói dịch vụ được thiết kế riêng cho từng nhu cầu.
              Từ người chơi mới đến top player đều có thể tìm thấy giải pháp phù hợp.
            </p>

            {/* Trust Signals */}
            <div className="flex items-center justify-center space-x-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Đảm bảo hoàn tiền 100%</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <span>Được tin tưởng bởi 1000+ game thủ</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <span>Tư vấn miễn phí 30 phút</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="mb-8">
              <Link
                href="/contact"
                className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Phone className="h-5 w-5" />
                <span>Đặt lịch tư vấn miễn phí ngay</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-2">⚡ Phản hồi trong 5 phút - Không cam kết mua</p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Khách hàng hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">95%</div>
                <div className="text-gray-600">Tỷ lệ thành công</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">Hỗ trợ liên tục</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Chọn gói dịch vụ phù hợp
              </h2>
              <p className="text-lg text-gray-600">
                Mỗi gói dịch vụ được thiết kế để mang lại giá trị tối đa cho investment của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {servicePlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Khách hàng nói gì về chúng tôi
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Hơn 1000+ game thủ đã tin tưởng và đạt được mục tiêu với dịch vụ của chúng tôi
              </p>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-600">Khách hàng hài lòng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">4.9/5</div>
                  <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">1000+</div>
                  <div className="text-sm text-gray-600">Khách hàng thành công</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>

            {/* Social Proof Avatar Grid */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Được tin tưởng bởi game thủ từ khắp Việt Nam</p>
              <div className="flex items-center justify-center space-x-2">
                {['👨‍💼', '👩‍💼', '👨‍🎮', '👩‍🎯', '👨‍💻', '👩‍📊', '👨‍🎯', '👩‍💻'].map((avatar, i) => (
                  <div key={i} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-lg">
                    {avatar}
                  </div>
                ))}
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shadow-md text-sm font-semibold text-primary-600">
                  +992
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Câu hỏi thường gặp
              </h2>
              <p className="text-lg text-gray-600">
                Tìm hiểu thêm về dịch vụ và quy trình làm việc của chúng tôi
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                <FAQItem
                  question="Làm thế nào để bắt đầu sử dụng dịch vụ?"
                  answer="Bạn chỉ cần liên hệ qua Discord hoặc form trên website. Chúng tôi sẽ tư vấn miễn phí và đề xuất gói dịch vụ phù hợp nhất với nhu cầu của bạn."
                />
                <FAQItem
                  question="Có đảm bảo kết quả không?"
                  answer="Chúng tôi cam kết 95% khách hàng đạt được mục tiêu đề ra. Nếu không hài lòng, bạn sẽ được hoàn tiền 100% trong 7 ngày đầu."
                />
                <FAQItem
                  question="Thời gian thực hiện dịch vụ là bao lâu?"
                  answer="Tùy vào từng dịch vụ: Phân tích tài khoản (1-2 ngày), Training Commander (1 session), Quản lý liên minh (ongoing), KvK support (theo lịch KvK)."
                />
                <FAQItem
                  question="Có hỗ trợ cho người chơi mới không?"
                  answer="Có! Chúng tôi có gói dịch vụ dành riêng cho newbie với giá ưu đãi. Đội ngũ sẽ hướng dẫn từ A-Z để bạn có nền tảng vững chắc."
                />
                <FAQItem
                  question="Chính sách hoàn tiền như thế nào?"
                  answer="Chúng tôi cam kết hoàn tiền 100% trong 7 ngày đầu tiên nếu bạn không hài lòng với dịch vụ. Không cần lý do, chỉ cần thông báo qua Discord hoặc hotline."
                />
                <FAQItem
                  question="Thanh toán như thế nào?"
                  answer="Chúng tôi chấp nhận thanh toán qua banking, Momo, ZaloPay. Có thể thanh toán theo tháng hoặc trả trước để được ưu đãi. Hỗ trợ trả góp cho gói VIP."
                />
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Sẵn sàng nâng tầm gameplay của bạn?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Tham gia cùng hơn 1000+ game thủ đã thành công với dịch vụ của chúng tôi
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center space-x-2"
                  >
                    <span>Tư vấn miễn phí</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="https://discord.gg/rokservices"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center space-x-2"
                    target="_blank"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Join Discord</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 md:hidden">
        <div className="flex space-x-3">
          <Link
            href="/contact"
            className="flex-1 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-semibold py-3 px-4 rounded-lg text-center"
          >
            Tư vấn miễn phí
          </Link>
          <Link
            href="https://discord.gg/rokservices"
            className="flex-1 bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg text-center"
            target="_blank"
          >
            Chat Discord
          </Link>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">⚡ Phản hồi trong 5 phút</p>
      </div>

      <Footer />
    </>
  )
}

interface PricingCardProps {
  plan: ServicePlan
}

function PricingCard({ plan }: PricingCardProps) {
  const Icon = plan.icon

  return (
    <div className={`
      card relative group hover:shadow-xl transition-all duration-300
      ${plan.popular ? 'ring-2 ring-primary-500 shadow-lg scale-105' : ''}
    `}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Phổ biến nhất
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm">{plan.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-primary-600">{plan.price}</div>
        {plan.originalPrice && (
          <div className="text-sm text-gray-500 line-through">{plan.originalPrice}</div>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Link
          href="/contact"
          className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center block"
        >
          Đặt lịch tư vấn miễn phí
        </Link>
        <Link
          href={plan.href}
          className="w-full btn-secondary text-center block text-sm"
        >
          Xem chi tiết dịch vụ
        </Link>
      </div>
    </div>
  )
}

interface TestimonialCardProps {
  testimonial: {
    name: string
    kingdom: string
    rating: number
    comment: string
    service: string
    result: string
    timeframe: string
    avatar: string
  }
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="card relative group hover:shadow-lg transition-all duration-300">
      {/* Result Badge */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        {testimonial.result}
      </div>

      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{testimonial.avatar}</div>
        <div className="flex-1">
          <div className="flex text-yellow-400 mb-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <div className="text-xs text-gray-500">Verified • {testimonial.timeframe} trước</div>
        </div>
      </div>

      <p className="text-gray-600 mb-4 italic leading-relaxed">"{testimonial.comment}"</p>

      <div className="border-t pt-4">
        <div className="font-semibold text-gray-900">{testimonial.name}</div>
        <div className="text-sm text-gray-500">{testimonial.kingdom}</div>
        <div className="text-sm text-primary-600 font-medium">{testimonial.service}</div>
      </div>
    </div>
  )
}

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {question}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {answer}
      </p>
    </div>
  )
}
