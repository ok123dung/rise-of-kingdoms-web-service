'use client'

import {
  Check,
  Star,
  ArrowRight,
  Clock,
  Award,
  UserCheck,
  Phone,
  Target,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { VietnameseGamingSchema } from '@/components/seo/VietnameseGamingSEO'
import { useLanguage } from '@/contexts/LanguageContext'

const testimonials = [
  {
    name: 'Nguyễn Văn Nam',
    kingdom: 'Kingdom 1001',
    rating: 5,
    comment:
      'Dịch vụ tư vấn chiến thuật rất chuyên nghiệp. Power tăng từ 50M lên 120M chỉ trong 2 tháng!',
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
  const { t } = useLanguage()

  return (
    <>
      <Header />
      <VietnameseGamingSchema />

      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-white">
        <div className="container-max flex items-center justify-center space-x-4 text-sm font-medium">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>🔥 Ưu đãi tháng 12: Chỉ còn 5 slot tư vấn miễn phí - Đăng ký ngay!</span>
          <Clock className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="container-max text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Dịch vụ <span className="text-gradient">Rise of Kingdoms</span> chuyên nghiệp
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-xl text-gray-600">
              Nâng tầm trải nghiệm chơi game với các gói dịch vụ được thiết kế riêng cho từng nhu
              cầu. Từ người chơi mới đến top player đều có thể tìm thấy giải pháp phù hợp.
            </p>

            {/* Trust Signals */}
            <div className="mb-8 flex items-center justify-center space-x-6 text-sm text-gray-600">
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
                className="inline-flex transform items-center space-x-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:from-accent-700 hover:to-accent-800 hover:shadow-xl"
                href="/booking"
              >
                <Phone className="h-5 w-5" />
                <span>Đặt lịch tư vấn miễn phí ngay</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                ⚡ Phản hồi trong 5 phút - Không cam kết mua
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary-600">1000+</div>
                <div className="text-gray-600">Khách hàng hài lòng</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-accent-600">95%</div>
                <div className="text-gray-600">Tỷ lệ thành công</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-green-600">24/7</div>
                <div className="text-gray-600">Hỗ trợ liên tục</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Chọn gói dịch vụ phù hợp</h2>
              <p className="text-lg text-gray-600">
                Mỗi gói dịch vụ được thiết kế để mang lại giá trị tối đa cho investment của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(t.services).map(([slug, service]) => {
                // Map slug to icon (since icons are not in translations)
                const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                  'auto-gem-farm': Target
                }
                const IconComponent = iconMap[slug] ?? Target

                // Find lowest price
                interface PricingItem {
                  price: number
                }
                const lowestPrice = Math.min(
                  ...(service.pricing as PricingItem[]).map((p: PricingItem) => p.price)
                )

                return (
                  <div
                    key={slug}
                    className="card group relative transition-all duration-300 hover:shadow-xl"
                  >
                    {slug === 'strategy-consulting' && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                        <span className="rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
                          {t.pricing.popular}
                        </span>
                      </div>
                    )}

                    <div className="mb-6 text-center">
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                        <IconComponent className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.short_description}</p>
                    </div>

                    <div className="mb-6 text-center">
                      <div className="text-sm text-gray-500">Từ</div>
                      <div className="text-3xl font-bold text-primary-600">
                        {lowestPrice.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-sm text-gray-500">{service.pricing[0].duration}</div>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {service.features.slice(0, 5).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-3">
                      <Link
                        className="block w-full rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-center font-semibold text-white transition-all duration-200 hover:from-accent-700 hover:to-accent-800"
                        href={`/booking?service=${slug}`}
                      >
                        {t.common.bookNow}
                      </Link>
                      <Link
                        className="btn-secondary block w-full text-center text-sm"
                        href={`/services/${slug}`}
                      >
                        {t.hero.ctaPrimary}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Khách hàng nói gì về chúng tôi
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                Hơn 1000+ game thủ đã tin tưởng và đạt được mục tiêu với dịch vụ của chúng tôi
              </p>

              {/* Trust Indicators */}
              <div className="mb-12 flex items-center justify-center space-x-8">
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

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>

            {/* Social Proof Avatar Grid */}
            <div className="mt-12 text-center">
              <p className="mb-4 text-gray-600">Được tin tưởng bởi game thủ từ khắp Việt Nam</p>
              <div className="flex items-center justify-center space-x-2">
                {['👨‍💼', '👩‍💼', '👨‍🎮', '👩‍🎯', '👨‍💻', '👩‍📊', '👨‍🎯', '👩‍💻'].map((avatar, i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md"
                  >
                    {avatar}
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 shadow-md">
                  +992
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
              <p className="text-lg text-gray-600">
                Tìm hiểu thêm về dịch vụ và quy trình làm việc của chúng tôi
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="space-y-6">
                <FAQItem
                  answer="Bạn chỉ cần liên hệ qua Discord hoặc form trên website. Chúng tôi sẽ tư vấn miễn phí và đề xuất gói dịch vụ phù hợp nhất với nhu cầu của bạn."
                  question="Làm thế nào để bắt đầu sử dụng dịch vụ?"
                />
                <FAQItem
                  answer="Chúng tôi cam kết 95% khách hàng đạt được mục tiêu đề ra. Nếu không hài lòng, bạn sẽ được hoàn tiền 100% trong 7 ngày đầu."
                  question="Có đảm bảo kết quả không?"
                />
                <FAQItem
                  answer="Tùy vào từng dịch vụ: Phân tích tài khoản (1-2 ngày), Training Commander (1 session), Quản lý liên minh (ongoing), KvK support (theo lịch KvK)."
                  question="Thời gian thực hiện dịch vụ là bao lâu?"
                />
                <FAQItem
                  answer="Có! Chúng tôi có gói dịch vụ dành riêng cho newbie với giá ưu đãi. Đội ngũ sẽ hướng dẫn từ A-Z để bạn có nền tảng vững chắc."
                  question="Có hỗ trợ cho người chơi mới không?"
                />
                <FAQItem
                  answer="Chúng tôi cam kết hoàn tiền 100% trong 7 ngày đầu tiên nếu bạn không hài lòng với dịch vụ. Không cần lý do, chỉ cần thông báo qua Discord hoặc hotline."
                  question="Chính sách hoàn tiền như thế nào?"
                />
                <FAQItem
                  answer="Chúng tôi chấp nhận thanh toán qua banking, Momo, ZaloPay. Có thể thanh toán theo tháng hoặc trả trước để được ưu đãi. Hỗ trợ trả góp cho gói VIP."
                  question="Thanh toán như thế nào?"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 text-white">
                <h3 className="mb-4 text-2xl font-bold">Sẵn sàng nâng tầm gameplay của bạn?</h3>
                <p className="mb-6 text-lg opacity-90">
                  Tham gia cùng hơn 1000+ game thủ đã thành công với dịch vụ của chúng tôi
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    className="inline-flex items-center justify-center space-x-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary-600 transition-colors duration-200 hover:bg-gray-100"
                    href="/contact"
                  >
                    <span>Tư vấn miễn phí</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center space-x-2 rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-primary-600"
                    href="https://discord.gg/rokservices"
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg md:hidden">
        <div className="flex space-x-3">
          <Link
            className="flex-1 rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-4 py-3 text-center font-semibold text-white"
            href="/contact"
          >
            Tư vấn miễn phí
          </Link>
          <Link
            className="flex-1 rounded-lg bg-primary-600 px-4 py-3 text-center font-semibold text-white"
            href="https://discord.gg/rokservices"
            target="_blank"
          >
            Chat Discord
          </Link>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">⚡ Phản hồi trong 5 phút</p>
      </div>

      <Footer />
    </>
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
    <div className="card group relative transition-all duration-300 hover:shadow-lg">
      {/* Result Badge */}
      <div className="absolute -right-3 -top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
        {testimonial.result}
      </div>

      <div className="mb-4 flex items-center">
        <div className="mr-3 text-2xl">{testimonial.avatar}</div>
        <div className="flex-1">
          <div className="mb-1 flex text-yellow-400">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <div className="text-xs text-gray-500">Verified • {testimonial.timeframe} trước</div>
        </div>
      </div>

      <p className="mb-4 italic leading-relaxed text-gray-600">"{testimonial.comment}"</p>

      <div className="border-t pt-4">
        <div className="font-semibold text-gray-900">{testimonial.name}</div>
        <div className="text-sm text-gray-500">{testimonial.kingdom}</div>
        <div className="text-sm font-medium text-primary-600">{testimonial.service}</div>
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
    <div className="rounded-lg border border-gray-200 p-6 transition-shadow duration-200 hover:shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{question}</h3>
      <p className="leading-relaxed text-gray-600">{answer}</p>
    </div>
  )
}
