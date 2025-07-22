'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Star, TrendingUp, Target, Users, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ServiceRecommendation {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  originalPrice?: number
  discount?: number
  category: string
  rating: number
  reviewCount: number
  isPopular: boolean
  isFeatured: boolean
  recommendationReason: 'popular' | 'similar_customers' | 'upgrade' | 'trending'
  estimatedDuration: string
}

export default function ServiceRecommendations() {
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock recommendations data
      const mockRecommendations: ServiceRecommendation[] = [
        {
          id: '1',
          name: 'Advanced KvK Strategy',
          slug: 'advanced-kvk-strategy',
          description: 'Nâng cao kỹ năng KvK với chiến thuật chuyên sâu và phân tích trận đấu chi tiết',
          basePrice: 2800000,
          originalPrice: 3200000,
          discount: 12.5,
          category: 'coaching',
          rating: 4.9,
          reviewCount: 156,
          isPopular: true,
          isFeatured: true,
          recommendationReason: 'upgrade',
          estimatedDuration: '4 tuần'
        },
        {
          id: '2',
          name: 'Guild Leadership Mastery',
          slug: 'guild-leadership-mastery',
          description: 'Học cách quản lý và phát triển guild hiệu quả, tăng sức mạnh tập thể',
          basePrice: 1950000,
          category: 'management',
          rating: 4.7,
          reviewCount: 89,
          isPopular: false,
          isFeatured: false,
          recommendationReason: 'similar_customers',
          estimatedDuration: '3 tuần'
        },
        {
          id: '3',
          name: 'ROK Account Boost Premium',
          slug: 'rok-account-boost-premium',
          description: 'Dịch vụ tăng cường account toàn diện với boost tài nguyên và power',
          basePrice: 4200000,
          category: 'automation',
          rating: 4.8,
          reviewCount: 234,
          isPopular: true,
          isFeatured: false,
          recommendationReason: 'trending',
          estimatedDuration: '2 tuần'
        }
      ]
      
      setRecommendations(mockRecommendations)
    } catch (err) {
      setError('Không thể tải gợi ý dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationBadge = (reason: string) => {
    switch (reason) {
      case 'popular':
        return { icon: <TrendingUp className="h-3 w-3" />, text: 'Phổ biến', color: 'bg-blue-100 text-blue-800' }
      case 'similar_customers':
        return { icon: <Users className="h-3 w-3" />, text: 'Phù hợp với bạn', color: 'bg-green-100 text-green-800' }
      case 'upgrade':
        return { icon: <Target className="h-3 w-3" />, text: 'Nâng cấp', color: 'bg-purple-100 text-purple-800' }
      case 'trending':
        return { icon: <Star className="h-3 w-3" />, text: 'Xu hướng', color: 'bg-yellow-100 text-yellow-800' }
      default:
        return { icon: <Star className="h-3 w-3" />, text: 'Gợi ý', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ dành cho bạn</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <LoadingSpinner text="Đang tải gợi ý..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ dành cho bạn</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchRecommendations}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ dành cho bạn</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Không có gợi ý dịch vụ phù hợp</p>
            <Link
              href="/services"
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Khám phá dịch vụ
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Dịch vụ dành cho bạn
        </CardTitle>
        <p className="text-sm text-gray-600">
          Dựa trên lịch sử và sở thích của bạn
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-4 p-6">
          {recommendations.map((service) => {
            const badge = getRecommendationBadge(service.recommendationReason)
            
            return (
              <Link 
                key={service.id}
                href={`/services/${service.slug}`}
                className="block group"
              >
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h4>
                        {service.isFeatured && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                          {badge.icon}
                          {badge.text}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{service.rating}</span>
                          <span>({service.reviewCount})</span>
                        </div>
                        <span>•</span>
                        <span>{service.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {service.originalPrice && service.discount && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatVND(service.originalPrice)}
                        </span>
                      )}
                      <span className="font-bold text-lg text-gray-900">
                        {formatVND(service.basePrice)}
                      </span>
                      {service.discount && (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                          -{service.discount}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      <span>Xem chi tiết</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View all services link */}
        <div className="p-4 border-t bg-gray-50">
          <Link 
            href="/services"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Khám phá tất cả dịch vụ →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}