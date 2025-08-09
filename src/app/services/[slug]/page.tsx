'use client'

import { useState, useEffect } from 'react'

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
import { useParams, useRouter } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

interface Service {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  basePrice: number
  currency: string
  category: string
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  metadata: {
    features: string[]
    requirements?: string[]
  }
}

interface ServiceTier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  duration: string
  isPopular?: boolean
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('')

  // Service tiers based on service type
  const getServiceTiers = (serviceSlug: string): ServiceTier[] => {
    const tiersByService: Record<string, ServiceTier[]> = {
      'strategy-consulting': [
        {
          id: 'basic',
          name: 'Basic',
          price: 500000,
          description: 'Tư vấn cơ bản cho người mới',
          features: [
            'Phân tích tài khoản cơ bản',
            'Tư vấn build commander',
            'Kế hoạch phát triển 30 ngày',
            'Hỗ trợ qua Discord'
          ],
          duration: '7 ngày'
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 900000,
          description: 'Tư vấn chuyên sâu cho player kinh nghiệm',
          features: [
            'Phân tích chi tiết tài khoản',
            'Tối ưu formation nâng cao',
            'Kế hoạch phát triển 60 ngày',
            'Hỗ trợ 24/7',
            'Session 1-on-1 hàng tuần'
          ],
          duration: '30 ngày',
          isPopular: true
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 1500000,
          description: 'Tư vấn toàn diện cho top player',
          features: [
            'Tất cả tính năng Pro',
            'Phân tích đối thủ chi tiết',
            'Chiến thuật KvK exclusive',
            'Priority support',
            'Session 1-on-1 daily'
          ],
          duration: '60 ngày'
        }
      ],
      'alliance-management': [
        {
          id: 'startup',
          name: 'Startup',
          price: 1000000,
          description: 'Khởi tạo liên minh mới',
          features: [
            'Thiết lập cấu trúc R4/R5',
            'System rule cơ bản',
            'Template recruitment',
            'Hướng dẫn quản lý'
          ],
          duration: '15 ngày'
        },
        {
          id: 'growth',
          name: 'Growth',
          price: 2000000,
          description: 'Phát triển liên minh mạnh mẽ',
          features: [
            'Tất cả tính năng Startup',
            'Event management system',
            'Member development program',
            'Advanced recruitment',
            'Monthly strategy review'
          ],
          duration: '45 ngày',
          isPopular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 3500000,
          description: 'Liên minh top server',
          features: [
            'Tất cả tính năng Growth',
            'Multi-alliance coordination',
            'Leadership training',
            'KvK strategy planning',
            'Dedicated consultant'
          ],
          duration: '90 ngày'
        }
      ],
      'kvk-support': [
        {
          id: 'basic',
          name: 'Basic Support',
          price: 2000000,
          description: 'Hỗ trợ KvK cơ bản',
          features: [
            'KvK strategy guide',
            'Formation recommendations',
            'Migration timing',
            'Basic coordination'
          ],
          duration: '1 KvK season'
        },
        {
          id: 'advanced',
          name: 'Advanced Support',
          price: 4000000,
          description: 'Hỗ trợ KvK chuyên nghiệp',
          features: [
            'Tất cả tính năng Basic',
            'Real-time coordination',
            'Rally leadership training',
            '24/7 support during KvK',
            'Post-KvK analysis'
          ],
          duration: '1 KvK season',
          isPopular: true
        }
      ],
      'vip-support': [
        {
          id: 'vip',
          name: 'VIP Ultimate',
          price: 3000000,
          description: 'Gói VIP toàn diện',
          features: [
            'Tất cả dịch vụ included',
            'Hỗ trợ 24/7 priority',
            'Dedicated account manager',
            'Custom strategy development',
            'Exclusive community access'
          ],
          duration: '30 ngày'
        }
      ],
      'commander-training': [
        {
          id: 'single',
          name: 'Single Commander',
          price: 300000,
          description: 'Training 1 commander',
          features: [
            'Talent build optimization',
            'Equipment recommendations',
            'Pairing suggestions',
            '1 session tư vấn'
          ],
          duration: '3 ngày'
        },
        {
          id: 'multiple',
          name: 'Multiple Commanders',
          price: 800000,
          description: 'Training 3-5 commanders',
          features: [
            'Tất cả tính năng Single',
            'Training 3-5 commanders',
            'Formation optimization',
            'Multiple sessions',
            'Follow-up support'
          ],
          duration: '10 ngày',
          isPopular: true
        }
      ],
      'personal-coaching': [
        {
          id: 'session',
          name: 'Single Session',
          price: 200000,
          description: 'Session 1-on-1 đơn lẻ',
          features: [
            '60 phút session riêng',
            'Customize theo nhu cầu',
            'Screen sharing',
            'Recording session'
          ],
          duration: '1 session'
        },
        {
          id: 'package',
          name: 'Coaching Package',
          price: 500000,
          description: 'Gói coaching 4 sessions',
          features: [
            'Tất cả tính năng Single',
            '4 sessions trong tháng',
            'Progress tracking',
            'Homework assignments',
            'Priority booking'
          ],
          duration: '1 tháng',
          isPopular: true
        }
      ]
    }

    return tiersByService[serviceSlug] || []
  }

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)

        // Fetch all services and find the matching one
        const response = await fetch('/api/services')
        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch services')
        }

        const foundService = data.data.find((s: Service) => s.slug === slug)

        if (!foundService) {
          setError('Dịch vụ không tồn tại')
          return
        }

        setService(foundService)

        // Set default tier selection
        const tiers = getServiceTiers(slug)
        const popularTier = tiers.find(t => t.isPopular)
        if (popularTier) {
          setSelectedTier(popularTier.id)
        } else if (tiers.length > 0) {
          setSelectedTier(tiers[0].id)
        }
      } catch (error) {
        console.error('Error fetching service:', error)
        setError('Không thể tải thông tin dịch vụ')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchService()
    }
  }, [slug])

  const handleBookService = () => {
    if (!service || !selectedTier) return

    // Redirect to booking page with service and tier info
    const bookingUrl = `/booking?service=${service.slug}&tier=${selectedTier}`
    router.push(bookingUrl)
  }

  const handleContactSupport = () => {
    router.push('/contact')
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-amber-600" />
            <p className="text-slate-600">Đang tải thông tin dịch vụ...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !service) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-slate-900">Không tìm thấy dịch vụ</h1>
            <p className="mb-6 text-slate-600">{error || 'Dịch vụ bạn tìm kiếm không tồn tại'}</p>
            <button className="btn-primary" onClick={() => router.push('/services')}>
              Quay lại danh sách dịch vụ
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const serviceTiers = getServiceTiers(slug)
  const selectedTierData = serviceTiers.find(t => t.id === selectedTier)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="animate-fadeInUp mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              <Star className="h-4 w-4" />
              {service.isFeatured ? 'Dịch vụ nổi bật' : 'Dịch vụ chuyên nghiệp'}
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
                  {service.metadata.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {service.metadata.requirements && (
                <div className="card animate-fadeInUp">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900">Yêu cầu</h2>
                  <div className="space-y-3">
                    {service.metadata.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                        <span className="text-slate-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="card animate-fadeInUp sticky top-6">
                <h3 className="mb-6 text-xl font-bold text-slate-900">Chọn gói dịch vụ</h3>

                {serviceTiers.length > 0 ? (
                  <div className="space-y-4">
                    {serviceTiers.map(tier => (
                      <div
                        key={tier.id}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedTier === tier.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                        onClick={() => setSelectedTier(tier.id)}
                      >
                        {tier.isPopular && (
                          <div className="absolute -top-3 left-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                            Phổ biến
                          </div>
                        )}

                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{tier.name}</h4>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              {tier.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500">VNĐ</div>
                          </div>
                        </div>

                        <p className="mb-3 text-sm text-slate-600">{tier.description}</p>

                        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span>{tier.duration}</span>
                        </div>

                        <div className="space-y-2">
                          {tier.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
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
                      disabled={!selectedTier}
                      onClick={handleBookService}
                    >
                      <span>Đặt dịch vụ ngay</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="text-center text-sm text-slate-500">
                      💰 Thanh toán an toàn • 🔒 Bảo mật thông tin
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="mb-4 text-slate-600">
                      Liên hệ để biết thêm chi tiết về gói dịch vụ
                    </p>
                    <button className="btn-primary" onClick={handleContactSupport}>
                      Liên hệ tư vấn
                    </button>
                  </div>
                )}
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
