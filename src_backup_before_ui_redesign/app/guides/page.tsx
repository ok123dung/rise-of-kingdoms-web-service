'use client'

import { useState } from 'react'

import { BookOpen, Play, Star, Clock, Users, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { FAQSchema } from '@/components/seo/StructuredData'

const guideCategories = [
  { id: 'beginner', name: 'Người mới bắt đầu', count: 12 },
  { id: 'strategy', name: 'Chiến thuật nâng cao', count: 8 },
  { id: 'commander', name: 'Commander builds', count: 15 },
  { id: 'kvk', name: 'Kingdom vs Kingdom', count: 6 },
  { id: 'alliance', name: 'Quản lý liên minh', count: 5 },
  { id: 'events', name: 'Event guides', count: 10 }
]

const featuredGuides = [
  {
    id: 1,
    title: 'Hướng dẫn hoàn chỉnh cho người mới bắt đầu',
    description: 'Tất cả những gì bạn cần biết để bắt đầu Rise of Kingdoms',
    category: 'beginner',
    readTime: '15 phút',
    difficulty: 'Dễ',
    rating: 4.9,
    views: 25000,
    type: 'article',
    image: '/api/placeholder/400/250',
    author: 'RoK Expert Team'
  },
  {
    id: 2,
    title: 'Top 10 Commander builds mùa 2024',
    description: 'Những build commander hiệu quả nhất hiện tại',
    category: 'commander',
    readTime: '20 phút',
    difficulty: 'Trung bình',
    rating: 4.8,
    views: 18500,
    type: 'video',
    image: '/api/placeholder/400/250',
    author: 'Pro Player Alex'
  },
  {
    id: 3,
    title: 'Chiến thuật KvK: Từ cơ bản đến nâng cao',
    description: 'Làm chủ mọi giai đoạn của Kingdom vs Kingdom',
    category: 'kvk',
    readTime: '30 phút',
    difficulty: 'Khó',
    rating: 4.9,
    views: 15200,
    type: 'series',
    image: '/api/placeholder/400/250',
    author: 'KvK Master'
  }
]

const allGuides = [
  {
    id: 4,
    title: 'Tối ưu hóa resource farming',
    description: 'Cách farm resource hiệu quả nhất',
    category: 'strategy',
    readTime: '10 phút',
    difficulty: 'Dễ',
    type: 'article'
  },
  {
    id: 5,
    title: 'Alliance recruitment best practices',
    description: 'Cách tuyển dụng thành viên chất lượng',
    category: 'alliance',
    readTime: '12 phút',
    difficulty: 'Trung bình',
    type: 'article'
  },
  {
    id: 6,
    title: 'Event optimization guide',
    description: 'Tối đa hóa phần thưởng từ các event',
    category: 'events',
    readTime: '18 phút',
    difficulty: 'Trung bình',
    type: 'video'
  }
]

const faqItems = [
  {
    question: 'Làm sao để tăng power nhanh nhất?',
    answer:
      'Tập trung vào research, training troops, và upgrade buildings theo thứ tự ưu tiên. Tham gia events để nhận materials.'
  },
  {
    question: 'Commander nào nên prioritize đầu tiên?',
    answer:
      'Cho người mới: Sun Tzu, Joan of Arc, Boudica. Cho advanced: Richard, YSG, Constantine tùy theo playstyle.'
  },
  {
    question: 'Khi nào nên migrate kingdoms?',
    answer:
      'Thường migrate trước KvK để join kingdom mạnh hơn, hoặc khi current kingdom không phù hợp với mục tiêu của bạn.'
  },
  {
    question: 'Cách quản lý resources hiệu quả?',
    answer:
      'Luôn giữ resources dưới protection limit, sử dụng items khi cần thiết, trade với alliance members.'
  }
]

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ':
        return 'text-green-600 bg-green-100'
      case 'Trung bình':
        return 'text-yellow-600 bg-yellow-100'
      case 'Khó':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'series':
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <>
      <FAQSchema faqs={faqItems} />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="animate-fadeInUp mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
              <BookOpen className="h-4 w-4" />
              Hướng dẫn miễn phí
            </div>

            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
              Hướng dẫn và <span className="text-gradient">chiến thuật</span> Rise of Kingdoms
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-slate-600">
              Tài liệu học tập miễn phí từ đội ngũ chuyên gia hàng đầu. Từ cơ bản đến nâng cao, tất
              cả đều ở đây!
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white/60 py-4 pl-12 pr-4 backdrop-blur focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Tìm kiếm hướng dẫn..."
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="container-max mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/60 text-slate-700 hover:bg-white/80'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả
            </button>
            {guideCategories.map(category => (
              <button
                key={category.id}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/60 text-slate-700 hover:bg-white/80'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* Featured Guides */}
        <section className="section-padding container-max">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
            📚 Hướng dẫn nổi bật
          </h2>

          <div className="mb-16 grid gap-8 lg:grid-cols-3">
            {featuredGuides.map(guide => (
              <div key={guide.id} className="card hover-lift group">
                <div className="relative mb-4">
                  <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-amber-600">
                    <div className="text-4xl text-white">📖</div>
                  </div>
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}
                    >
                      {guide.difficulty}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">
                      {getTypeIcon(guide.type)}
                      {guide.type}
                    </span>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    {guide.rating}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                    {guide.title}
                  </h3>

                  <p className="line-clamp-2 text-sm text-slate-600">{guide.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {guide.views.toLocaleString()}
                      </span>
                    </div>
                    <span>{guide.author}</span>
                  </div>

                  <button className="btn-primary flex w-full items-center justify-center gap-2 py-3">
                    <span>Xem hướng dẫn</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Guides */}
        <section className="section-padding container-max">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">Tất cả hướng dẫn</h2>

          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allGuides.map(guide => (
              <div key={guide.id} className="card hover-lift group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-xl bg-amber-100 p-3">
                    {getTypeIcon(guide.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                      {guide.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-600">{guide.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.readTime}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 ${getDifficultyColor(guide.difficulty)}`}
                      >
                        {guide.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="btn-secondary">Xem thêm hướng dẫn</button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding container-max">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
              ❓ Câu hỏi thường gặp
            </h2>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="card">
                  <button
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <h3 className="pr-4 font-semibold text-slate-900">{item.question}</h3>
                    <ChevronRight
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {expandedFaq === index && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="leading-relaxed text-slate-600">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding container-max">
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-center text-white">
            <h3 className="mb-4 text-2xl font-bold">
              🎯 Cần hướng dẫn riêng cho tình huống của bạn?
            </h3>
            <p className="mb-8 text-xl opacity-90">
              Đặt dịch vụ tư vấn 1-on-1 với chuyên gia để được hướng dẫn chi tiết
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/30"
                href="/services"
              >
                <span>Xem dịch vụ tư vấn</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                className="rounded-lg bg-white/20 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/30"
                href="/contact"
              >
                Liên hệ tư vấn miễn phí
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
