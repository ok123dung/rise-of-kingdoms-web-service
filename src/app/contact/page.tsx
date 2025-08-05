'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          serviceInterest: formData.service,
          message: formData.message,
          source: 'contact_form'
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        <div className="container-max section-padding">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Liên hệ với{' '}
              <span className="text-gradient">RoK Services</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Sẵn sàng nâng tầm trải nghiệm Rise of Kingdoms của bạn? 
              Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ 24/7.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-fadeInUp">
              <div className="card">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Gửi yêu cầu tư vấn
                </h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span>Cảm ơn bạn\! Chúng tôi sẽ liên hệ trong vòng 2 giờ.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="0987654321"
                      />
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-sm font-semibold text-slate-700 mb-2">
                        Dịch vụ quan tâm
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Chọn dịch vụ</option>
                        <option value="strategy-consulting">Tư vấn chiến thuật</option>
                        <option value="alliance-management">Quản lý liên minh</option>
                        <option value="commander-training">Training Commander</option>
                        <option value="kvk-support">Hỗ trợ KvK</option>
                        <option value="personal-coaching">Coaching 1-on-1</option>
                        <option value="vip-support">VIP Support 24/7</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                      Tin nhắn *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Mô tả chi tiết nhu cầu của bạn, tình trạng tài khoản hiện tại, mục tiêu muốn đạt được..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center space-x-3 text-lg py-4"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Gửi yêu cầu</span>
                      </>
                    )}
                  </button>

                  <p className="text-sm text-slate-500 text-center">
                    Bằng cách gửi form, bạn đồng ý với{' '}
                    <a href="/terms" className="text-amber-600 hover:text-amber-700">
                      Điều khoản dịch vụ
                    </a>{' '}
                    và{' '}
                    <a href="/privacy" className="text-amber-600 hover:text-amber-700">
                      Chính sách bảo mật
                    </a>
                  </p>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <Mail className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Email hỗ trợ</h3>
                      <p className="text-slate-600 mb-2">support@rokdbot.com</p>
                      <p className="text-sm text-slate-500">Phản hồi trong 2-4 giờ</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Hotline</h3>
                      <p className="text-slate-600 mb-2">0987.654.321</p>
                      <p className="text-sm text-slate-500">Hỗ trợ 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Giờ làm việc</h3>
                      <p className="text-slate-600 mb-1">Thứ 2 - CN: 8:00 - 22:00</p>
                      <p className="text-sm text-slate-500">Timezone: GMT+7 (Việt Nam)</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Địa chỉ</h3>
                      <p className="text-slate-600 mb-1">Hà Nội, Việt Nam</p>
                      <p className="text-sm text-slate-500">Hỗ trợ toàn quốc</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discord & Social */}
              <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="font-bold text-xl mb-4">🎮 Tham gia cộng đồng</h3>
                <p className="mb-6 opacity-90">
                  Kết nối với 1000+ game thủ RoK, chia sẻ kinh nghiệm và nhận tips miễn phí\!
                </p>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block w-full bg-white/20 hover:bg-white/30 text-center py-3 px-6 rounded-lg transition-colors duration-300"
                  >
                    🔗 Tham gia Discord Server
                  </a>
                  <a
                    href="#"
                    className="block w-full bg-white/20 hover:bg-white/30 text-center py-3 px-6 rounded-lg transition-colors duration-300"
                  >
                    📱 Follow Facebook Page
                  </a>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="card">
                <h3 className="font-bold text-xl text-slate-900 mb-4">❓ Câu hỏi thường gặp</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-amber-600 hover:text-amber-700 transition-colors">
                    → Dịch vụ có an toàn không?
                  </a>
                  <a href="#" className="block text-amber-600 hover:text-amber-700 transition-colors">
                    → Thời gian hoàn thành dịch vụ?
                  </a>
                  <a href="#" className="block text-amber-600 hover:text-amber-700 transition-colors">
                    → Chính sách hoàn tiền?
                  </a>
                  <a href="#" className="block text-amber-600 hover:text-amber-700 transition-colors">
                    → Cách thức thanh toán?
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
