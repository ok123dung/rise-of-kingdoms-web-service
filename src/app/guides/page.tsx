'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Play, Download, Star, Clock, Users, ChevronRight, Search, Filter } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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
    answer: 'Tập trung vào research, training troops, và upgrade buildings theo thứ tự ưu tiên. Tham gia events để nhận materials.'
  },
  {
    question: 'Commander nào nên prioritize đầu tiên?',
    answer: 'Cho người mới: Sun Tzu, Joan of Arc, Boudica. Cho advanced: Richard, YSG, Constantine tùy theo playstyle.'
  },
  {
    question: 'Khi nào nên migrate kingdoms?',
    answer: 'Thường migrate trước KvK để join kingdom mạnh hơn, hoặc khi current kingdom không phù hợp với mục tiêu của bạn.'
  },
  {
    question: 'Cách quản lý resources hiệu quả?',
    answer: 'Luôn giữ resources dưới protection limit, sử dụng items khi cần thiết, trade với alliance members.'
  }
]

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'text-green-600 bg-green-100'
      case 'Trung bình': return 'text-yellow-600 bg-yellow-100' 
      case 'Khó': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />
      case 'series': return <BookOpen className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <>
      <FAQSchema faqs={faqItems} />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Hướng dẫn miễn phí
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Hướng dẫn và{' '}
              <span className="text-gradient">chiến thuật</span>{' '}
              Rise of Kingdoms
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Tài liệu học tập miễn phí từ đội ngũ chuyên gia hàng đầu. 
              Từ cơ bản đến nâng cao, tất cả đều ở đây!
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hướng dẫn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="container-max mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/60 text-slate-700 hover:bg-white/80'
              }`}
            >
              Tất cả
            </button>
            {guideCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/60 text-slate-700 hover:bg-white/80'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* Featured Guides */}
        <section className="section-padding container-max">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            📚 Hướng dẫn nổi bật
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {featuredGuides.map((guide) => (
              <div key={guide.id} className="card hover-lift group">
                <div className="relative mb-4">
                  <div className="w-full h-48 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                    <div className="text-white text-4xl">📖</div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-white/90 text-slate-700 rounded-full text-xs font-medium flex items-center gap-1">
                      {getTypeIcon(guide.type)}
                      {guide.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    {guide.rating}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {guide.description}
                  </p>

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

                  <button className="w-full btn-primary flex items-center justify-center gap-2 py-3">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Tất cả hướng dẫn
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {allGuides.map((guide) => (
              <div key={guide.id} className="card hover-lift group">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                    {getTypeIcon(guide.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.readTime}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(guide.difficulty)}`}>
                        {guide.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="btn-secondary">
              Xem thêm hướng dẫn
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-padding container-max">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              ❓ Câu hỏi thường gặp
            </h2>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="card">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <h3 className="font-semibold text-slate-900 pr-4">
                      {item.question}
                    </h3>
                    <ChevronRight 
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedFaq === index && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-slate-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding container-max">
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              🎯 Cần hướng dẫn riêng cho tình huống của bạn?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Đặt dịch vụ tư vấn 1-on-1 với chuyên gia để được hướng dẫn chi tiết
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Xem dịch vụ tư vấn</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
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