import Link from 'next/link'
import { ArrowRight, Star, Users, Trophy } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 section-padding">
      <div className="container-max">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Dịch vụ chuyên nghiệp cho{' '}
            <span className="text-gradient">Rise of Kingdoms</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Nâng cao trải nghiệm chơi game của bạn với các dịch vụ chuyên nghiệp: 
            tư vấn chiến thuật, quản lý liên minh, training commander và nhiều hơn nữa.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/services" className="btn-primary flex items-center space-x-2">
              <span>Khám phá dịch vụ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/guides" className="btn-secondary">
              Hướng dẫn miễn phí
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-sm text-gray-600">Khách hàng tin tưởng</div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-accent-100 rounded-lg">
              <Trophy className="h-6 w-6 text-accent-600" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Liên minh được hỗ trợ</div>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-600">Đánh giá trung bình</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
