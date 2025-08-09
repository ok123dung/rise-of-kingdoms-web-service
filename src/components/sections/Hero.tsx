import { ArrowRight, Star, Users, Trophy, Crown, Sparkles, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-hero section-padding relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="animate-float absolute left-10 top-20">
          <Crown className="h-8 w-8 text-amber-400/30" />
        </div>
        <div className="animate-float absolute right-20 top-40" style={{ animationDelay: '2s' }}>
          <Shield className="h-6 w-6 text-blue-400/30" />
        </div>
        <div className="animate-float absolute bottom-32 left-20" style={{ animationDelay: '4s' }}>
          <Sparkles className="h-10 w-10 text-amber-300/20" />
        </div>
        <div className="animate-float absolute left-1/2 top-60" style={{ animationDelay: '1s' }}>
          <Crown className="h-6 w-6 text-amber-500/20" />
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30" />

      <div className="container-max relative z-10">
        <div className="animate-fadeInUp text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 backdrop-blur-sm">
              <Crown className="mr-2 h-4 w-4" />
              #1 Dịch vụ RoK tại Việt Nam
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
            Dịch vụ chuyên nghiệp cho{' '}
            <span className="text-gradient animate-glow mt-2 block">Rise of Kingdoms</span>
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-xl leading-8 text-slate-300">
            Nâng cao trải nghiệm chơi game của bạn với các dịch vụ chuyên nghiệp từ đội ngũ
            <span className="font-semibold text-amber-400"> top player hàng đầu Việt Nam</span>: tư
            vấn chiến thuật, quản lý liên minh, training commander và nhiều hơn nữa.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg"
              href="/services"
            >
              <span>Khám phá dịch vụ</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link className="btn-secondary px-8 py-4 text-lg" href="/guides">
              Hướng dẫn miễn phí
            </Link>
          </div>
        </div>

        {/* Premium Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="group text-center">
            <div className="glassmorphism hover-lift p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">1000+</div>
              <div className="text-lg font-medium text-slate-300">Khách hàng tin tưởng</div>
              <div className="mt-2 text-sm text-amber-400">Đánh giá 5 sao</div>
            </div>
          </div>

          <div className="group text-center">
            <div className="glassmorphism hover-lift p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 transition-transform duration-300 group-hover:scale-110">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">500+</div>
              <div className="text-lg font-medium text-slate-300">Liên minh được hỗ trợ</div>
              <div className="mt-2 text-sm text-blue-400">Top Kingdom</div>
            </div>
          </div>

          <div className="group text-center">
            <div className="glassmorphism hover-lift p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 transition-transform duration-300 group-hover:scale-110">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="animate-pulse-slow mb-2 text-4xl font-bold text-white">4.9/5</div>
              <div className="text-lg font-medium text-slate-300">Đánh giá trung bình</div>
              <div className="mt-2 text-sm text-amber-400">Từ 2000+ reviews</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-sm text-slate-400">Được tin tưởng bởi các Top Alliance:</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-500">
            <span className="font-semibold">VN01 • VN02 • VN03 • VN04 • VN05</span>
          </div>
        </div>
      </div>
    </section>
  )
}
