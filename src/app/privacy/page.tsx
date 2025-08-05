'use client'

import { Shield, Eye, Lock, Database, Clock, AlertTriangle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Header Section */}
        <section className="section-padding-y container-max">
          <div className="max-w-4xl mx-auto text-center animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Chính sách bảo mật
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Chính sách bảo mật thông tin
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Cam kết bảo vệ thông tin cá nhân và dữ liệu của khách hàng một cách tuyệt đối
            </p>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Clock className="h-4 w-4" />
              <span>Cập nhật lần cuối: 04 Tháng 8, 2025</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding container-max">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="prose prose-lg max-w-none text-slate-700">
                
                {/* Introduction */}
                <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500 mb-8">
                  <div className="flex items-start gap-3">
                    <Lock className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-green-800 mb-2">Cam kết bảo mật</h3>
                      <p className="text-green-700 mb-0">
                        RoK Services cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                        Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và 
                        bảo vệ thông tin của bạn khi sử dụng dịch vụ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy sections */}
                <div className="space-y-8">
                  
                  {/* Section 1 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      1. Thông tin chúng tôi thu thập
                    </h2>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">1.1 Thông tin cá nhân</h3>
                    <p>Khi bạn đăng ký và sử dụng dịch vụ, chúng tôi có thể thu thập:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Họ tên đầy đủ</li>
                      <li>Địa chỉ email</li>
                      <li>Số điện thoại</li>
                      <li>Thông tin thanh toán (được mã hóa)</li>
                      <li>Địa chỉ IP và thiết bị sử dụng</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">1.2 Thông tin game</h3>
                    <p>Để cung cấp dịch vụ tốt nhất, chúng tôi có thể thu thập:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Thông tin tài khoản Rise of Kingdoms (Governor ID, Kingdom, Power)</li>
                      <li>Lịch sử chơi game và thành tích</li>
                      <li>Thông tin liên minh và vai trò</li>
                      <li>Screenshots và video liên quan đến dịch vụ</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">1.3 Thông tin tự động</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Cookies và dữ liệu phiên làm việc</li>
                      <li>Thông tin trình duyệt và hệ điều hành</li>
                      <li>Thời gian truy cập và hoạt động trên website</li>
                      <li>Địa chỉ IP và location (nếu được phép)</li>
                    </ul>
                  </section>

                  {/* Section 2 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      2. Mục đích sử dụng thông tin
                    </h2>
                    <p>Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:</p>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">2.1 Cung cấp dịch vụ</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Phân tích và tư vấn tài khoản game</li>
                      <li>Cung cấp hỗ trợ và coaching</li>
                      <li>Thực hiện các dịch vụ đã thanh toán</li>
                      <li>Liên lạc về tiến độ và kết quả</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">2.2 Cải thiện dịch vụ</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Phân tích hiệu quả các phương pháp</li>
                      <li>Tùy chỉnh dịch vụ theo nhu cầu</li>
                      <li>Phát triển tính năng mới</li>
                      <li>Đào tạo đội ngũ chuyên gia</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">2.3 Liên lạc và hỗ trợ</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Gửi thông báo về dịch vụ</li>
                      <li>Hỗ trợ kỹ thuật và giải đáp thắc mắc</li>
                      <li>Thông báo cập nhật và khuyến mãi</li>
                      <li>Tự vấn về các dịch vụ phù hợp</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">2.4 Bảo mật và tuân thủ</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Xác minh danh tính và ngăn chặn gian lận</li>
                      <li>Tuân thủ các quy định pháp luật</li>
                      <li>Bảo vệ quyền lợi của khách hàng và công ty</li>
                      <li>Phân tích bảo mật và phát hiện rủi ro</li>
                    </ul>
                  </section>

                  {/* Section 3 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      3. Cách chúng tôi bảo vệ thông tin
                    </h2>
                    
                    <div className="bg-blue-50 p-6 rounded-xl mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Database className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-blue-800">Biện pháp bảo mật kỹ thuật</h3>
                      </div>
                      <ul className="list-disc pl-6 space-y-2 text-blue-700">
                        <li>Mã hóa dữ liệu SSL/TLS 256-bit</li>
                        <li>Lưu trữ trên server được bảo vệ</li>
                        <li>Backup định kỳ và phục hồi dữ liệu</li>
                        <li>Giám sát 24/7 và cảnh báo bảo mật</li>
                        <li>Cập nhật bảo mật định kỳ</li>
                      </ul>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">3.1 Biện pháp quản lý</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Phân quyền truy cập dữ liệu theo vai trò</li>
                      <li>Đào tạo nhân viên về bảo mật thông tin</li>
                      <li>Kiểm tra nội bộ định kỳ</li>
                      <li>Hợp đồng bảo mật với đối tác</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">3.2 Biện pháp vật lý</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Server đặt tại data center có chứng nhận</li>
                      <li>Kiểm soát ra vào nghiêm ngặt</li>
                      <li>Camera giám sát và hệ thống báo động</li>
                      <li>Dự phòng điện và hạ tầng mạng</li>
                    </ul>
                  </section>

                  {/* Section 4 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      4. Chia sẻ thông tin với bên thứ ba
                    </h2>
                    <p className="mb-4">
                      Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc trao đổi thông tin cá nhân 
                      của bạn cho bên thứ ba vì mục đích thương mại. Thông tin chỉ được chia sẻ trong 
                      các trường hợp sau:
                    </p>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">4.1 Nhà cung cấp dịch vụ</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Dịch vụ thanh toán (MoMo, Banking, VNPay, ZaloPay)</li>
                      <li>Dịch vụ email và thông báo</li>
                      <li>Dịch vụ cloud và lưu trữ dữ liệu</li>
                      <li>Dịch vụ phân tích và thống kê (dữ liệu được ẩn danh)</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">4.2 Yêu cầu pháp lý</h3>
                    <p>Chúng tôi có thể tiết lộ thông tin khi:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Có lệnh của tòa án hoặc cơ quan chức năng</li>
                      <li>Cần thiết để bảo vệ quyền lợi hợp pháp</li>
                      <li>Nghi ngờ hoạt động bất hợp pháp</li>
                      <li>Bảo vệ an toàn của khách hàng khác</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">4.3 Sự đồng ý của bạn</h3>
                    <p>
                      Trong mọi trường hợp khác, chúng tôi sẽ xin phép bạn trước khi chia sẻ 
                      thông tin với bên thứ ba.
                    </p>
                  </section>

                  {/* Section 5 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      5. Quyền của bạn
                    </h2>
                    <p className="mb-4">Bạn có các quyền sau đối với thông tin cá nhân:</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-bold text-amber-800 mb-2">🔍 Quyền truy cập</h4>
                        <p className="text-amber-700 text-sm">
                          Yêu cầu xem thông tin cá nhân mà chúng tôi lưu trữ về bạn
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-800 mb-2">✏️ Quyền chỉnh sửa</h4>
                        <p className="text-blue-700 text-sm">
                          Yêu cầu cập nhật hoặc sửa đổi thông tin không chính xác
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-800 mb-2">🗑️ Quyền xóa</h4>
                        <p className="text-red-700 text-sm">
                          Yêu cầu xóa thông tin cá nhân (trong một số trường hợp)
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-800 mb-2">⛔ Quyền hạn chế</h4>
                        <p className="text-purple-700 text-sm">
                          Yêu cầu hạn chế xử lý thông tin cá nhân
                        </p>
                      </div>
                    </div>

                    <p>
                      Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email 
                      <strong> privacy@rokdbot.com</strong> hoặc form liên hệ trên website.
                    </p>
                  </section>

                  {/* Section 6 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      6. Cookies và Tracking
                    </h2>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">6.1 Cookies cần thiết</h3>
                    <p className="mb-4">
                      Chúng tôi sử dụng cookies để duy trì phiên đăng nhập và cải thiện trải nghiệm 
                      người dùng. Bạn có thể tắt cookies trong trình duyệt nhưng có thể ảnh hưởng 
                      đến chức năng của website.
                    </p>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">6.2 Analytics</h3>
                    <p className="mb-4">
                      Chúng tôi sử dụng Google Analytics để hiểu cách khách hàng sử dụng website 
                      (dữ liệu được ẩn danh). Bạn có thể opt-out bằng cách cài đặt 
                      Google Analytics Opt-out Browser Add-on.
                    </p>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">6.3 Quản lý cookies</h3>
                    <p>
                      Bạn có thể quản lý tùy chọn cookies thông qua cài đặt trình duyệt hoặc 
                      banner cookies trên website của chúng tôi.
                    </p>
                  </section>

                  {/* Section 7 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      7. Lưu trữ và xóa dữ liệu
                    </h2>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">7.1 Thời gian lưu trữ</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong>Thông tin tài khoản:</strong> Cho đến khi bạn yêu cầu xóa</li>
                      <li><strong>Lịch sử dịch vụ:</strong> 3 năm sau khi hoàn thành</li>
                      <li><strong>Thông tin thanh toán:</strong> 5 năm (theo quy định pháp luật)</li>
                      <li><strong>Logs và analytics:</strong> 1 năm</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-900 mb-3">7.2 Xóa dữ liệu tự động</h3>
                    <p>
                      Hệ thống sẽ tự động xóa dữ liệu hết hạn và thông báo cho bạn trước khi xóa 
                      dữ liệu quan trọng.
                    </p>
                  </section>

                  {/* Section 8 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      8. Trẻ em và Quyền riêng tư
                    </h2>
                    <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-500">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-bold text-orange-800 mb-2">Lưu ý về độ tuổi</h3>
                          <p className="text-orange-700 mb-4">
                            Dịch vụ của chúng tôi dành cho người từ 16 tuổi trở lên. Chúng tôi không 
                            cố ý thu thập thông tin từ trẻ em dưới 16 tuổi.
                          </p>
                          <p className="text-orange-700 mb-0">
                            Nếu bạn là phụ huynh và phát hiện con mình đã cung cấp thông tin cho chúng tôi, 
                            vui lòng liên hệ để chúng tôi xóa thông tin đó.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      9. Cập nhật Chính sách
                    </h2>
                    <p className="mb-4">
                      Chúng tôi có thể cập nhật chính sách bảo mật này định kỳ để phản ánh 
                      những thay đổi trong dịch vụ hoặc luật pháp.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Thông báo qua email cho tất cả khách hàng</li>
                      <li>Đăng thông báo trên website ít nhất 30 ngày trước</li>
                      <li>Giữ nguyên phiên bản cũ cho đến khi có hiệu lực</li>
                      <li>Ghi rõ ngày cập nhật cuối cùng</li>
                    </ul>
                  </section>

                  {/* Section 10 */}
                  <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      10. Liên hệ
                    </h2>
                    <p className="mb-4">
                      Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc cách chúng tôi 
                      xử lý thông tin cá nhân của bạn, vui lòng liên hệ:
                    </p>
                    
                    <div className="bg-slate-50 p-6 rounded-xl">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">📧 Email chuyên về bảo mật</h4>
                          <p className="text-slate-600">privacy@rokdbot.com</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">📞 Hotline hỗ trợ</h4>
                          <p className="text-slate-600">0987.654.321</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">📬 Địa chỉ</h4>
                          <p className="text-slate-600">Hà Nội, Việt Nam</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">⏰ Thời gian phản hồi</h4>
                          <p className="text-slate-600">Trong vòng 24-48 giờ</p>
                        </div>
                      </div>
                    </div>
                  </section>

                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="bg-green-50 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-bold text-slate-900">Cam kết minh bạch</h3>
                    </div>
                    <p className="text-slate-600 mb-4">
                      Chúng tôi cam kết xử lý thông tin của bạn một cách minh bạch, có trách nhiệm 
                      và luôn đặt quyền riêng tư của bạn lên hàng đầu. Mọi thay đổi trong chính sách 
                      sẽ được thông báo rõ ràng và kịp thời.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="/contact"
                        className="btn-primary text-center"
                      >
                        Liên hệ về bảo mật
                      </a>
                      <a
                        href="/terms"
                        className="btn-secondary text-center"
                      >
                        Xem điều khoản dịch vụ
                      </a>
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