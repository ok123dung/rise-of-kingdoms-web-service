'use client'

import { Shield, FileText, Clock, AlertCircle } from 'lucide-react'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Header Section */}
        <section className="section-padding-y container-max">
          <div className="animate-fadeInUp mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
              <FileText className="h-4 w-4" />
              Điều khoản dịch vụ
            </div>

            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
              Điều khoản sử dụng dịch vụ
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-slate-600">
              Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ của RoK Services
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Cập nhật lần cuối: 04 Tháng 8, 2025</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding container-max">
          <div className="mx-auto max-w-4xl">
            <div className="card">
              <div className="prose prose-lg max-w-none text-slate-700">
                {/* Introduction */}
                <div className="mb-8 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-amber-800">Lưu ý quan trọng</h3>
                      <p className="mb-0 text-amber-700">
                        Bằng cách sử dụng dịch vụ của RoK Services, bạn đồng ý tuân thủ và bị ràng
                        buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất
                        kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng
                        tôi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms sections */}
                <div className="space-y-8">
                  {/* Section 1 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      1. Định nghĩa và Giải thích
                    </h2>
                    <div className="space-y-4">
                      <p>
                        <strong>"RoK Services"</strong> hoặc <strong>"Chúng tôi"</strong> có nghĩa
                        là công ty cung cấp dịch vụ tư vấn và hỗ trợ chuyên nghiệp cho game Rise of
                        Kingdoms.
                      </p>
                      <p>
                        <strong>"Khách hàng"</strong> hoặc <strong>"Bạn"</strong> có nghĩa là bất kỳ
                        cá nhân hoặc tổ chức nào sử dụng dịch vụ của chúng tôi.
                      </p>
                      <p>
                        <strong>"Dịch vụ"</strong> bao gồm tất cả các loại hình tư vấn, hỗ trợ và
                        dịch vụ liên quan đến Rise of Kingdoms được cung cấp bởi RoK Services.
                      </p>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">2. Phạm vi Dịch vụ</h2>
                    <div className="space-y-4">
                      <p>
                        RoK Services cung cấp các dịch vụ tư vấn và hỗ trợ chuyên nghiệp cho game
                        Rise of Kingdoms, bao gồm nhưng không giới hạn:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Tư vấn chiến thuật và phát triển tài khoản</li>
                        <li>Hướng dẫn quản lý liên minh</li>
                        <li>Hỗ trợ KvK (Kingdom vs Kingdom)</li>
                        <li>Training commander và formation</li>
                        <li>Coaching cá nhân 1-on-1</li>
                        <li>Các dịch vụ VIP và premium khác</li>
                      </ul>
                      <p>
                        Tất cả các dịch vụ được thực hiện thông qua các phương pháp hợp pháp và an
                        toàn, không vi phạm Terms of Service của game Rise of Kingdoms.
                      </p>
                    </div>
                  </section>

                  {/* Section 3 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      3. Nghĩa vụ của Khách hàng
                    </h2>
                    <div className="space-y-4">
                      <p>Khi sử dụng dịch vụ, khách hàng cam kết:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Cung cấp thông tin chính xác và đầy đủ về tài khoản game</li>
                        <li>Thanh toán đầy đủ và đúng hạn theo thỏa thuận</li>
                        <li>Tuân thủ hướng dẫn và khuyến nghị từ đội ngũ chuyên gia</li>
                        <li>Không chia sẻ thông tin dịch vụ cho bên thứ ba không được phép</li>
                        <li>Sử dụng dịch vụ một cách có trách nhiệm và hợp pháp</li>
                        <li>Thông báo kịp thời nếu có vấn đề hoặc thay đổi yêu cầu</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 4 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      4. Nghĩa vụ của RoK Services
                    </h2>
                    <div className="space-y-4">
                      <p>Chúng tôi cam kết:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Cung cấp dịch vụ chất lượng cao theo đúng mô tả</li>
                        <li>Bảo mật thông tin khách hàng một cách tuyệt đối</li>
                        <li>Hỗ trợ khách hàng 24/7 qua các kênh liên lạc chính thức</li>
                        <li>Sử dụng các phương pháp an toàn, không risk tài khoản khách hàng</li>
                        <li>Cung cấp báo cáo tiến độ định kỳ theo thỏa thuận</li>
                        <li>Hoàn tiền trong trường hợp không đạt được kết quả cam kết</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 5 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      5. Thanh toán và Hoàn tiền
                    </h2>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">5.1 Thanh toán</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Thanh toán phải được thực hiện trước khi bắt đầu dịch vụ</li>
                        <li>Chúng tôi chấp nhận thanh toán qua MoMo, Banking, VNPay, ZaloPay</li>
                        <li>Giá dịch vụ đã bao gồm VAT (nếu có)</li>
                        <li>Mọi phí phát sinh sẽ được thông báo trước khi áp dụng</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-slate-900">
                        5.2 Chính sách hoàn tiền
                      </h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>
                          Hoàn tiền 100% nếu dịch vụ không được bắt đầu trong 24h sau thanh toán
                        </li>
                        <li>Hoàn tiền 50% nếu khách hàng hủy dịch vụ trong 48h đầu</li>
                        <li>Hoàn tiền theo tỷ lệ % hoàn thành công việc nếu hủy giữa chừng</li>
                        <li>
                          Hoàn tiền 100% nếu không đạt được KPI cam kết (áp dụng cho một số dịch vụ)
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 6 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      6. Bảo mật và Quyền riêng tư
                    </h2>
                    <div className="space-y-4">
                      <p>
                        Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu game của khách hàng:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Mọi thông tin được mã hóa và lưu trữ an toàn</li>
                        <li>Không chia sẻ thông tin khách hàng cho bên thứ ba</li>
                        <li>Chỉ sử dụng thông tin cho mục đích cung cấp dịch vụ</li>
                        <li>Khách hàng có quyền yêu cầu xóa dữ liệu cá nhân</li>
                        <li>Thông báo ngay lập tức nếu có sự cố bảo mật</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 7 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      7. Giới hạn Trách nhiệm
                    </h2>
                    <div className="space-y-4">
                      <p>RoK Services không chịu trách nhiệm trong các trường hợp sau:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Khách hàng cung cấp thông tin sai lệch hoặc không đầy đủ</li>
                        <li>Khách hàng không tuân thủ hướng dẫn của đội ngũ chuyên gia</li>
                        <li>Các thay đổi trong game ảnh hưởng đến hiệu quả dịch vụ</li>
                        <li>Sự cố kỹ thuật từ phía game hoặc nhà cung cấp dịch vụ internet</li>
                        <li>Hành vi vi phạm Terms of Service của game từ phía khách hàng</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 8 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">8. Chấm dứt Dịch vụ</h2>
                    <div className="space-y-4">
                      <p>Chúng tôi có quyền chấm dứt dịch vụ trong các trường hợp:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Khách hàng vi phạm điều khoản sử dụng</li>
                        <li>Khách hàng không thanh toán đúng hạn</li>
                        <li>Phát hiện hành vi gian lận hoặc lừa đảo</li>
                        <li>Yêu cầu thực hiện các hành vi bất hợp pháp</li>
                        <li>Khách hàng có thái độ không tôn trọng đội ngũ nhân viên</li>
                      </ul>
                    </div>
                  </section>

                  {/* Section 9 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">
                      9. Giải quyết Tranh chấp
                    </h2>
                    <div className="space-y-4">
                      <p>Mọi tranh chấp phát sinh sẽ được giải quyết theo thứ tự:</p>
                      <ol className="list-decimal space-y-2 pl-6">
                        <li>Thương lượng trực tiếp giữa hai bên</li>
                        <li>Hòa giải thông qua bên thứ ba trung lập</li>
                        <li>Giải quyết tại Tòa án có thẩm quyền tại Việt Nam</li>
                      </ol>
                      <p>Luật pháp Việt Nam sẽ được áp dụng để giải quyết mọi tranh chấp.</p>
                    </div>
                  </section>

                  {/* Section 10 */}
                  <section>
                    <h2 className="mb-4 text-2xl font-bold text-slate-900">10. Điều khoản Chung</h2>
                    <div className="space-y-4">
                      <ul className="list-disc space-y-2 pl-6">
                        <li>
                          <strong>Sửa đổi điều khoản:</strong> Chúng tôi có quyền cập nhật các điều
                          khoản này. Khách hàng sẽ được thông báo qua email hoặc website ít nhất 7
                          ngày trước khi có hiệu lực.
                        </li>
                        <li>
                          <strong>Tính độc lập:</strong> Nếu bất kỳ điều khoản nào bị coi là không
                          hợp lệ, các điều khoản còn lại vẫn có hiệu lực đầy đủ.
                        </li>
                        <li>
                          <strong>Ngôn ngữ:</strong> Phiên bản tiếng Việt của điều khoản này có giá
                          trị pháp lý chính thức.
                        </li>
                        <li>
                          <strong>Liên hệ:</strong> Mọi thắc mắc về điều khoản vui lòng liên hệ
                          support@rokdbot.com
                        </li>
                      </ul>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="mt-12 border-t border-slate-200 pt-8">
                  <div className="rounded-xl bg-slate-50 p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <Shield className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-bold text-slate-900">Cam kết của chúng tôi</h3>
                    </div>
                    <p className="mb-4 text-slate-600">
                      RoK Services cam kết cung cấp dịch vụ minh bạch, chất lượng và an toàn cho tất
                      cả khách hàng. Chúng tôi luôn sẵn sàng lắng nghe và cải thiện dịch vụ dựa trên
                      phản hồi của bạn.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <a className="btn-primary text-center" href="/contact">
                        Liên hệ hỗ trợ
                      </a>
                      <a className="btn-secondary text-center" href="/privacy">
                        Xem chính sách bảo mật
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
