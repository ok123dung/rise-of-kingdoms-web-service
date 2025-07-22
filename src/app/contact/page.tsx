import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { VietnameseGamingSchema } from '@/components/seo/VietnameseGamingSEO'
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  Users
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Liên hệ - Tư vấn miễn phí dịch vụ Rise of Kingdoms',
  description: 'Liên hệ ngay để được tư vấn miễn phí về dịch vụ Rise of Kingdoms. Phản hồi trong 5 phút, hỗ trợ 24/7 qua Discord, điện thoại và email.',
  keywords: [
    'liên hệ rok services',
    'tư vấn rise of kingdoms',
    'hỗ trợ rok vietnam', 
    'discord rok services',
    'contact rok services',
    'rise of kingdoms support vietnam'
  ],
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <VietnameseGamingSchema />
      
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4">
        <div className="container-max flex items-center justify-center space-x-4 text-sm font-medium">
          <Zap className="h-4 w-4 animate-pulse" />
          <span>🎯 Tư vấn miễn phí 30 phút đầu tiên - Phản hồi trong 5 phút!</span>
          <Zap className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 section-padding">
          <div className="container-max">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                Liên hệ với <span className="text-gradient">chuyên gia RoK</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Được hỗ trợ bởi đội ngũ top 1% players Việt Nam. Tư vấn miễn phí, 
                phản hồi nhanh chóng và cam kết kết quả.
              </p>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5 phút</div>
                  <div className="text-sm text-gray-600">Thời gian phản hồi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Hỗ trợ liên tục</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Khách hàng thành công</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Đặt lịch tư vấn miễn phí
                </h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dịch vụ quan tâm *
                    </label>
                    <select 
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Chọn dịch vụ</option>
                      <option value="strategy">Tư vấn chiến thuật (750k-1.2M VNĐ/tháng)</option>
                      <option value="alliance">Quản lý liên minh (1M VNĐ/tháng)</option>
                      <option value="commander">Training Commander (300k VNĐ/session)</option>
                      <option value="kvk">Hỗ trợ KvK (2M VNĐ/KvK)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thông tin tài khoản RoK
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="VD: Power hiện tại, Kingdom, Level, mục tiêu muốn đạt được..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Gửi yêu cầu tư vấn miễn phí
                  </button>

                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Bảo mật tuyệt đối</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Phản hồi trong 5 phút</span>
                    </div>
                  </div>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Contact Methods */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Liên hệ trực tiếp
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Hotline</h4>
                        <p className="text-gray-600">+84 123 456 789</p>
                        <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Discord</h4>
                        <p className="text-gray-600">discord.gg/rokservices</p>
                        <p className="text-sm text-gray-500">Phản hồi nhanh nhất</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">contact@rokdbot.com</p>
                        <p className="text-sm text-gray-500">Phản hồi trong 1 giờ</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Địa chỉ</h4>
                        <p className="text-gray-600">Hồ Chí Minh, Việt Nam</p>
                        <p className="text-sm text-gray-500">Phục vụ toàn quốc</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-lg p-8 text-white">
                  <h3 className="text-xl font-bold mb-6">
                    Phương thức thanh toán
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>Banking chuyển khoản</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>MoMo (Ví điện tử)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>ZaloPay</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>VNPay</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span>Đảm bảo hoàn tiền 100%</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-300 fill-current" />
                      <span className="font-semibold">4.9/5 từ 200+ đánh giá</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-300" />
                      <span>Cộng đồng 1000+ game thủ</span>
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
