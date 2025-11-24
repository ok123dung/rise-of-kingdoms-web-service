import { ArrowRight, Users, Trophy, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative flex min-h-[600px] flex-col items-center justify-center gap-6 overflow-hidden bg-background-dark p-4 text-center">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.8) 70%), linear-gradient(45deg, rgba(242, 208, 13, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGGc-UZ_JN1G7xhJV_Q4nhjG7EPrwx-NTCDKuyvmCT9_Y9geIJbDlbgHLukE1TYvo8d3RvQeJ_nK6UBdC_vNF23iNG6dQfY4caKXuQZ7dN44zxEnQQUxIUWAaBMFcqlm2utMgSrC48F8fScMyKMd4kxrShvssNWpINK7DoAYojWtOFGOBLX49YGJen1tBaEyn1DQ2WZDC1VLzekgD7jvNpVL7Ls6WsNXag1avC2SckrVe6daTmlPk-Gu6hogUUrmNOps_vJNl8jWQ")`
        }}
      />

      <div className="relative z-10 mt-16 flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
          Chinh Phục Mọi Vương Quốc Cùng Chuyên Gia Hàng Đầu
        </h1>
        <h2 className="text-base font-normal leading-normal text-gray-300 md:text-xl">
          Dịch vụ kết nối bạn với các pro-players để tối ưu hóa chiến lược và giành chiến thắng.
        </h2>
      </div>

      <div className="relative z-10 mt-4">
        <Link
          href="/booking"
          className="btn-primary flex min-w-[200px] items-center justify-center gap-2 text-lg"
        >
          <span>Đặt Lịch Ngay</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 mt-12 flex flex-wrap justify-center gap-4 md:mt-20">
        <div className="glassmorphism flex min-w-[160px] flex-1 flex-col items-center gap-2 p-6 text-center">
          <Users className="h-8 w-8 text-primary" />
          <p className="text-base font-medium text-gray-200">Khách hàng hài lòng</p>
          <p className="text-3xl font-bold text-white">1,200+</p>
        </div>
        <div className="glassmorphism flex min-w-[160px] flex-1 flex-col items-center gap-2 p-6 text-center">
          <Shield className="h-8 w-8 text-primary" />
          <p className="text-base font-medium text-gray-200">Alliances đã hợp tác</p>
          <p className="text-3xl font-bold text-white">150+</p>
        </div>
        <div className="glassmorphism flex min-w-[160px] flex-1 flex-col items-center gap-2 p-6 text-center">
          <Trophy className="h-8 w-8 text-primary" />
          <p className="text-base font-medium text-gray-200">Chuyên gia hàng đầu</p>
          <p className="text-3xl font-bold text-white">50+</p>
        </div>
      </div>
    </section>
  )
}
