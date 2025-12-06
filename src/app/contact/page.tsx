'use client'

import { useState } from 'react'

import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          service_interest: formData.service,
          message: formData.message,
          source: 'contact_form'
        })
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          full_name: '',
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
          <div className="animate-fadeInUp mx-auto mb-16 max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
              Liên hệ với <span className="text-gradient">RoK Services</span>
            </h1>
            <p className="text-xl leading-relaxed text-slate-600">
              Sẵn sàng nâng tầm trải nghiệm Rise of Kingdoms của bạn? Đội ngũ chuyên gia luôn sẵn
              sàng hỗ trợ 24/7.
            </p>
          </div>

          <div className="grid gap-16 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="animate-fadeInUp">
              <div className="card">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Gửi yêu cầu tư vấn</h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span>Cảm ơn bạn\! Chúng tôi sẽ liên hệ trong vòng 2 giờ.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 flex items-center space-x-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp.</span>
                  </div>
                )}

                <form className="space-y-6" onSubmit={e => void handleSubmit(e)}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="full_name"
                      >
                        Họ và tên *
                      </label>
                      <input
                        required
                        className="input-field"
                        id="full_name"
                        name="full_name"
                        placeholder="Nhập họ và tên"
                        type="text"
                        value={formData.full_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="email"
                      >
                        Email *
                      </label>
                      <input
                        required
                        className="input-field"
                        id="email"
                        name="email"
                        placeholder="your@email.com"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="phone"
                      >
                        Số điện thoại
                      </label>
                      <input
                        className="input-field"
                        id="phone"
                        name="phone"
                        placeholder="0987654321"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-sm font-semibold text-slate-700"
                        htmlFor="service"
                      >
                        Dịch vụ quan tâm
                      </label>
                      <select
                        className="input-field"
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
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
                    <label
                      className="mb-2 block text-sm font-semibold text-slate-700"
                      htmlFor="message"
                    >
                      Tin nhắn *
                    </label>
                    <textarea
                      required
                      className="input-field"
                      id="message"
                      name="message"
                      placeholder="Mô tả chi tiết nhu cầu của bạn, tình trạng tài khoản hiện tại, mục tiêu muốn đạt được..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    className="btn-primary flex w-full items-center justify-center space-x-3 py-4 text-lg"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Gửi yêu cầu</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Bằng cách gửi form, bạn đồng ý với{' '}
                    <a className="text-amber-600 hover:text-amber-700" href="/terms">
                      Điều khoản dịch vụ
                    </a>{' '}
                    và{' '}
                    <a className="text-amber-600 hover:text-amber-700" href="/privacy">
                      Chính sách bảo mật
                    </a>
                  </p>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="animate-fadeInUp space-y-8" style={{ animationDelay: '0.2s' }}>
              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-xl bg-amber-100 p-3">
                      <Mail className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Email hỗ trợ</h3>
                      <p className="mb-2 text-slate-600">support@rokdbot.com</p>
                      <p className="text-sm text-slate-500">Phản hồi trong 2-4 giờ</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-xl bg-blue-100 p-3">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Hotline</h3>
                      <p className="mb-2 text-slate-600">0987.654.321</p>
                      <p className="text-sm text-slate-500">Hỗ trợ 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-xl bg-purple-100 p-3">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Giờ làm việc</h3>
                      <p className="mb-1 text-slate-600">Thứ 2 - CN: 8:00 - 22:00</p>
                      <p className="text-sm text-slate-500">Timezone: GMT+7 (Việt Nam)</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-xl bg-green-100 p-3">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">Địa chỉ</h3>
                      <p className="mb-1 text-slate-600">Hà Nội, Việt Nam</p>
                      <p className="text-sm text-slate-500">Hỗ trợ toàn quốc</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discord & Social */}
              <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="mb-4 text-xl font-bold">🎮 Tham gia cộng đồng</h3>
                <p className="mb-6 opacity-90">
                  Kết nối với 1000+ game thủ RoK, chia sẻ kinh nghiệm và nhận tips miễn phí\!
                </p>
                <div className="space-y-3">
                  <button
                    className="block w-full rounded-lg bg-white/20 px-6 py-3 text-center transition-colors duration-300 hover:bg-white/30"
                    type="button"
                  >
                    🔗 Tham gia Discord Server
                  </button>
                  <button
                    className="block w-full rounded-lg bg-white/20 px-6 py-3 text-center transition-colors duration-300 hover:bg-white/30"
                    type="button"
                  >
                    📱 Follow Facebook Page
                  </button>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="card">
                <h3 className="mb-4 text-xl font-bold text-slate-900">❓ Câu hỏi thường gặp</h3>
                <div className="space-y-3">
                  <button
                    className="block text-left text-amber-600 transition-colors hover:text-amber-700"
                    type="button"
                  >
                    → Dịch vụ có an toàn không?
                  </button>
                  <button
                    className="block text-left text-amber-600 transition-colors hover:text-amber-700"
                    type="button"
                  >
                    → Thời gian hoàn thành dịch vụ?
                  </button>
                  <button
                    className="block text-left text-amber-600 transition-colors hover:text-amber-700"
                    type="button"
                  >
                    → Chính sách hoàn tiền?
                  </button>
                  <button
                    className="block text-left text-amber-600 transition-colors hover:text-amber-700"
                    type="button"
                  >
                    → Cách thức thanh toán?
                  </button>
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
