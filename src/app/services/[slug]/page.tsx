'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Clock, CheckCircle, Shield, Award, Users, ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
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
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Không tìm thấy dịch vụ</h1>
            <p className="text-slate-600 mb-6">{error || 'Dịch vụ bạn tìm kiếm không tồn tại'}</p>
            <button
              onClick={() => router.push('/services')}
              className="btn-primary"
            >
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
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              {service.isFeatured ? 'Dịch vụ nổi bật' : 'Dịch vụ chuyên nghiệp'}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {service.name}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-3xl mx-auto">
              {service.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">An toàn 100%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Chuyên gia hàng đầu</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">500+ khách hàng</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="section-padding container-max">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Features */}
              <div className="card animate-fadeInUp">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Tính năng chính
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {service.metadata.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {service.metadata.requirements && (
                <div className="card animate-fadeInUp">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Yêu cầu
                  </h2>
                  <div className="space-y-3">
                    {service.metadata.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Process */}
              <div className="card animate-fadeInUp">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Quy trình thực hiện
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Đặt dịch vụ</h3>
                      <p className="text-slate-600 text-sm">Chọn gói dịch vụ phù hợp và thanh toán</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phân tích</h3>
                      <p className="text-slate-600 text-sm">Team chuyên gia phân tích tài khoản và tình huống</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Thực hiện</h3>
                      <p className="text-slate-600 text-sm">Cung cấp dịch vụ theo timeline đã cam kết</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Hoàn thành</h3>
                      <p className="text-slate-600 text-sm">Báo cáo kết quả và hỗ trợ follow-up</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="card animate-fadeInUp sticky top-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Chọn gói dịch vụ
                </h3>
                
                {serviceTiers.length > 0 ? (
                  <div className="space-y-4">
                    {serviceTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          selectedTier === tier.id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                        onClick={() => setSelectedTier(tier.id)}
                      >
                        {tier.isPopular && (
                          <div className="absolute -top-3 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Phổ biến
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-900">{tier.name}</h4>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              {tier.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500">VNĐ</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-3">{tier.description}</p>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
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
                      onClick={handleBookService}
                      disabled={!selectedTier}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                    >
                      <span>Đặt dịch vụ ngay</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    
                    <div className="text-center text-sm text-slate-500">
                      💰 Thanh toán an toàn • 🔒 Bảo mật thông tin
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-600 mb-4">Liên hệ để biết thêm chi tiết về gói dịch vụ</p>
                    <button
                      onClick={handleContactSupport}
                      className="btn-primary"
                    >
                      Liên hệ tư vấn
                    </button>
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="card animate-fadeInUp bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="font-bold text-xl mb-4">🤝 Cần tư vấn?</h3>
                <p className="mb-6 opacity-90 text-sm">
                  Đội ngũ chuyên gia sẵn sàng tư vấn miễn phí về dịch vụ phù hợp nhất cho bạn.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleContactSupport}
                    className="w-full bg-white/20 hover:bg-white/30 text-center py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
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