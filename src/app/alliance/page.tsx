'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Crown, Shield, Sword, Trophy, Search, Filter, Star, MapPin, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const allianceFeatures = [
  {
    icon: Users,
    title: 'Tuyển dụng thành viên',
    description: 'Hệ thống tuyển dụng thông minh, lọc ứng viên theo tiêu chí',
    features: ['Auto-screening', 'Power requirements', 'Activity tracking', 'Interview scheduling']
  },
  {
    icon: Crown,
    title: 'Quản lý cấp bậc',
    description: 'Phân quyền và quản lý vai trò thành viên hiệu quả',
    features: ['Role management', 'Permission system', 'Promotion tracking', 'Performance metrics']
  },
  {
    icon: Shield,
    title: 'Chiến thuật liên minh',
    description: 'Lên kế hoạch chiến thuật và coordination cho wars',
    features: ['War planning', 'Formation guides', 'Target assignment', 'Rally coordination']
  },
  {
    icon: Trophy,
    title: 'Event coordination',
    description: 'Tổ chức và quản lý events, competitions nội bộ',
    features: ['Event calendar', 'Reward system', 'Leaderboards', 'Team competitions']
  }
]

const topAlliances = [
  {
    id: 1,
    name: 'Vương Giả Thiên Hạ',
    kingdom: 'K2543',
    leader: 'DragonKing',
    members: 98,
    power: '2.8B',
    level: 25,
    language: 'Tiếng Việt',
    requirements: 'Min 50M power, Active daily',
    recruiting: true,
    tags: ['Top 1 Kingdom', 'KvK Expert', 'Friendly'],
    description: 'Alliance hàng đầu tập trung vào KvK và phát triển thành viên'
  },
  {
    id: 2,
    name: 'Elite Warriors',
    kingdom: 'K1876',
    leader: 'WarMaster',
    members: 95,
    power: '2.5B',
    level: 24,
    language: 'Tiếng Việt/English',
    requirements: 'Min 30M power, KvK experience',
    recruiting: true,
    tags: ['International', 'Strategy Focus', 'Active'],
    description: 'Multi-cultural alliance với focus vào strategic gameplay'
  },
  {
    id: 3,
    name: 'Royal Phoenix',
    kingdom: 'K3421',
    leader: 'PhoenixQueen',
    members: 89,
    power: '2.2B',
    level: 23,
    language: 'Tiếng Việt',
    requirements: 'Min 40M power, Discord required',
    recruiting: false,
    tags: ['Full', 'Competitive', 'Organized'],
    description: 'Alliance chuyên nghiệp với discipline cao và performance tốt'
  }
]

const managementTools = [
  {
    title: 'Alliance Analytics',
    description: 'Thống kê chi tiết về hiệu suất alliance',
    icon: '📊',
    features: ['Member activity', 'Power growth', 'Event performance', 'War statistics']
  },
  {
    title: 'Communication Hub',
    description: 'Trung tâm liên lạc và thông báo',
    icon: '💬',
    features: ['Mass messaging', 'Announcement system', 'Discord integration', 'Translation tools']
  },
  {
    title: 'Resource Management',
    description: 'Quản lý resources và distribution',
    icon: '🏪',
    features: ['Resource tracking', 'Help coordination', 'Trade management', 'Tax collection']
  },
  {
    title: 'War Planning',
    description: 'Tools cho planning và executing wars',
    icon: '⚔️',
    features: ['Target assignment', 'Rally coordination', 'Battle analysis', 'Strategy templates']
  }
]

export default function AlliancePage() {
  const [activeTab, setActiveTab] = useState('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterKingdom, setFilterKingdom] = useState('')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Alliance Management
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Quản lý{' '}
              <span className="text-gradient">liên minh</span>{' '}
              chuyên nghiệp
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Công cụ và dịch vụ toàn diện để xây dựng và quản lý liên minh mạnh mẽ. 
              Từ tuyển dụng đến chiến thuật war.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">500+</div>
                <div className="text-sm text-slate-600">Alliances quản lý</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">25k+</div>
                <div className="text-sm text-slate-600">Thành viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-slate-600">Retention rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="container-max mb-8">
          <div className="flex justify-center">
            <div className="bg-white/60 backdrop-blur p-2 rounded-xl inline-flex gap-2">
              {[
                { id: 'directory', label: 'Alliance Directory' },
                { id: 'tools', label: 'Management Tools' },
                { id: 'services', label: 'Dịch vụ quản lý' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="section-padding container-max">
          
          {/* Alliance Directory Tab */}
          {activeTab === 'directory' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  🏰 Alliance Directory
                </h2>
                <p className="text-xl text-slate-600">
                  Tìm kiếm alliance phù hợp hoặc tuyển dụng thành viên mới
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm alliance theo tên, leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <select
                    value={filterKingdom}
                    onChange={(e) => setFilterKingdom(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/60 backdrop-blur border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                  >
                    <option value="">Tất cả Kingdom</option>
                    <option value="k2543">K2543</option>
                    <option value="k1876">K1876</option>
                    <option value="k3421">K3421</option>
                  </select>
                </div>
              </div>

              {/* Alliance List */}
              <div className="space-y-6 max-w-5xl mx-auto">
                {topAlliances.map((alliance) => (
                  <div key={alliance.id} className="card hover-lift">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      
                      {/* Alliance Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-900">
                                {alliance.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alliance.recruiting 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {alliance.recruiting ? 'Đang tuyển' : 'Full'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {alliance.kingdom}
                              </span>
                              <span className="flex items-center gap-1">
                                <Crown className="h-4 w-4" />
                                {alliance.leader}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {alliance.members}/100
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-3">
                              {alliance.description}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-600 mb-1">
                              {alliance.power}
                            </div>
                            <div className="text-xs text-slate-500">Total Power</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {alliance.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Requirements */}
                        <div className="bg-slate-50 rounded-lg p-3 mb-4">
                          <div className="text-sm font-medium text-slate-900 mb-1">Yêu cầu:</div>
                          <div className="text-sm text-slate-600">{alliance.requirements}</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 lg:w-48">
                        <button className="btn-primary flex items-center justify-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        {alliance.recruiting && (
                          <button className="btn-secondary">
                            Nộp đơn ứng tuyển
                          </button>
                        )}
                        <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                          Liên hệ leader
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <div className="card bg-gradient-to-r from-purple-500 to-blue-600 text-white inline-block">
                  <h3 className="text-xl font-bold mb-4">
                    Muốn alliance của bạn xuất hiện ở đây?
                  </h3>
                  <p className="mb-6 opacity-90">
                    Đăng ký để được featured trong Alliance Directory
                  </p>
                  <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Management Tools Tab */}
          {activeTab === 'tools' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  🛠️ Management Tools
                </h2>
                <p className="text-xl text-slate-600">
                  Công cụ chuyên nghiệp để quản lý alliance hiệu quả
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
                {managementTools.map((tool, index) => (
                  <div key={index} className="card hover-lift">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-4">{tool.icon}</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {tool.title}
                      </h3>
                      <p className="text-slate-600">
                        {tool.description}
                      </p>
                    </div>

                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full btn-secondary">
                      Tìm hiểu thêm
                    </button>
                  </div>
                ))}
              </div>

              {/* Features Overview */}
              <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    🚀 Tất cả tools trong một dashboard
                  </h3>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Quản lý mọi aspect của alliance từ một interface duy nhất. 
                    Real-time data, automated workflows, và advanced analytics.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-amber-600 mb-2">24/7</div>
                    <div className="text-sm text-slate-600">Monitoring</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                    <div className="text-sm text-slate-600">Auto features</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">Real-time</div>
                    <div className="text-sm text-slate-600">Updates</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">API</div>
                    <div className="text-sm text-slate-600">Integration</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  💼 Dịch vụ quản lý Alliance
                </h2>
                <p className="text-xl text-slate-600">
                  Để chuyên gia quản lý alliance giúp bạn
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {allianceFeatures.map((feature, index) => (
                  <div key={index} className="card hover-lift text-center">
                    <div className="bg-amber-100 p-4 rounded-xl inline-flex mb-6">
                      <feature.icon className="h-8 w-8 text-amber-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-6">
                      {feature.description}
                    </p>

                    <div className="space-y-2 mb-6 text-left">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <Star className="h-3 w-3 text-amber-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/services/alliance-management" className="btn-primary w-full block text-center">
                      Xem chi tiết
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pricing CTA */}
              <div className="text-center mt-16">
                <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    📈 Nâng alliance lên tầm cao mới
                  </h3>
                  <p className="text-xl mb-8 opacity-90">
                    Bắt đầu với gói Basic chỉ 1M VNĐ/tháng
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/services/alliance-management"
                      className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                    >
                      Xem gói dịch vụ
                    </Link>
                    <Link
                      href="/contact"
                      className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                    >
                      Tư vấn miễn phí
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>
      <Footer />
    </>
  )
}