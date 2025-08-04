import Link from 'next/link'
import { ArrowRight, Star, Users, Trophy, Crown, Sparkles, Shield } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero section-padding">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 animate-float">
          <Crown className="h-8 w-8 text-amber-400/30" />
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
          <Shield className="h-6 w-6 text-blue-400/30" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '4s' }}>
          <Sparkles className="h-10 w-10 text-amber-300/20" />
        </div>
        <div className="absolute top-60 left-1/2 animate-float" style={{ animationDelay: '1s' }}>
          <Crown className="h-6 w-6 text-amber-500/20" />
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30"></div>

      <div className="container-max relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-sm">
              <Crown className="w-4 h-4 mr-2" />
              #1 Dịch vụ RoK tại Việt Nam
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Dịch vụ chuyên nghiệp cho{' '}
            <span className="text-gradient animate-glow block mt-2">Rise of Kingdoms</span>
          </h1>
          
          <p className="mt-8 text-xl leading-8 text-slate-300 max-w-4xl mx-auto">
            Nâng cao trải nghiệm chơi game của bạn với các dịch vụ chuyên nghiệp từ đội ngũ 
            <span className="text-amber-400 font-semibold"> top player hàng đầu Việt Nam</span>: 
            tư vấn chiến thuật, quản lý liên minh, training commander và nhiều hơn nữa.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/services" className="btn-primary flex items-center space-x-3 text-lg px-8 py-4">
              <span>Khám phá dịch vụ</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/guides" className="btn-secondary text-lg px-8 py-4">
              Hướng dẫn miễn phí
            </Link>
          </div>
        </div>

        {/* Premium Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="glassmorphism p-8 hover-lift">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2 animate-pulse-slow">1000+</div>
              <div className="text-lg text-slate-300 font-medium">Khách hàng tin tưởng</div>
              <div className="text-sm text-amber-400 mt-2">Đánh giá 5 sao</div>
            </div>
          </div>
          
          <div className="text-center group">
            <div className="glassmorphism p-8 hover-lift">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2 animate-pulse-slow">500+</div>
              <div className="text-lg text-slate-300 font-medium">Liên minh được hỗ trợ</div>
              <div className="text-sm text-blue-400 mt-2">Top Kingdom</div>
            </div>
          </div>
          
          <div className="text-center group">
            <div className="glassmorphism p-8 hover-lift">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2 animate-pulse-slow">4.9/5</div>
              <div className="text-lg text-slate-300 font-medium">Đánh giá trung bình</div>
              <div className="text-sm text-amber-400 mt-2">Từ 2000+ reviews</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm mb-4">Được tin tưởng bởi các Top Alliance:</p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-500">
            <span className="font-semibold">VN01 • VN02 • VN03 • VN04 • VN05</span>
          </div>
        </div>
      </div>
    </section>
  )
}
