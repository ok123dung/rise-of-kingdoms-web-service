'use client'

import { useState } from 'react'

import {
  Star,
  Clock,
  CheckCircle,
  Shield,
  Award,
  Users,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react'
import { useParams, useRouter, notFound } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { servicesData } from '@/data/services'

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const service = servicesData[slug]

  if (!service) {
    notFound()
  }

  const IconComponent = service.icon
  const [selectedTierIndex, setSelectedTierIndex] = useState(1) // Default to middle tier

  const handleBookService = () => {
    const selectedTier = service.pricing[selectedTierIndex]
    const bookingUrl = `/booking?service=${service.slug}&tier=${selectedTier.tier.toLowerCase()}`
    router.push(bookingUrl)
  }

  const handleContactSupport = () => {
    router.push('/contact')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="animate-fadeInUp mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              <IconComponent className="h-4 w-4" />
              Dịch vụ chuyên nghiệp
            </div>

            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">{service.name}</h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-600">
              {service.description}
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">An toàn 100%</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Chuyên gia hàng đầu</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">500+ khách hàng</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="section-padding container-max">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Features */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Tính năng chính</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Lợi ích khi sử dụng</h2>
                <div className="space-y-3">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                      <span className="text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Quy trình thực hiện</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      1
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Đặt dịch vụ</h3>
                      <p className="text-sm text-slate-600">
                        Chọn gói dịch vụ phù hợp và thanh toán
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      2
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Phân tích</h3>
                      <p className="text-sm text-slate-600">
                        Team chuyên gia phân tích tài khoản và tình huống
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      3
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Thực hiện</h3>
                      <p className="text-sm text-slate-600">
                        Cung cấp dịch vụ theo timeline đã cam kết
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      4
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Hoàn thành</h3>
                      <p className="text-sm text-slate-600">Báo cáo kết quả và hỗ trợ follow-up</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials if available */}
              {service.testimonials && service.testimonials.length > 0 && (
                <div className="card animate-fadeInUp">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900">Khách hàng nói gì</h2>
                  <div className="space-y-4">
                    {service.testimonials.map((testimonial, index) => (
                      <div key={index} className="border-l-4 border-amber-400 pl-4">
                        <p className="mb-2 italic text-slate-700">"{testimonial.content}"</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{testimonial.name}</span>
                          <span className="text-sm text-slate-500">- {testimonial.kingdom}</span>
                          <div className="ml-auto flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="card animate-fadeInUp sticky top-6">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Chọn gói dịch vụ</h3>

                <div className="space-y-4">
                  {service.pricing.map((tier, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                        selectedTierIndex === index
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                      onClick={() => setSelectedTierIndex(index)}
                    >
                      {index === 1 && (
                        <div className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                          Phổ biến
                        </div>
                      )}

                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{tier.tier}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {tier.price.toLocaleString('vi-VN')}
                          </div>
                          <div className="text-sm text-slate-500">VNĐ</div>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{tier.duration}</span>
                      </div>

                      <div className="space-y-2">
                        {tier.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                        {tier.features.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{tier.features.length - 3} tính năng khác
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-lg"
                    onClick={handleBookService}
                  >
                    <span>Đặt dịch vụ ngay</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="text-center text-sm text-slate-500">
                    💰 Thanh toán an toàn • 🔒 Bảo mật thông tin
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="card animate-fadeInUp bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="mb-4 text-xl font-bold">🤝 Cần tư vấn?</h3>
                <p className="mb-6 text-sm opacity-90">
                  Đội ngũ chuyên gia sẵn sàng tư vấn miễn phí về dịch vụ phù hợp nhất cho bạn.
                </p>
                <div className="space-y-3">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 text-center transition-colors duration-300 hover:bg-white/30"
                    onClick={handleContactSupport}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat tư vấn</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>24/7 Hotline</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>Email support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
