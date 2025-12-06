'use client'

import { Star, TrendingUp, Target, Users, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ServiceRecommendation {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  original_price?: number | null
  discount?: number
  category: string | null
  rating: number
  reviewCount: number
  is_popular: boolean
  is_featured: boolean
  recommendationReason: string
  estimatedDuration: string
}

interface ServiceRecommendationsProps {
  recommendations: ServiceRecommendation[]
}

export default function ServiceRecommendations({ recommendations }: ServiceRecommendationsProps) {
  const getRecommendationBadge = (reason: string) => {
    switch (reason) {
      case 'popular':
        return {
          icon: <TrendingUp className="h-3 w-3" />,
          text: 'Phổ biến',
          color: 'bg-amber-100 text-amber-800'
        }
      case 'similar_customers':
        return {
          icon: <Users className="h-3 w-3" />,
          text: 'Phù hợp với bạn',
          color: 'bg-green-100 text-green-800'
        }
      case 'upgrade':
        return {
          icon: <Target className="h-3 w-3" />,
          text: 'Nâng cấp',
          color: 'bg-purple-100 text-purple-800'
        }
      case 'trending':
        return {
          icon: <Star className="h-3 w-3" />,
          text: 'Xu hướng',
          color: 'bg-yellow-100 text-yellow-800'
        }
      default:
        return {
          icon: <Star className="h-3 w-3" />,
          text: 'Gợi ý',
          color: 'bg-gray-100 text-gray-800'
        }
    }
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ dành cho bạn</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="text-center text-gray-500">
            <Target className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p className="text-sm">Không có gợi ý dịch vụ phù hợp</p>
            <Link
              className="mt-3 inline-block rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
              href="/services"
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
        <p className="text-sm text-gray-600">Dựa trên lịch sử và sở thích của bạn</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-4 p-6">
          {recommendations.map(service => {
            const badge = getRecommendationBadge(service.recommendationReason)

            return (
              <Link key={service.id} className="group block" href={`/services/${service.slug}`}>
                <div className="rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-md">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 transition-colors group-hover:text-amber-600">
                          {service.name}
                        </h4>
                        {service.is_featured && <Crown className="h-4 w-4 text-yellow-500" />}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.text}
                        </span>
                      </div>

                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">
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
                      {service.original_price && service.discount && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatVND(service.original_price)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900">
                        {formatVND(service.base_price)}
                      </span>
                      {service.discount && (
                        <span className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                          -{service.discount}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:text-amber-700">
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
        <div className="border-t bg-gray-50 p-4">
          <Link
            className="block text-center text-sm font-medium text-amber-600 hover:text-amber-800"
            href="/services"
          >
            Khám phá tất cả dịch vụ →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
