'use client'

import { useState } from 'react'
import { Star, Users, Trophy, Shield, Clock, Target, Award, Crown, Zap, Heart } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  const stats = [
    { label: 'Khách hàng hài lòng', value: '500+', icon: Users },
    { label: 'Năm kinh nghiệm', value: '3+', icon: Clock },
    { label: 'Dự án hoàn thành', value: '1000+', icon: Trophy },
    { label: 'Tỷ lệ thành công', value: '98%', icon: Target }
  ]

  const teamMembers = [
    {
      name: 'Alex "TheKing" Nguyễn',
      role: 'Founder & Lead Strategist',
      avatar: '/api/placeholder/150/150',
      power: '500M+',
      kingdom: 'K1234',
      specialties: ['KvK Strategy', 'Leadership', 'Formation'],
      achievements: [
        'Top 1 Power server 3 mùa liên tiếp',
        'Lead 5+ alliance thành công',
        'Chuyên gia KvK với 90% win rate'
      ]
    },
    {
      name: 'Sarah "WarQueen" Trần',
      role: 'Senior Combat Advisor',
      avatar: '/api/placeholder/150/150',
      power: '300M+',
      kingdom: 'K2156',
      specialties: ['Combat Analysis', 'Commander Build', 'Training'],
      achievements: [
        'Top 1 Kill Points 10+ KvK seasons',
        'Commander specialist với 500+ builds',
        'Trained 200+ players thành công'
      ]
    },
    {
      name: 'David "MasterMind" Lê',
      role: 'Alliance Management Expert',
      avatar: '/api/placeholder/150/150',
      power: '250M+',
      kingdom: 'K3789',
      specialties: ['Alliance Growth', 'Management', 'Recruitment'],
      achievements: [
        'Built 3 top-tier alliances từ con số 0',
        'Management system được copy bởi 50+ alliances',
        'Expert trong member development'
      ]
    }
  ]

  const values = [
    {
      icon: Shield,
      title: 'An toàn tuyệt đối',
      description: 'Cam kết 100% phương pháp an toàn, không risk tài khoản khách hàng'
    },
    {
      icon: Crown,
      title: 'Chất lượng hàng đầu',
      description: 'Dịch vụ từ đội ngũ top 1% players với kinh nghiệm thực chiến'
    },
    {
      icon: Zap,
      title: 'Hiệu quả tối đa',
      description: 'Tối ưu thời gian và tài nguyên để đạt kết quả nhanh nhất'
    },
    {
      icon: Heart,
      title: 'Tận tâm hỗ trợ',
      description: 'Luôn đặt lợi ích khách hàng lên hàng đầu, hỗ trợ 24/7'
    }
  ]

  const milestones = [
    {
      year: '2021',
      title: 'Khởi đầu từ đam mê',
      description: 'Thành lập với mục tiêu giúp cộng đồng RoK Việt Nam phát triển'
    },
    {
      year: '2022',
      title: 'Phát triển dịch vụ',
      description: 'Ra mắt các dịch vụ tư vấn chính thức, phục vụ 100+ khách hàng đầu tiên'
    },
    {
      year: '2023',
      title: 'Mở rộng quy mô',
      description: 'Xây dựng team chuyên gia, cung cấp dịch vụ toàn diện'
    },
    {
      year: '2024',
      title: 'Dẫn đầu thị trường',
      description: 'Trở thành nền tảng dịch vụ RoK số 1 Việt Nam với 500+ khách hàng'
    }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Crown className="h-4 w-4" />
              Về RoK Services
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Chúng tôi là ai và{' '}
              <span className="text-gradient">tại sao</span>{' '}
              bạn nên tin tưởng?
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              RoK Services ra đời từ đam mê giúp cộng đồng Rise of Kingdoms Việt Nam 
              phát triển và đạt được thành tựu cao nhất trong game.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="card text-center hover-lift">
                  <stat.icon className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="container-max mb-8">
          <div className="flex justify-center">
            <div className="bg-white/60 backdrop-blur p-2 rounded-xl inline-flex gap-2">
              {[
                { id: 'story', label: 'Câu chuyện' },
                { id: 'team', label: 'Đội ngũ' },
                { id: 'values', label: 'Giá trị' },
                { id: 'journey', label: 'Hành trình' }
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
          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className="max-w-4xl mx-auto animate-fadeInUp">
              <div className="card">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                  Câu chuyện của chúng tôi
                </h2>
                
                <div className="prose prose-lg mx-auto text-slate-700">
                  <p className="text-xl text-center mb-8 text-amber-600 font-medium">
                    "Từ những game thủ đam mê đến nền tảng dịch vụ hàng đầu"
                  </p>
                  
                  <div className="space-y-6">
                    <p>
                      <strong>RoK Services</strong> bắt đầu từ một nhóm bạn cùng đam mê Rise of Kingdoms. 
                      Chúng tôi đã trải qua hàng nghìn giờ chơi game, từ những ngày đầu newbie 
                      cho đến khi trở thành top players trong các server hàng đầu.
                    </p>
                    
                    <p>
                      Qua quá trình chơi game, chúng tôi nhận ra rằng <strong>kiến thức và kinh nghiệm</strong> 
                      là yếu tố quyết định thành công trong RoK, không chỉ là tiền bạc. 
                      Nhiều players có điều kiện tài chính tốt nhưng vẫn không thể phát triển 
                      do thiếu hướng dẫn đúng đắn.
                    </p>
                    
                    <p>
                      Từ đó, ý tưởng về <strong>RoK Services</strong> ra đời - một nền tảng chia sẻ 
                      kiến thức chuyên nghiệp, giúp mọi player có thể đạt được mục tiêu của mình 
                      một cách hiệu quả và an toàn nhất.
                    </p>
                    
                    <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                      <h3 className="font-bold text-amber-800 mb-2">Sứ mệnh của chúng tôi</h3>
                      <p className="text-amber-700 mb-0">
                        Democratize gaming knowledge - Mang kiến thức gaming chuyên nghiệp 
                        đến với mọi người, không phân biệt trình độ hay điều kiện kinh tế.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Đội ngũ chuyên gia
                </h2>
                <p className="text-xl text-slate-600">
                  Gặp gỡ những người đứng sau thành công của RoK Services
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="card hover-lift">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 p-1">
                        <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center">
                          <Crown className="h-8 w-8 text-amber-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                      <p className="text-amber-600 font-medium mb-3">{member.role}</p>
                      
                      <div className="flex justify-center gap-4 text-sm text-slate-600 mb-4">
                        <span>💪 {member.power}</span>
                        <span>🏰 {member.kingdom}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Chuyên môn:</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((specialty, i) => (
                            <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Thành tựu:</h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {member.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Star className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Values Tab */}
          {activeTab === 'values' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Giá trị cốt lõi
                </h2>
                <p className="text-xl text-slate-600">
                  Những nguyên tắc định hướng mọi hoạt động của chúng tôi
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {values.map((value, index) => (
                  <div key={index} className="card hover-lift">
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                        <value.icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                          {value.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Why Choose Us */}
              <div className="mt-16 card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6">
                    Tại sao chọn RoK Services?
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <div className="text-3xl mb-3">🏆</div>
                      <h4 className="font-bold mb-2">Proven Results</h4>
                      <p className="text-blue-100 text-sm">
                        98% khách hàng đạt được mục tiêu đề ra sau khi sử dụng dịch vụ
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl mb-3">🔒</div>
                      <h4 className="font-bold mb-2">100% An toàn</h4>
                      <p className="text-blue-100 text-sm">
                        Cam kết không risk tài khoản, hoàn tiền nếu có vấn đề
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl mb-3">⚡</div>
                      <h4 className="font-bold mb-2">Nhanh chóng</h4>
                      <p className="text-blue-100 text-sm">
                        Kết quả thấy rõ trong 7-14 ngày đầu tiên
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Journey Tab */}
          {activeTab === 'journey' && (
            <div className="animate-fadeInUp">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Hành trình phát triển
                </h2>
                <p className="text-xl text-slate-600">
                  Từ những bước đầu tiên đến vị thế hàng đầu như ngày hôm nay
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 rounded-full"></div>
                  
                  <div className="space-y-16">
                    {milestones.map((milestone, index) => (
                      <div key={index} className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                        <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                          <div className="card hover-lift">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                                {milestone.year}
                              </div>
                              <Award className="h-6 w-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                              {milestone.title}
                            </h3>
                            <p className="text-slate-600">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Timeline dot */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-amber-500 rounded-full border-4 border-white shadow-lg"></div>
                        
                        <div className="w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="section-padding container-max">
          <div className="card bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng bắt đầu hành trình với chúng tôi?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Hãy để RoK Services đồng hành cùng bạn trên con đường chinh phục Rise of Kingdoms
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/services"
                className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Xem dịch vụ</span>
                <Trophy className="h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Liên hệ tư vấn</span>
                <Users className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}